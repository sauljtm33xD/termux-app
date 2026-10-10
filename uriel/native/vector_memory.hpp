// VectorMemory: memoria vectorial local ("ecos").
//
// Cada texto se convierte en un vector normalizado (norma L2 = 1). Recordar es buscar los
// vectores más cercanos por similitud coseno, que con vectores normalizados es el producto punto.
//
// - Sin dependencias externas (solo la biblioteca estándar y POSIX): compila igual en Linux y NDK.
// - El embedder es intercambiable. HashingEmbedder funciona sin modelo ni red, pero es LÉXICO:
//   encuentra textos que comparten palabras o raíces ("memoria"/"memorias", "canción"/"cancion"),
//   no sinónimos ("perro"/"can"). Para similitud de significado se conecta un modelo
//   (p. ej. MiniLM) implementando Embedder, sin cambiar VectorMemory.
// - Persistencia atómica (archivo temporal + fsync + rename) con validación estricta al cargar.
// - Thread-safe: búsquedas concurrentes, escrituras exclusivas y sin inanición del escritor.
// - AuditHook opcional: cada alta/baja se reporta bajo el mismo candado que la modifica, así el
//   orden de la bitácora coincide con el orden real de los cambios (ver AuditLog).
#pragma once

#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

#include <algorithm>
#include <cerrno>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <functional>
#include <memory>
#include <mutex>
#include <shared_mutex>
#include <string>
#include <string_view>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace uriel {

// ---------------------------------------------------------------------------------------------
// Embedder
// ---------------------------------------------------------------------------------------------

class Embedder {
public:
    virtual ~Embedder() = default;
    // Identifica el modelo: un archivo guardado con otro embedder no se puede cargar.
    virtual std::string name() const = 0;
    virtual size_t dim() const = 0;
    // Escribe dim() floats en out. Debe devolver un vector de norma 1, o todo ceros si el
    // texto no tiene contenido útil.
    virtual void embed(std::string_view text, float* out) const = 0;
};

