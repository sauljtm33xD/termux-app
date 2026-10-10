#include "audit_log.hpp"
#include <cstdio>
#include <thread>

static int failures = 0;
#define CHECK(c) do { if (!(c)) { std::printf("FAIL %s:%d %s\n", __FILE__, __LINE__, #c); failures++; } } while (0)

using uriel::AuditLog;

static std::vector<uint8_t> read_file(const std::string& p) {
    std::vector<uint8_t> d; FILE* f = fopen(p.c_str(), "rbe"); int c;
    while ((c = fgetc(f)) != EOF) d.push_back(static_cast<uint8_t>(c));
    fclose(f); return d;
}
static void write_file(const std::string& p, const std::vector<uint8_t>& d) {
    FILE* f = fopen(p.c_str(), "wbe"); fwrite(d.data(), 1, d.size(), f); fclose(f);
}
static bool append_str(AuditLog& l, const char* s) {
    return l.append(reinterpret_cast<const uint8_t*>(s), strlen(s));
}

int main(int argc, char** argv) {
    std::string dir = argc > 1 ? argv[1] : ".";
    std::string path = dir + "/audit.log";
    unlink(path.c_str());
    uint8_t key[32]; for (int i = 0; i < 32; i++) key[i] = static_cast<uint8_t>(i * 7 + 3);
    uint8_t wrong[32]; memcpy(wrong, key, 32); wrong[0] ^= 1;
    std::string err;

    // 1. Concurrencia: 4 hilos x 900 escrituras -> cadena válida y completa.
    {
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log != nullptr);
        std::vector<std::thread> ts;
        for (int t = 0; t < 4; t++) ts.emplace_back([&] { for (int i = 0; i < 900; i++) append_str(*log, "evento"); });
        for (auto& t : ts) t.join();
        auto v = log->verify();
        CHECK(v.ok); CHECK(v.records == 3600);
        std::printf("[1] 4 hilos x 900: %s, %llu registros\n", v.ok ? "OK" : v.error.c_str(), (unsigned long long)v.records);
    }
    // 2. Sin límite de 4096 y reapertura: continúa la cadena.
    {
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log && log->count() == 3600);
        for (int i = 0; i < 7000; i++) CHECK(append_str(*log, "mas"));
        auto v = log->verify();
        CHECK(v.ok && v.records == 10600);
        std::printf("[2] reabrir + 7000 más: %s, %llu registros\n", v.ok ? "OK" : v.error.c_str(), (unsigned long long)v.records);
    }
    auto good = read_file(path);

    // 3. Un byte alterado.
    {
        auto d = good; d[25] ^= 0x01; write_file(path, d);
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log == nullptr);
        std::printf("[3] 1 byte alterado: rechazado -> %s\n", err.c_str());
    }
    // 4. Falsificación con otra llave (el ataque que pasaba en la versión original).
    {
        unlink(path.c_str());
        { auto a = AuditLog::open(path, wrong, 32, &err); append_str(*a, "HACK"); }
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log == nullptr);
        std::printf("[4] cadena forjada sin la llave: rechazada -> %s\n", err.c_str());
    }
    // 5. Borrar un registro intermedio.
    {
        unlink(path.c_str());
        { auto a = AuditLog::open(path, key, 32, &err); append_str(*a, "uno"); append_str(*a, "dos"); append_str(*a, "tres"); }
        auto d = read_file(path);
        size_t r0 = AuditLog::kHeaderLen + 3 + AuditLog::kMacLen;
        size_t r1 = AuditLog::kHeaderLen + 3 + AuditLog::kMacLen;
        d.erase(d.begin() + r0, d.begin() + r0 + r1);
        write_file(path, d);
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log == nullptr);
        std::printf("[5] registro intermedio borrado: rechazado -> %s\n", err.c_str());
    }
    // 6. Escritura interrumpida (cola incompleta).
    {
        unlink(path.c_str());
        { auto a = AuditLog::open(path, key, 32, &err); append_str(*a, "uno"); append_str(*a, "dos"); }
        auto d = read_file(path); d.resize(d.size() - 5); write_file(path, d);
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log == nullptr);
        std::printf("[6] cola recortada: rechazada -> %s\n", err.c_str());
    }
    // 7. Truncar registros completos del final: solo se detecta comparando head() externo.
    {
        unlink(path.c_str());
        AuditLog::Mac anchored;
        { auto a = AuditLog::open(path, key, 32, &err); append_str(*a, "uno"); append_str(*a, "dos"); anchored = a->head(); }
        auto d = read_file(path); d.resize(AuditLog::kHeaderLen + 3 + AuditLog::kMacLen); write_file(path, d);
        auto log = AuditLog::open(path, key, 32, &err);
        CHECK(log != nullptr);
        bool detected = log && CRYPTO_memcmp(anchored.data(), log->head().data(), 32) != 0;
        CHECK(detected);
        std::printf("[7] último registro borrado: archivo parece válido, head() anclado lo detecta -> %s\n", detected ? "OK" : "NO");
    }
    unlink(path.c_str());
    std::printf(failures ? "TESTS FALLIDOS: %d\n" : "TODOS LOS TESTS OK\n", failures);
    return failures != 0;
}
