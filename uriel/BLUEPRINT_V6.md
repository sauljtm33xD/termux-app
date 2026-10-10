# URIEL v6: el blueprint corregido

La v5 mezclaba técnicas reales con cosas que no funcionan en un teléfono o que no hacen lo que prometen.
La v6 conserva lo construible y cambia cada pieza imposible por una equivalente que sí se puede compilar.
Está organizada en 3 frentes con 3 mejoras cada uno (3×3).

## Base: "todo es vectores y frecuencias"

Hay una idea correcta detrás, pero su nombre técnico es distinto:

- **Embeddings.** Un modelo convierte texto, imagen o audio en un vector de números (por ejemplo, 768 dimensiones).
- **"Vibrar igual"** se traduce como **similitud coseno**: el coseno del ángulo entre dos vectores. Si vale 1.0, los significados son prácticamente iguales.
- **"Frecuencias"** existe literalmente en un caso: la transformada de Fourier (FFT) para audio y señales. También es la base del *positional encoding* de los transformers, que usa senos y cosenos a distintas frecuencias.

La "resonancia ideal" no es mágica. Es un buscador vectorial (FAISS, sqlite-vec) que devuelve los vecinos más cercanos.
Eso sí se construye y entra en el frente 3.

---

## Frente 1: núcleo nativo y memoria

| # | v5 | Problema | v6 (implementado) |
|---|----|----------|-------------------|
| 1.1 | `mmap` + `mlock` sin revisar errores | Si `mmap` falla, `madvise` recibe `MAP_FAILED` y el destructor libera un puntero inválido | `uriel/native/secure_buffer.hpp`: valida cada llamada, lanza `bad_alloc`, no se puede copiar y se puede mover de forma segura |
| 1.2 | Ninguna protección contra desbordes | Un overflow corrompe los secretos vecinos sin avisar | **Páginas guarda `PROT_NONE`** antes y después del bloque: el desborde muere al instante. Hay un test que lo comprueba |
| 1.3 | `fork()` hereda los secretos | Un proceso hijo puede leer las llaves | `MADV_WIPEONFORK`: el hijo ve la memoria en ceros. Además, `mlock` es *best-effort*, porque en Android `RLIMIT_MEMLOCK` es bajo, y el resultado se reporta con `locked()` |

Además, en la app real (termux-shared, `local-socket.cpp`) se aplicó la capa C5:
`socket(... | SOCK_CLOEXEC)`, `accept4(..., SOCK_CLOEXEC)`, `fopen("rbe")` y `snprintf` en lugar de `sprintf`.

## Frente 2: tolerancia a fallos (cambia la "autocuración")

Atrapar un `SIGSEGV` y volver a ejecutar la instrucción **no cura nada**. Para cuando llega la señal, la memoria ya está corrupta.
Además, Android prohíbe memoria escribible y ejecutable a la vez (W^X), así que el parcheo de vtables con LLVM no es viable.
Lo que usan Chrome, Erlang y systemd es esto:

| # | Mejora | Cómo |
|---|--------|------|
| 2.1 | **Aislamiento por proceso** | El código riesgoso (parsers, inferencia) corre en un proceso hijo con `seccomp` y sin permisos. Si falla, muere solo él |
| 2.2 | **Supervisor con reinicio** | El padre observa con `waitpid`/`pidfd` y reinicia con *backoff* exponencial (1s, 2s, 4s…) y un límite de reinicios por minuto |
| 2.3 | **Registro de fallos útil** | Un handler en `sigaltstack` que solo usa funciones *async-signal-safe* guarda la señal y la dirección, y termina el proceso. El "parche" lo escribe una persona o un agente revisado, nunca el handler en caliente |

## Frente 3: orquestación multi-agente (versión que corre sin root)

| # | v5 | v6 |
|---|----|----|
| 3.1 | Hilos `SCHED_FIFO` | Requieren root o `CAP_SYS_NICE`. Se usa un **pool de hilos** con `std::jthread` y una cola MPMC lock-free; la prioridad se da con `setpriority`/`nice` |
| 3.2 | eBPF/XDP en el teléfono | Requiere root y un kernel adecuado. En Android se usa **`VpnService`** para filtrar tráfico sin root. eBPF/XDP queda solo para un servidor Linux propio |
| 3.3 | "Conciencia unificada" | Una **memoria vectorial local**: embeddings + similitud coseno (sqlite-vec) + reglas de seguridad C1–C10 antes de ejecutar cualquier acción. Es el "eco" en forma real: recuerda y recupera por significado |

---

## Matriz C1–C10: estado real

| Capa | Estado |
|------|--------|
| C3 TOCTOU, C4 zeroización, C5 CLOEXEC, C6 tiempo constante | **Implementadas** (frente 1) |
| C7 nonces, C8 pinning, C9 SafeTensors | Se pueden construir. Van en el siguiente paso |
| C10 FIDO2 | Viable con la API FIDO2 de Android. Requiere una llave física |
| C1, C2 | Solo aplican cuando haya un motor de generación o SQL |

## Siguiente paso

Elige un frente:

1. Supervisor de procesos (frente 2.2) en C++ con tests.
2. C7 + C8: AES-GCM con nonces únicos y pinning TLS en la app.
3. Memoria vectorial local (frente 3.3).