namespace detail {

// Decodifica un code point UTF-8. Devuelve 0xFFFFFFFF y avanza un byte si la secuencia es inválida.
inline uint32_t next_codepoint(std::string_view s, size_t& i) {
    const uint32_t kBad = 0xFFFFFFFFu;
    unsigned char c = static_cast<unsigned char>(s[i]);
    if (c < 0x80) { i++; return c; }
    int n; uint32_t cp, min;
    if ((c & 0xE0) == 0xC0) { n = 1; cp = c & 0x1F; min = 0x80; }
    else if ((c & 0xF0) == 0xE0) { n = 2; cp = c & 0x0F; min = 0x800; }
    else if ((c & 0xF8) == 0xF0) { n = 3; cp = c & 0x07; min = 0x10000; }
    else { i++; return kBad; }
    if (i + n >= s.size()) { i++; return kBad; }  // secuencia cortada al final
    for (int k = 1; k <= n; k++) {
        unsigned char cc = static_cast<unsigned char>(s[i + k]);
        if ((cc & 0xC0) != 0x80) { i++; return kBad; }
        cp = (cp << 6) | (cc & 0x3F);
    }
    if (cp < min || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) { i++; return kBad; }
    i += n + 1;
    return cp;
}

inline void append_utf8(std::string& out, uint32_t cp) {
    if (cp < 0x80) { out += static_cast<char>(cp); }
    else if (cp < 0x800) { out += static_cast<char>(0xC0 | (cp >> 6)); out += static_cast<char>(0x80 | (cp & 0x3F)); }
    else if (cp < 0x10000) {
        out += static_cast<char>(0xE0 | (cp >> 12)); out += static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
        out += static_cast<char>(0x80 | (cp & 0x3F));
    } else {
        out += static_cast<char>(0xF0 | (cp >> 18)); out += static_cast<char>(0x80 | ((cp >> 12) & 0x3F));
        out += static_cast<char>(0x80 | ((cp >> 6) & 0x3F)); out += static_cast<char>(0x80 | (cp & 0x3F));
    }
}

// Minúsculas y sin acentos para el rango latino usado en español. La ñ se conserva
// porque cambia el significado ("año" / "ano"). Devuelve 0 si el code point separa palabras.
inline uint32_t fold(uint32_t cp) {
    if (cp >= 'A' && cp <= 'Z') return cp + 32;
    if ((cp >= 'a' && cp <= 'z') || (cp >= '0' && cp <= '9')) return cp;
    if (cp < 0xC0) return 0;                       // ASCII restante, ¿ ¡ « » etc.
    if (cp == 0xD7 || cp == 0xF7) return 0;         // × ÷
    if (cp <= 0xDE && cp != 0xD7) cp += 0x20;       // Latin-1 mayúsculas -> minúsculas
    switch (cp) {
        case 0xE0: case 0xE1: case 0xE2: case 0xE3: case 0xE4: case 0xE5: return 'a';
        case 0xE7: return 'c';
        case 0xE8: case 0xE9: case 0xEA: case 0xEB: return 'e';
        case 0xEC: case 0xED: case 0xEE: case 0xEF: return 'i';
        case 0xF2: case 0xF3: case 0xF4: case 0xF5: case 0xF6: return 'o';
        case 0xF9: case 0xFA: case 0xFB: case 0xFC: return 'u';
        case 0xFD: case 0xFF: return 'y';
        default: break;
    }
    if (cp >= 0x2000 && cp <= 0x2BFF) return 0;     // puntuación general, flechas, símbolos
    if (cp >= 0x3000 && cp <= 0x303F) return 0;     // puntuación CJK
    if (cp >= 0x1F000) return 0;                    // emoji y pictogramas
    return cp;                                      // otras letras (otros alfabetos)
}

inline uint64_t fnv1a(std::string_view s, uint64_t seed) {
    uint64_t h = 0xcbf29ce484222325ULL ^ seed;
    for (unsigned char c : s) { h ^= c; h *= 0x100000001b3ULL; }
    // Mezcla final (splitmix64) para repartir bien bits altos y bajos.
    h ^= h >> 30; h *= 0xbf58476d1ce4e5b9ULL;
    h ^= h >> 27; h *= 0x94d049bb133111ebULL;
    h ^= h >> 31;
    return h;
}

}  // namespace detail

// Embedder léxico por "feature hashing" con signo:
//   - palabras (peso 1.0), pares de palabras consecutivas (0.6), trigramas de letras (0.25).
//   - Los trigramas dan tolerancia a plurales, conjugaciones y errores de dedo.
//   - Se ignoran palabras vacías del español ("de", "la", "que"...).
class HashingEmbedder final : public Embedder {
public:
    explicit HashingEmbedder(size_t dim = 512) : dim_(dim < 64 ? 64 : dim) {}

    std::string name() const override { return "uriel-hash-v1"; }
    size_t dim() const override { return dim_; }

    // Tokens normalizados (minúsculas, sin acentos, sin palabras vacías). Público para pruebas.
    static std::vector<std::string> tokenize(std::string_view text) {
        std::vector<std::string> tokens;
        std::string cur;
        auto flush = [&] {
            if (!cur.empty() && !is_stopword(cur)) tokens.push_back(cur);
            cur.clear();
        };
        size_t i = 0;
        while (i < text.size()) {
            uint32_t cp = detail::next_codepoint(text, i);
            uint32_t f = (cp == 0xFFFFFFFFu) ? 0 : detail::fold(cp);
            if (f == 0) flush(); else detail::append_utf8(cur, f);
        }
        flush();
        return tokens;
    }

