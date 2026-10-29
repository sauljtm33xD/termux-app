#include "vector_memory.hpp"
#include "audit_log.hpp"

#include <openssl/sha.h>

#include <atomic>
#include <chrono>
#include <cstdio>
#include <thread>

static int failures = 0;
#define CHECK(c) do { if (!(c)) { std::printf("FAIL %s:%d %s\n", __FILE__, __LINE__, #c); failures++; } } while (0)

using uriel::HashingEmbedder;
using uriel::VectorMemory;

static std::string read_all(const std::string& p) {
    std::string d; FILE* f = fopen(p.c_str(), "rbe"); int c;
    if (!f) return d;
    while ((c = fgetc(f)) != EOF) d += static_cast<char>(c);
    fclose(f); return d;
}
static void write_all(const std::string& p, const std::string& d) {
    FILE* f = fopen(p.c_str(), "wbe"); fwrite(d.data(), 1, d.size(), f); fclose(f);
}
// CRC32 independiente de la implementación, para fabricar archivos con CRC válido.
static uint32_t crc32_ref(const std::string& s) {
    uint32_t c = 0xFFFFFFFFu;
    for (unsigned char b : s) { c ^= b; for (int k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320u ^ (c >> 1) : c >> 1; }
    return c ^ 0xFFFFFFFFu;
}
static std::string with_crc(std::string body) {
    uint32_t c = crc32_ref(body);
    for (int i = 0; i < 4; i++) body += static_cast<char>(c >> (8 * i));
    return body;
}

static const char* kDocs[] = {
    "Para configurar la red WiFi abre Ajustes, luego Redes y elige tu router",                  // 1
    "La canción favorita de Saul es Paranoid de Black Sabbath con Ozzy Osbourne",               // 2
    "Recordatorio: comprar croquetas para el perro el sábado",                                  // 3
    "El motor de auditoría usa HMAC-SHA256 para encadenar los registros",                       // 4
    "Receta de enchiladas verdes: tortillas, pollo, salsa de tomate verde y crema",             // 5
    "La memoria vectorial guarda recuerdos como vectores y los busca por similitud coseno",     // 6
    "Compilar la app de Android con Gradle: ./gradlew assembleDebug",                           // 7
    "Cumpleaños de mi pareja: 14 de febrero, reservar cena",                                    // 8
};

static void fill(VectorMemory& m) { for (const char* d : kDocs) m.add(d); }

int main(int argc, char** argv) {
    std::string dir = argc > 1 ? argv[1] : ".";
    auto emb = std::make_shared<HashingEmbedder>(512);

    // 1. Normalización de texto.
    {
        auto t = HashingEmbedder::tokenize("¿Qué MÚSICA le gusta a Saúl? Año—ano “cita” 🎸Ñandú");
        std::vector<std::string> want = {"musica", "gusta", "saul", "año", "ano", "cita", "ñandu"};
        CHECK(t == want);
        // UTF-8 inválido o cortado no rompe nada.
        std::string bad = "hola\xC3", bad2 = "a\xFF\xFE" "b\xE2\x82";
        CHECK(HashingEmbedder::tokenize(bad) == std::vector<std::string>{"hola"});
        CHECK((HashingEmbedder::tokenize(bad2) == std::vector<std::string>{"b"}));  // "a" es palabra vacía
        std::printf("[1] normalización: minúsculas, sin acentos, ñ conservada, UTF-8 inválido tolerado\n");
    }

    // 2. Propiedades del vector: norma 1, determinista, vector cero sin contenido.
    {
        std::vector<float> a(512), b(512), z(512);
        emb->embed("La memoria vectorial de URIEL", a.data());
        emb->embed("La memoria vectorial de URIEL", b.data());
        double n = 0; for (float x : a) n += double(x) * x;
        CHECK(std::fabs(n - 1.0) < 1e-5);
        CHECK(a == b);
        emb->embed("¿¡ de la que !? 🎸", z.data());
        bool all_zero = true; for (float x : z) all_zero &= (x == 0.0f);
        CHECK(all_zero);
        std::printf("[2] vectores: norma %.6f, deterministas, texto vacío -> vector cero\n", n);
    }

    // 3. Relevancia: cada pregunta encuentra su recuerdo en primer lugar, con margen sobre el segundo.
    {
        VectorMemory m(emb);
        fill(m);
        struct Q { const char* q; uint64_t want; } qs[] = {
            {"como conecto el wifi", 1}, {"cancion de ozzy", 2}, {"¿Qué música le gusta a Saúl?", 2},
            {"memorias vectoriales", 6}, {"comida del perro", 3}, {"cena de cumpleaños", 8},
            {"compilar android", 7}, {"receta enchilada", 5}, {"HMAC", 4},
        };
        int ok = 0;
        for (auto& q : qs) {
            auto h = m.search(q.q, 2, -1.0f);
            bool top = h.size() == 2 && h[0].id == q.want && h[0].score >= 0.14f && h[0].score - h[1].score >= 0.05f;
            if (!top) std::printf("    '%s' -> id %llu (%.3f), segundo %.3f\n", q.q,
                                  (unsigned long long)(h.empty() ? 0 : h[0].id), h.empty() ? 0 : h[0].score,
                                  h.size() < 2 ? 0 : h[1].score);
            ok += top;
            CHECK(top);
        }
        // El mismo texto exacto da similitud ~1.
        auto exact = m.search(kDocs[3], 1);
        CHECK(exact.size() == 1 && exact[0].id == 4 && exact[0].score > 0.999f);
        // Ruido: nada supera 0.1.
        auto noise = m.search("xyz qwerty", 1, -1.0f);
        CHECK(noise.size() == 1 && noise[0].score < 0.1f);
        std::printf("[3] relevancia: %d/9 preguntas con el recuerdo correcto primero; texto exacto %.4f; ruido %.3f\n",
                    ok, exact.empty() ? 0 : exact[0].score, noise.empty() ? 0 : noise[0].score);
    }

    // 4. Límite conocido del embedder léxico: los sinónimos no se encuentran.
    //    Si esto empieza a fallar es porque se conectó un embedder semántico: actualizar la prueba.
    {
        VectorMemory m(emb);
        fill(m);
        float dog = -1;
        for (auto& h : m.search("mi mascota", 8, -1.0f)) if (h.id == 3) dog = h.score;
        CHECK(dog < 0.1f);
        std::printf("[4] límite documentado: 'mi mascota' vs 'perro' = %.3f (léxico, no semántico)\n", dog);
    }

    // 5. top-k, min_score, borrado, get.
    {
        VectorMemory m(emb);
        fill(m);
        CHECK(m.search("android", 0).empty());
        auto all = m.search("android", 100, -1.0f);
        CHECK(all.size() == 8);
        bool sorted = true; for (size_t i = 1; i < all.size(); i++) sorted &= all[i - 1].score >= all[i].score;
        CHECK(sorted);
        CHECK(m.search("android", 100, 0.3f).size() == 1);
        CHECK(m.remove(7));
        CHECK(!m.remove(7));
        CHECK(m.size() == 7);
        auto h = m.search("compilar android", 1, -1.0f);
        CHECK(!h.empty() && h[0].id != 7);
        std::string txt;
        CHECK(m.get(8, &txt) && txt == kDocs[7]);  // 8 se movió al hueco de 7 y sigue intacto
        CHECK(!m.get(7, nullptr));
        uint64_t nid = m.add("nuevo");
        CHECK(nid == 9);  // los ids nunca se reutilizan
        CHECK(m.add(std::string(VectorMemory::kMaxTextBytes + 1, 'x')) == 0);
        std::printf("[5] top-k, min_score, borrado, ids no reutilizados, límite de tamaño: OK\n");
    }

    // 6. Persistencia: guardar, cargar, mismos resultados; reabrir sigue con los ids.
    std::string path = dir + "/memoria.urvm";
    unlink(path.c_str());
    {
        VectorMemory a(emb);
        fill(a);
        a.remove(3);
        std::string err;
        CHECK(a.save(path, &err));
        VectorMemory b(emb);
        CHECK(b.load(path, &err));
        CHECK(b.size() == 7);
        auto ha = a.search("cancion de ozzy", 3, -1.0f), hb = b.search("cancion de ozzy", 3, -1.0f);
        bool same = ha.size() == hb.size();
        for (size_t i = 0; same && i < ha.size(); i++) same = ha[i].id == hb[i].id && ha[i].score == hb[i].score && ha[i].text == hb[i].text;
        CHECK(same);
        CHECK(b.add("otro") == 9);
        struct stat st; stat(path.c_str(), &st);
        CHECK((st.st_mode & 0777) == 0600);
        CHECK(access((path + ".tmp").c_str(), F_OK) != 0);
        std::printf("[6] persistencia: resultados idénticos tras recargar, permisos 0600, sin temporales\n");
    }

    // 7. Archivos inválidos: se rechazan y la memoria queda como estaba.
    {
        const std::string good = read_all(path);
        VectorMemory m(emb);
        m.add("estado previo");
        std::string err;
        auto rejects = [&](const std::string& data, const char* what) {
            write_all(path, data);
            bool loaded = m.load(path, &err);
            bool kept = m.size() == 1;
            CHECK(!loaded); CHECK(kept);
            std::printf("    %-34s -> %s\n", what, loaded ? "ACEPTADO (mal)" : err.c_str());
        };
        std::printf("[7] archivos inválidos:\n");
        { std::string d = good; d[good.size() / 2] ^= 0x01; rejects(d, "1 bit cambiado"); }
        rejects(good.substr(0, good.size() - 10), "archivo recortado");
        rejects("", "archivo vacío");
        { std::string b = good.substr(0, good.size() - 4); b[0] = 'X'; rejects(with_crc(b), "firma incorrecta (CRC válido)"); }
        { std::string b = good.substr(0, good.size() - 4); b[4] = 9; rejects(with_crc(b), "versión desconocida (CRC válido)"); }
        { std::string b = good.substr(0, good.size() - 4); b += "basura"; rejects(with_crc(b), "datos sobrantes (CRC válido)"); }
        {
            // count enorme: no debe intentar reservar memoria.
            std::string b = good.substr(0, good.size() - 4);
            size_t count_off = 4 + 4 + 4 + std::string("uriel-hash-v1").size() + 4 + 8;
            for (int i = 0; i < 8; i++) b[count_off + i] = static_cast<char>(0xFF);
            rejects(with_crc(b), "count = 2^64-1 (CRC válido)");
        }
        {
            // Dos registros con el mismo id.
            std::string b = good.substr(0, good.size() - 4);
            size_t rec0 = 4 + 4 + 4 + std::string("uriel-hash-v1").size() + 4 + 8 + 8;
            uint32_t len0 = 0; for (int i = 0; i < 4; i++) len0 |= uint32_t(static_cast<unsigned char>(b[rec0 + 8 + i])) << (8 * i);
            size_t rec1 = rec0 + 8 + 4 + len0 + 512 * 4;
            for (int i = 0; i < 8; i++) b[rec1 + i] = b[rec0 + i];
            rejects(with_crc(b), "id repetido (CRC válido)");
        }
        {
            VectorMemory other(std::make_shared<HashingEmbedder>(256));
            write_all(path, good);
            CHECK(!other.load(path, &err));
            std::printf("    %-34s -> %s\n", "otra dimensión (256)", err.c_str());
        }
        {
            std::string link = dir + "/link.urvm";
            unlink(link.c_str());
            write_all(path, good);
            CHECK(symlink(path.c_str(), link.c_str()) == 0);
            CHECK(!m.load(link, &err));
            std::printf("    %-34s -> %s\n", "symlink", err.c_str());
            VectorMemory w(emb);
            CHECK(!w.save(dir + "/no-existe/x.urvm", &err));
            std::printf("    %-34s -> %s\n", "guardar en carpeta inexistente", err.c_str());
            unlink(link.c_str());
        }
    }

    // 8. Concurrencia: 4 lectores y 2 escritores a la vez.
    {
        VectorMemory m(emb);
        fill(m);
        std::atomic<bool> stop{false};
        std::atomic<long> searches{0};
        std::vector<std::thread> ts;
        for (int r = 0; r < 4; r++) ts.emplace_back([&] {
            while (!stop) { auto h = m.search("cancion de ozzy", 1); if (!h.empty() && h[0].id != 2) failures++; searches++; }
        });
        for (int w = 0; w < 2; w++) ts.emplace_back([&, w] {
            for (int i = 0; i < 300; i++) { uint64_t id = m.add("ruido " + std::to_string(w) + " " + std::to_string(i)); if (i % 2) m.remove(id); }
        });
        for (size_t i = 4; i < ts.size(); i++) ts[i].join();
        stop = true;
        for (int i = 0; i < 4; i++) ts[i].join();
        CHECK(m.size() == 8 + 300);
        std::printf("[8] concurrencia: %ld búsquedas mientras 2 hilos escribían; tamaño final %zu\n", searches.load(), m.size());
    }

    // 9. Integración con AuditLog: cada alta/baja queda en la cadena HMAC, en orden.
    {
        std::string log_path = dir + "/memoria.audit";
        unlink(log_path.c_str());
        uint8_t key[32]; for (int i = 0; i < 32; i++) key[i] = static_cast<uint8_t>(0x40 + i);
        std::string err;
        auto log = uriel::AuditLog::open(log_path, key, 32, &err);
        CHECK(log != nullptr);
        VectorMemory m(emb);
        // Se registra el SHA-256 del texto, no el texto: la bitácora no expone el contenido.
        m.set_audit_hook([&](VectorMemory::Op op, uint64_t id, std::string_view text) {
            unsigned char h[SHA256_DIGEST_LENGTH];
            SHA256(reinterpret_cast<const unsigned char*>(text.data()), text.size(), h);
            char hex[65]; for (int i = 0; i < 32; i++) snprintf(hex + 2 * i, 3, "%02x", h[i]);
            std::string ev = std::string(op == VectorMemory::Op::Add ? "add" : "remove") + " id=" + std::to_string(id) + " sha256=" + hex;
            log->append(reinterpret_cast<const uint8_t*>(ev.data()), ev.size());
        });
        fill(m);
        m.remove(5);
        auto v = log->verify();
        CHECK(v.ok && v.records == 9);
        std::printf("[9] AuditLog: %llu eventos (8 altas + 1 baja) en la cadena HMAC, verify %s\n",
                    (unsigned long long)v.records, v.ok ? "OK" : v.error.c_str());
        unlink(log_path.c_str());
    }

    // 10. Escala (informativo): 20,000 recuerdos.
    {
        VectorMemory m(emb);
        auto t0 = std::chrono::steady_clock::now();
        for (int i = 0; i < 20000; i++) m.add("recuerdo número " + std::to_string(i) + " sobre " + kDocs[i % 8]);
        double add_s = std::chrono::duration<double>(std::chrono::steady_clock::now() - t0).count();
        t0 = std::chrono::steady_clock::now();
        for (int i = 0; i < 20; i++) m.search("cancion de ozzy", 5);
        double q_ms = std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - t0).count() / 20;
        std::printf("[10] escala: 20,000 recuerdos en %.2f s; búsqueda %.1f ms; RAM de vectores %.1f MB\n",
                    add_s, q_ms, 20000.0 * 512 * 4 / 1e6);
    }

    unlink(path.c_str());
    std::printf(failures ? "TESTS FALLIDOS: %d\n" : "TODOS LOS TESTS OK\n", failures);
    return failures != 0;
}
