// AuditLog: bitácora append-only con cadena HMAC-SHA256.
//
// Formato de cada registro en disco (little-endian):
//   seq u64 | ts_ns u64 | len u32 | payload[len] | mac[32]
//   mac_n = HMAC(key, mac_{n-1} || seq || ts || len || payload),  mac_{-1} = 32 ceros
//
// Garantías:
// - Sin la llave, nadie puede modificar, insertar ni reordenar registros sin que verify() lo detecte.
// - Borrar registros del FINAL no se detecta solo con el archivo: guarda head() fuera del
//   dispositivo (servidor, otro equipo) y compáralo para cubrir eso.
// - append() es thread-safe. La cadena es secuencial por definición, así que se serializa con un mutex.
#pragma once

#include "secure_buffer.hpp"

#include <fcntl.h>
#include <openssl/crypto.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <sys/stat.h>
#include <unistd.h>

#include <array>
#include <cerrno>
#include <chrono>
#include <cstdint>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

namespace uriel {

class AuditLog {
public:
    static constexpr size_t kKeyLen = 32;
    static constexpr size_t kMacLen = 32;
    static constexpr size_t kHeaderLen = 8 + 8 + 4;
    static constexpr uint32_t kMaxPayload = 64 * 1024;
    using Mac = std::array<uint8_t, kMacLen>;

    struct VerifyResult {
        bool ok = false;
        uint64_t records = 0;   // registros válidos antes del primer error
        std::string error;      // vacío si ok
    };

    // Abre (o crea) la bitácora y verifica todo su contenido. Si está alterada,
    // devuelve nullptr y llena `error`: no se puede seguir escribiendo sobre una cadena rota.
    static std::unique_ptr<AuditLog> open(const std::string& path, const uint8_t* key, size_t key_len,
                                          std::string* error = nullptr) {
        auto fail = [&](const std::string& e) -> std::unique_ptr<AuditLog> {
            if (error) *error = e;
            return nullptr;
        };
        if (key_len != kKeyLen) return fail("la llave debe medir 32 bytes");

        int fd = ::open(path.c_str(), O_RDWR | O_CREAT | O_APPEND | O_CLOEXEC | O_NOFOLLOW, 0600);
        if (fd < 0) return fail("open: " + std::string(strerror(errno)));

        std::unique_ptr<AuditLog> log(new AuditLog(fd, key));
        VerifyResult v = log->verify_locked();
        if (!v.ok) return fail(v.error);
        return log;
    }

    ~AuditLog() { if (fd_ >= 0) ::close(fd_); }
    AuditLog(const AuditLog&) = delete;
    AuditLog& operator=(const AuditLog&) = delete;

    // Agrega un registro. Con durable=true espera a que llegue al disco (fdatasync).
    bool append(const uint8_t* payload, size_t len, bool durable = false) {
        if (len > kMaxPayload || (len && !payload)) return false;
        std::lock_guard<std::mutex> lock(mu_);

        uint64_t ts = static_cast<uint64_t>(std::chrono::duration_cast<std::chrono::nanoseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count());

        std::vector<uint8_t> rec(kHeaderLen + len + kMacLen);
        put_le(&rec[0], next_seq_, 8);
        put_le(&rec[8], ts, 8);
        put_le(&rec[16], len, 4);
        if (len) memcpy(&rec[kHeaderLen], payload, len);

        Mac mac;
        if (!compute_mac(head_, rec.data(), kHeaderLen + len, mac)) return false;
        memcpy(&rec[kHeaderLen + len], mac.data(), kMacLen);

        if (!write_all(rec.data(), rec.size())) return false;
        if (durable && fdatasync(fd_) != 0) return false;

        head_ = mac;
        next_seq_++;
        return true;
    }

    // Relee el archivo completo y recalcula la cadena.
    VerifyResult verify() {
        std::lock_guard<std::mutex> lock(mu_);
        return verify_locked();
    }

    uint64_t count() {
        std::lock_guard<std::mutex> lock(mu_);
        return next_seq_;
    }