    void embed(std::string_view text, float* out) const override {
        std::fill(out, out + dim_, 0.0f);
        std::vector<std::string> tokens = tokenize(text);

        for (size_t t = 0; t < tokens.size(); t++) {
            add(out, tokens[t], kSeedWord, 1.0f);
            if (t + 1 < tokens.size()) add(out, tokens[t] + ' ' + tokens[t + 1], kSeedPair, 0.6f);

            // Trigramas de code points sobre "#palabra#".
            std::vector<std::string> cps;
            cps.emplace_back("#");
            size_t i = 0;
            while (i < tokens[t].size()) {
                size_t start = i;
                detail::next_codepoint(tokens[t], i);
                cps.emplace_back(tokens[t].substr(start, i - start));
            }
            cps.emplace_back("#");
            for (size_t k = 0; k + 2 < cps.size(); k++) {
                add(out, cps[k] + cps[k + 1] + cps[k + 2], kSeedTrigram, 0.25f);
            }
        }

        double norm = 0;
        for (size_t d = 0; d < dim_; d++) norm += static_cast<double>(out[d]) * out[d];
        if (norm <= 0) return;  // sin contenido: vector cero
        float inv = static_cast<float>(1.0 / std::sqrt(norm));
        for (size_t d = 0; d < dim_; d++) out[d] *= inv;
    }

private:
    static constexpr uint64_t kSeedWord = 0x1;
    static constexpr uint64_t kSeedPair = 0x2;
    static constexpr uint64_t kSeedTrigram = 0x3;

    void add(float* out, std::string_view feature, uint64_t seed, float weight) const {
        uint64_t h = detail::fnv1a(feature, seed);
        size_t idx = static_cast<size_t>(h % dim_);
        out[idx] += (h >> 63) ? -weight : weight;
    }

    static bool is_stopword(const std::string& w) {
        static const std::unordered_set<std::string> kStop = {
            "a", "al", "ante", "con", "como", "de", "del", "el", "ella", "ellos", "en", "es", "esa",
            "ese", "eso", "esta", "este", "esto", "fue", "ha", "la", "las", "le", "les", "lo", "los",
            "me", "mi", "mis", "muy", "ni", "no", "nos", "o", "para", "pero", "por", "que", "se",
            "si", "sin", "su", "sus", "te", "tu", "un", "una", "uno", "unos", "unas", "y", "ya",
            "the", "of", "and", "to", "is", "in", "it", "on", "for", "an",
        };
        return kStop.count(w) != 0;
    }

    size_t dim_;
};

// ---------------------------------------------------------------------------------------------
// VectorMemory
// ---------------------------------------------------------------------------------------------

class VectorMemory {
public:
    enum class Op { Add, Remove };
    // Se llama con el candado de escritura tomado: no debe llamar de vuelta a VectorMemory.
    using AuditHook = std::function<void(Op op, uint64_t id, std::string_view text)>;

    struct Hit {
        uint64_t id;
        float score;  // similitud coseno en [-1, 1]
        std::string text;
    };

    static constexpr uint32_t kMaxTextBytes = 1u << 20;  // 1 MiB por recuerdo

    explicit VectorMemory(std::shared_ptr<const Embedder> embedder)
        : embedder_(std::move(embedder)), dim_(embedder_->dim()) {}

    void set_audit_hook(AuditHook hook) {
        auto lock = write_lock();
        audit_ = std::move(hook);
    }

    // Guarda un recuerdo. Devuelve su id (>= 1), o 0 si el texto es demasiado grande.
    uint64_t add(std::string_view text) {
        if (text.size() > kMaxTextBytes) return 0;
        std::vector<float> v(dim_);
        embedder_->embed(text, v.data());  // fuera del candado: puede ser lento con un modelo real

        auto lock = write_lock();
        uint64_t id = next_id_++;
        index_[id] = ids_.size();
        ids_.push_back(id);
        texts_.emplace_back(text);
        vecs_.insert(vecs_.end(), v.begin(), v.end());
        if (audit_) audit_(Op::Add, id, text);
        return id;
    }

    bool remove(uint64_t id) {
        auto lock = write_lock();
        auto it = index_.find(id);
        if (it == index_.end()) return false;
        size_t pos = it->second, last = ids_.size() - 1;
        if (audit_) audit_(Op::Remove, id, texts_[pos]);
        if (pos != last) {  // mover el último a la posición liberada
            ids_[pos] = ids_[last];
            texts_[pos] = std::move(texts_[last]);
            std::copy(vecs_.begin() + last * dim_, vecs_.begin() + (last + 1) * dim_, vecs_.begin() + pos * dim_);
            index_[ids_[pos]] = pos;
        }
        ids_.pop_back();
        texts_.pop_back();
        vecs_.resize(ids_.size() * dim_);
        index_.erase(id);
        return true;
    }

