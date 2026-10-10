#include "secure_buffer.hpp"
#include <csignal>
#include <cstdio>
#include <sys/wait.h>

static int failures = 0;
#define CHECK(c) do { if (!(c)) { std::printf("FAIL %s:%d %s\n", __FILE__, __LINE__, #c); failures++; } } while (0)

int main() {
    using uriel::SecureBuffer;
    {
        SecureBuffer b(32);
        CHECK(b.size() == 32);
        std::memset(b.data(), 0xAB, b.size());
        CHECK(b.data()[31] == 0xAB);
        SecureBuffer m(std::move(b));
        CHECK(m.data()[0] == 0xAB);
        CHECK(b.data() == nullptr);
        std::printf("mlock: %s\n", m.locked() ? "ok" : "no disponible (RLIMIT_MEMLOCK)");
    }
    const char k1[] = "llave-secreta", k2[] = "llave-secreta", k3[] = "llave-secretX";
    CHECK(uriel::ct_equal(k1, k2, sizeof k1));
    CHECK(!uriel::ct_equal(k1, k3, sizeof k1));

    // Desbordamiento: escribir en la página guarda debe matar al proceso con SIGSEGV.
    pid_t pid = fork();
    if (pid == 0) {
        SecureBuffer b(16);
        size_t page = static_cast<size_t>(sysconf(_SC_PAGESIZE));
        volatile unsigned char* p = b.data();
        p[page] = 1;
        _exit(0);
    }
    int st = 0;
    waitpid(pid, &st, 0);
    CHECK(WIFSIGNALED(st) && WTERMSIG(st) == SIGSEGV);

    std::printf(failures ? "TESTS FALLIDOS: %d\n" : "TODOS LOS TESTS OK\n", failures);
    return failures != 0;
}
