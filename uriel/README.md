# URIEL v6: índice de todo

Rama: `ccr-5c85ea34-b4kbzm` · PR: https://github.com/sauljtm33xD/termux-app/pull/12

## Mapa de archivos

| Archivo | Qué es | Estado |
|---------|--------|--------|
| [`MANIFIESTO_V6.md`](MANIFIESTO_V6.md) | Prompt de sistema de la IA: identidad, directivas y matriz de 10 capas | Listo |
| [`BLUEPRINT_V6.md`](BLUEPRINT_V6.md) | Arquitectura corregida: qué se puede construir, qué no y por qué. Incluye las pruebas a los motores v5 | Listo |
| [`native/secure_buffer.hpp`](native/secure_buffer.hpp) | Memoria para secretos: páginas guarda, sin core dumps, borrada al fork, `mlock`, zeroize y comparación en tiempo constante | Probado |
| [`native/audit_log.hpp`](native/audit_log.hpp) | Bitácora append-only con cadena HMAC-SHA256, en disco, thread-safe, con `head()` para anclar fuera del dispositivo | Probado |
| [`native/vector_memory.hpp`](native/vector_memory.hpp) | Memoria vectorial local: embeddings, búsqueda por similitud coseno, persistencia validada y hook de auditoría | Probado |
| [`native/*_test.cpp`](native/) | Pruebas que intentan romper cada módulo (hilos, límites, datos alterados, archivos corruptos) | 3/3 pasan |
| [`native/CMakeLists.txt`](native/CMakeLists.txt) | Compilación y pruebas, con opción de sanitizers (`-DURIEL_SANITIZE=address\|thread`) | Listo |
| [`../.github/workflows/uriel-native.yml`](../.github/workflows/uriel-native.yml) | CI: g++, clang++, ASan+UBSan y TSan en cada push | Listo; GitHub Actions de la cuenta no ejecuta jobs (revisar Billing) |
| [`../termux-shared/src/main/cpp/local-socket.cpp`](../termux-shared/src/main/cpp/local-socket.cpp) | App Termux: sockets con `SOCK_CLOEXEC`, `accept4`, `snprintf` (capa C5) | Revisión de sintaxis; sin build NDK completo |

## Compilar y ejecutar

**Linux:**
```bash
sudo apt install -y g++ cmake libssl-dev
cmake -S uriel/native -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j4
ctest --test-dir build --output-on-failure
```

**Android (Termux):**
```bash
pkg update && pkg install -y git clang cmake openssl
git clone --branch ccr-5c85ea34-b4kbzm --depth 1 https://github.com/sauljtm33xD/termux-app.git
cd termux-app
cmake -S uriel/native -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j4
./build/secure_buffer_test build && ./build/audit_log_test build && ./build/vector_memory_test build
```
Probado en Linux x86_64. En Android todavía no se ha probado en un dispositivo real.

## Uso rápido (C++)

```cpp
#include "audit_log.hpp"
#include "vector_memory.hpp"

// Bitácora inviolable (la llave de 32 bytes debe venir del Keystore, no del código)
std::string err;
auto log = uriel::AuditLog::open("eventos.log", key, 32, &err);
log->append(reinterpret_cast<const uint8_t*>("login ok"), 8);

// Memoria vectorial ("ecos")
uriel::VectorMemory mem(std::make_shared<uriel::HashingEmbedder>());
mem.add("La canción favorita de Saul es Paranoid de Black Sabbath");
for (auto& hit : mem.search("¿Qué música le gusta a Saúl?", 3))
    std::printf("%.3f  %s\n", hit.score, hit.text.c_str());
mem.save("memoria.urvm");
```

## Estado de la matriz de 10 capas

| Capa | Estado |
|------|--------|
| C3 TOCTOU, C4 zeroize, C5 CLOEXEC, C6 tiempo constante | Implementadas y probadas |
| Integridad de bitácora (HMAC) | Implementada y probada |
| C7 AES-GCM, C8 mTLS pinning, C9 SafeTensors, C10 FIDO2 | Pendientes |
| C1, C2 | Aplican cuando haya motor de generación o SQL |

## Pendiente

1. **MiniLM en la memoria vectorial.** Bloqueado: la red del entorno de Claude no permite `huggingface.co`.
   Modelo elegido: `paraphrase-multilingual-MiniLM-L12-v2` (384 dimensiones, entiende español).
   `all-MiniLM-L6-v2` está entrenado en inglés.
2. **Llave HMAC en Android Keystore/StrongBox**, para que ni la propia app pueda extraerla.
3. **Puente JNI** hacia `AuditLog` y `VectorMemory`, cuando se decida en qué app vive.
4. **CI en GitHub:** resolver Billing/minutos de Actions en la cuenta.

## Prompt de contexto

Para retomar el proyecto con cualquier IA, pega esto junto con el contenido de `MANIFIESTO_V6.md`:

```text
Proyecto URIEL v6 de Saul (SLAL), repo github.com/sauljtm33xD/termux-app,
rama ccr-5c85ea34-b4kbzm, carpeta uriel/. Lee primero uriel/README.md (índice),
uriel/BLUEPRINT_V6.md (arquitectura y pruebas) y uriel/MANIFIESTO_V6.md (reglas).

Módulos C++17 en uriel/native/, header-only, probados con ctest
(g++, clang++, ASan+UBSan, TSan):
- secure_buffer.hpp: memoria protegida para secretos.
- audit_log.hpp: bitácora append-only con cadena HMAC-SHA256 (requiere OpenSSL).
- vector_memory.hpp: memoria vectorial con interfaz Embedder; HashingEmbedder léxico
  por defecto, sin dependencias; persistencia atómica validada; hook hacia AuditLog.

Reglas: nada se declara listo sin compilarlo y sin pruebas que intenten romperlo;
cifras siempre medidas; límites explícitos (root, ARM/x86, Android/Linux).

Siguiente tarea: <describe aquí lo que sigue>.
```