    // Los k recuerdos más parecidos con score >= min_score, de mayor a menor.
    // A igual score gana el id menor (resultado determinista).
    std::vector<Hit> search(std::string_view query, size_t k, float min_score = 0.0f) const {
        std::vector<float> q(dim_);
        embedder_->embed(query, q.data());

        auto lock = read_lock();
        std::vector<std::pair<float, size_t>> scored;
        scored.reserve(ids_.size());
        for (size_t i = 0; i < ids_.size(); i++) {
            const float* v = &vecs_[i * dim_];
            float dot = 0;
            for (size_t d = 0; d < dim_; d++) dot += q[d] * v[d];
            if (dot >= min_score) scored.emplace_back(dot, i);
        }
        size_t n = std::min(k, scored.size());
        auto better = [&](const std::pair<float, size_t>& a, const std::pair<float, size_t>& b) {
            if (a.first != b.first) return a.first > b.first;
            return ids_[a.second] < ids_[b.second];
        };
        std::partial_sort(scored.begin(), scored.begin() + static_cast<std::ptrdiff_t>(n), scored.end(), better);

        std::vector<Hit> hits;
        hits.reserve(n);
        for (size_t i = 0; i < n; i++) hits.push_back({ids_[scored[i].second], scored[i].first, texts_[scored[i].second]});
        return hits;
    }

    bool get(uint64_t id, std::string* text) const {
        auto lock = read_lock();
        auto it = index_.find(id);
        if (it == index_.end()) return false;
        if (text) *text = texts_[it->second];
        return true;
    }

    size_t size() const {
        auto lock = read_lock();
        return ids_.size();
    }

    // ---- Persistencia ------------------------------------------------------------------------
    //
    // Formato v1 (little-endian):
    //   "URVM" | version u32 | name_len u32 | name | dim u32 | next_id u64 | count u64
    //   count × ( id u64 | text_len u32 | text | dim × float32 )
    //   crc32 u32 de todo lo anterior
    //
    // El CRC detecta corrupción accidental. Para detectar alteraciones intencionales, registra
    // las altas y bajas en AuditLog con set_audit_hook().

    bool save(const std::string& path, std::string* error = nullptr) const {
        std::string buf;
        {
            auto lock = read_lock();
            std::string name = embedder_->name();
            buf.append("URVM", 4);
            put32(buf, kVersion);
            put32(buf, static_cast<uint32_t>(name.size()));
            buf.append(name);
            put32(buf, static_cast<uint32_t>(dim_));
            put64(buf, next_id_);
            put64(buf, ids_.size());
            for (size_t i = 0; i < ids_.size(); i++) {
                put64(buf, ids_[i]);
                put32(buf, static_cast<uint32_t>(texts_[i].size()));
                buf.append(texts_[i]);
                for (size_t d = 0; d < dim_; d++) {
                    uint32_t bits;
                    std::memcpy(&bits, &vecs_[i * dim_ + d], 4);
                    put32(buf, bits);
                }
            }
        }
        put32(buf, crc32(buf.data(), buf.size()));
        return write_atomic(path, buf, error);
    }