    // Último MAC de la cadena: guárdalo fuera del dispositivo para detectar truncamiento.
    Mac head() {
        std::lock_guard<std::mutex> lock(mu_);
        return head_;
    }

private:
    AuditLog(int fd, const uint8_t* key) : fd_(fd), key_(kKeyLen) {
        memcpy(key_.data(), key, kKeyLen);
        head_.fill(0);
    }

    static void put_le(uint8_t* p, uint64_t v, int n) {
        for (int i = 0; i < n; i++) p[i] = static_cast<uint8_t>(v >> (8 * i));
    }
    static uint64_t get_le(const uint8_t* p, int n) {
        uint64_t v = 0;
        for (int i = 0; i < n; i++) v |= static_cast<uint64_t>(p[i]) << (8 * i);
        return v;
    }

    bool compute_mac(const Mac& prev, const uint8_t* data, size_t len, Mac& out) const {
        std::vector<uint8_t> msg(kMacLen + len);
        memcpy(msg.data(), prev.data(), kMacLen);
        if (len) memcpy(msg.data() + kMacLen, data, len);
        unsigned int out_len = 0;
        bool ok = HMAC(EVP_sha256(), key_.data(), static_cast<int>(kKeyLen), msg.data(), msg.size(),
                       out.data(), &out_len) != nullptr && out_len == kMacLen;
        secure_zero(msg.data(), msg.size());
        return ok;
    }

    bool write_all(const uint8_t* p, size_t n) {
        while (n) {
            ssize_t w = ::write(fd_, p, n);
            if (w < 0) { if (errno == EINTR) continue; return false; }
            p += w; n -= static_cast<size_t>(w);
        }
        return true;
    }

    bool read_exact(off_t off, uint8_t* p, size_t n) const {
        while (n) {
            ssize_t r = ::pread(fd_, p, n, off);
            if (r < 0) { if (errno == EINTR) continue; return false; }
            if (r == 0) return false;
            p += r; n -= static_cast<size_t>(r); off += r;
        }
        return true;
    }

    VerifyResult verify_locked() {
        VerifyResult res;
        struct stat st;
        if (fstat(fd_, &st) != 0) { res.error = "fstat falló"; return res; }

        Mac prev; prev.fill(0);
        off_t off = 0;
        uint64_t seq = 0;
        std::vector<uint8_t> buf;
        while (off < st.st_size) {
            std::string where = "registro " + std::to_string(seq);
            uint8_t hdr[kHeaderLen];
            if (st.st_size - off < static_cast<off_t>(kHeaderLen) || !read_exact(off, hdr, kHeaderLen)) {
                res.error = where + ": cola incompleta (escritura interrumpida o archivo recortado)";
                return res;
            }
            uint64_t rseq = get_le(hdr, 8);
            uint32_t len = static_cast<uint32_t>(get_le(hdr + 16, 4));
            if (len > kMaxPayload) { res.error = where + ": longitud inválida"; return res; }
            size_t total = kHeaderLen + len + kMacLen;
            if (st.st_size - off < static_cast<off_t>(total)) {
                res.error = where + ": cola incompleta (escritura interrumpida o archivo recortado)";
                return res;
            }
            buf.resize(total);
            if (!read_exact(off, buf.data(), total)) { res.error = where + ": error de lectura"; return res; }

            Mac expect;
            if (!compute_mac(prev, buf.data(), kHeaderLen + len, expect)) { res.error = "HMAC falló"; return res; }
            if (CRYPTO_memcmp(expect.data(), buf.data() + kHeaderLen + len, kMacLen) != 0) {
                res.error = where + ": MAC inválido (registro alterado, insertado o reordenado)";
                return res;
            }
            if (rseq != seq) { res.error = where + ": secuencia rota"; return res; }

            memcpy(prev.data(), buf.data() + kHeaderLen + len, kMacLen);
            off += static_cast<off_t>(total);
            seq++;
            res.records = seq;
        }
        head_ = prev;
        next_seq_ = seq;
        res.ok = true;
        return res;
    }

    int fd_;
    SecureBuffer key_;
    Mac head_;
    uint64_t next_seq_ = 0;
    std::mutex mu_;
};

} // namespace uriel
