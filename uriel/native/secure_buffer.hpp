// SecureBuffer: memoria para secretos pequeños (llaves, tokens).
// - Páginas anónimas fuera del heap, bloqueadas en RAM (best-effort) y excluidas de core dumps.
// - Páginas guarda PROT_NONE antes y después: un desbordamiento produce SIGSEGV inmediato
//   en lugar de corromper memoria en silencio.
// - Zeroización garantizada al destruir; no copiable, solo movible.
#pragma once

#include <sys/mman.h>
#include <unistd.h>
#include <cerrno>
#include <cstddef>
#include <cstring>
#include <new>
#include <utility>

namespace uriel {

inline void secure_zero(void* p, size_t n) noexcept {
#if defined(__GLIBC__)
    explicit_bzero(p, n);
#else
    // bionic (Android) no tiene explicit_bzero: escritura volátil + barrera para que el
    // compilador no elimine el borrado.
    volatile unsigned char* v = static_cast<volatile unsigned char*>(p);
    while (n--) *v++ = 0;
    __asm__ __volatile__("" : : "r"(p) : "memory");
#endif
}

// Comparación en tiempo constante (capa C6).
inline bool ct_equal(const void* a, const void* b, size_t n) noexcept {
    const volatile unsigned char* x = static_cast<const volatile unsigned char*>(a);
    const volatile unsigned char* y = static_cast<const volatile unsigned char*>(b);
    unsigned char diff = 0;
    for (size_t i = 0; i < n; i++) diff |= x[i] ^ y[i];
    return diff == 0;
}

class SecureBuffer {
public:
    explicit SecureBuffer(size_t size) : size_(size) {
        if (size == 0) throw std::bad_alloc();
        page_ = static_cast<size_t>(sysconf(_SC_PAGESIZE));
        data_len_ = (size + page_ - 1) / page_ * page_;
        map_len_ = data_len_ + 2 * page_;

        base_ = mmap(nullptr, map_len_, PROT_NONE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
        if (base_ == MAP_FAILED) { base_ = nullptr; throw std::bad_alloc(); }

        data_ = static_cast<unsigned char*>(base_) + page_;
        if (mprotect(data_, data_len_, PROT_READ | PROT_WRITE) != 0) {
            munmap(base_, map_len_);
            throw std::bad_alloc();
        }
#ifdef MADV_DONTDUMP
        madvise(data_, data_len_, MADV_DONTDUMP);
#endif
#ifdef MADV_WIPEONFORK
        madvise(data_, data_len_, MADV_WIPEONFORK); // un fork() no hereda el secreto
#endif
        // RLIMIT_MEMLOCK es bajo en Android: si falla seguimos, pero lo reportamos.
        locked_ = (mlock(data_, data_len_) == 0);
    }

    ~SecureBuffer() { release(); }

    SecureBuffer(const SecureBuffer&) = delete;
    SecureBuffer& operator=(const SecureBuffer&) = delete;

    SecureBuffer(SecureBuffer&& o) noexcept { steal(o); }
    SecureBuffer& operator=(SecureBuffer&& o) noexcept {
        if (this != &o) { release(); steal(o); }
        return *this;
    }

    unsigned char* data() noexcept { return data_; }
    const unsigned char* data() const noexcept { return data_; }
    size_t size() const noexcept { return size_; }
    bool locked() const noexcept { return locked_; }

private:
    void release() noexcept {
        if (!base_) return;
        secure_zero(data_, data_len_);
        if (locked_) munlock(data_, data_len_);
        munmap(base_, map_len_);
        base_ = nullptr; data_ = nullptr;
    }
    void steal(SecureBuffer& o) noexcept {
        base_ = o.base_; data_ = o.data_; size_ = o.size_; page_ = o.page_;
        data_len_ = o.data_len_; map_len_ = o.map_len_; locked_ = o.locked_;
        o.base_ = nullptr; o.data_ = nullptr;
    }

    void* base_ = nullptr;
    unsigned char* data_ = nullptr;
    size_t size_ = 0, page_ = 0, data_len_ = 0, map_len_ = 0;
    bool locked_ = false;
};

} // namespace uriel