    // Reemplaza el contenido actual con el del archivo. Si el archivo no es válido no cambia nada.
    bool load(const std::string& path, std::string* error = nullptr) {
        auto fail = [&](const std::string& e) { if (error) *error = e; return false; };

        std::string buf;
        if (!read_file(path, buf, error)) return false;
        if (buf.size() < 4 + 4 + 4 + 4 + 8 + 8 + 4) return fail("archivo demasiado corto");

        uint32_t stored_crc = get32(buf.data() + buf.size() - 4);
        if (crc32(buf.data(), buf.size() - 4) != stored_crc) return fail("CRC inválido: archivo corrupto");

        Reader r{buf.data(), buf.size() - 4, 0};
        if (std::memcmp(r.take(4), "URVM", 4) != 0) return fail("no es un archivo URVM");
        if (r.u32() != kVersion) return fail("versión no soportada");
        uint32_t name_len = r.u32();
        if (name_len > 256 || !r.has(name_len)) return fail("nombre de embedder inválido");
        std::string name(r.take(name_len), name_len);
        if (name != embedder_->name()) return fail("guardado con otro embedder (" + name + ")");
        uint32_t dim = r.u32();
        if (dim != dim_) return fail("dimensión distinta: " + std::to_string(dim));
        uint64_t next_id = r.u64();
        uint64_t count = r.u64();
        if (!r.ok) return fail("cabecera incompleta");
        // Cota con el tamaño real para no reservar memoria a ciegas.
        uint64_t min_rec = 8 + 4 + static_cast<uint64_t>(dim) * 4;
        if (count > (r.size - r.pos) / min_rec) return fail("número de registros inválido");

        std::vector<uint64_t> ids;
        std::vector<std::string> texts;
        std::vector<float> vecs;
        std::unordered_map<uint64_t, size_t> index;
        ids.reserve(count); texts.reserve(count); vecs.reserve(count * dim);
        for (uint64_t i = 0; i < count; i++) {
            uint64_t id = r.u64();
            uint32_t len = r.u32();
            if (!r.ok || len > kMaxTextBytes || !r.has(len)) return fail("registro " + std::to_string(i) + " inválido");
            if (id == 0 || id >= next_id || !index.emplace(id, ids.size()).second)
                return fail("registro " + std::to_string(i) + ": id inválido o repetido");
            ids.push_back(id);
            texts.emplace_back(r.take(len), len);
            for (uint32_t d = 0; d < dim; d++) {
                uint32_t bits = r.u32();
                float f;
                std::memcpy(&f, &bits, 4);
                if (!std::isfinite(f)) return fail("registro " + std::to_string(i) + ": vector inválido");
                vecs.push_back(f);
            }
            if (!r.ok) return fail("registro " + std::to_string(i) + " incompleto");
        }
        if (r.pos != r.size) return fail("datos sobrantes al final");

        auto lock = write_lock();
        ids_ = std::move(ids); texts_ = std::move(texts); vecs_ = std::move(vecs);
        index_ = std::move(index); next_id_ = next_id;
        return true;
    }

private:
    static constexpr uint32_t kVersion = 1;

    // shared_mutex de glibc prefiere a los lectores: con búsquedas continuas, un escritor podría
    // esperar para siempre. El torniquete gate_ lo evita: un escritor que espera lo retiene y los
    // lectores nuevos se forman detrás de él hasta que termina.
    std::shared_lock<std::shared_mutex> read_lock() const {
        std::lock_guard<std::mutex> turnstile(gate_);
        return std::shared_lock<std::shared_mutex>(mu_);
    }
    std::unique_lock<std::shared_mutex> write_lock() {
        std::lock_guard<std::mutex> turnstile(gate_);
        return std::unique_lock<std::shared_mutex>(mu_);
    }

    struct Reader {
        const char* data; size_t size; size_t pos; bool ok = true;
        bool has(size_t n) const { return ok && size - pos >= n; }
        const char* take(size_t n) {
            static const char zeros[8] = {};
            if (!has(n)) { ok = false; return zeros; }
            const char* p = data + pos; pos += n; return p;
        }
        uint32_t u32() { return has(4) ? get32(take(4)) : (ok = false, 0u); }
        uint64_t u64() { return has(8) ? get64(take(8)) : (ok = false, 0ull); }
    };

    static void put32(std::string& b, uint32_t v) { for (int i = 0; i < 4; i++) b += static_cast<char>(v >> (8 * i)); }
    static void put64(std::string& b, uint64_t v) { for (int i = 0; i < 8; i++) b += static_cast<char>(v >> (8 * i)); }
    static uint32_t get32(const char* p) {
        uint32_t v = 0;
        for (int i = 0; i < 4; i++) v |= static_cast<uint32_t>(static_cast<unsigned char>(p[i])) << (8 * i);
        return v;
    }
    static uint64_t get64(const char* p) {
        uint64_t v = 0;
        for (int i = 0; i < 8; i++) v |= static_cast<uint64_t>(static_cast<unsigned char>(p[i])) << (8 * i);
        return v;
    }

    static uint32_t crc32(const char* data, size_t n) {
        static const auto table = [] {
            std::vector<uint32_t> t(256);
            for (uint32_t i = 0; i < 256; i++) {
                uint32_t c = i;
                for (int k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320u ^ (c >> 1) : c >> 1;
                t[i] = c;
            }
            return t;
        }();
        uint32_t c = 0xFFFFFFFFu;
        for (size_t i = 0; i < n; i++) c = table[(c ^ static_cast<unsigned char>(data[i])) & 0xFF] ^ (c >> 8);
        return c ^ 0xFFFFFFFFu;
    }

    static bool read_file(const std::string& path, std::string& out, std::string* error) {
        int fd = ::open(path.c_str(), O_RDONLY | O_CLOEXEC | O_NOFOLLOW);
        if (fd < 0) { if (error) *error = "open: " + std::string(strerror(errno)); return false; }
        struct stat st;
        if (fstat(fd, &st) != 0 || !S_ISREG(st.st_mode) || st.st_size > (static_cast<off_t>(1) << 31)) {
            ::close(fd);
            if (error) *error = "no es un archivo regular o es demasiado grande";
            return false;
        }
        out.resize(static_cast<size_t>(st.st_size));
        size_t got = 0;
        while (got < out.size()) {
            ssize_t r = ::read(fd, &out[got], out.size() - got);
            if (r < 0 && errno == EINTR) continue;
            if (r <= 0) { ::close(fd); if (error) *error = "error de lectura"; return false; }
            got += static_cast<size_t>(r);
        }
        ::close(fd);
        return true;
    }

    static bool write_atomic(const std::string& path, const std::string& data, std::string* error) {
        auto fail = [&](const std::string& e) { if (error) *error = e + ": " + strerror(errno); return false; };
        std::string tmp = path + ".tmp";
        int fd = ::open(tmp.c_str(), O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC | O_NOFOLLOW, 0600);
        if (fd < 0) return fail("open " + tmp);
        size_t off = 0;
        while (off < data.size()) {
            ssize_t w = ::write(fd, data.data() + off, data.size() - off);
            if (w < 0 && errno == EINTR) continue;
            if (w <= 0) { int e = errno; ::close(fd); ::unlink(tmp.c_str()); errno = e; return fail("write"); }
            off += static_cast<size_t>(w);
        }
        if (fsync(fd) != 0) { int e = errno; ::close(fd); ::unlink(tmp.c_str()); errno = e; return fail("fsync"); }
        ::close(fd);
        if (::rename(tmp.c_str(), path.c_str()) != 0) { int e = errno; ::unlink(tmp.c_str()); errno = e; return fail("rename"); }
        // fsync del directorio para que el rename también sea durable.
        std::string dir = path.find('/') == std::string::npos ? "." : path.substr(0, path.rfind('/'));
        if (dir.empty()) dir = "/";
        int dfd = ::open(dir.c_str(), O_RDONLY | O_DIRECTORY | O_CLOEXEC);
        if (dfd >= 0) { fsync(dfd); ::close(dfd); }
        return true;
    }

    std::shared_ptr<const Embedder> embedder_;
    size_t dim_;
    mutable std::mutex gate_;
    mutable std::shared_mutex mu_;
    std::vector<uint64_t> ids_;
    std::vector<std::string> texts_;
    std::vector<float> vecs_;  // ids_.size() × dim_, contiguo para recorrerlo rápido
    std::unordered_map<uint64_t, size_t> index_;
    uint64_t next_id_ = 1;
    AuditHook audit_;
};

}  // namespace uriel
