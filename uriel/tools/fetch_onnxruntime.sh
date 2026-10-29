#!/usr/bin/env bash
# Prepara ONNX Runtime para compilar con -DURIEL_WITH_ONNX=ON en Linux x86_64/arm64.
#   - Biblioteca: paquete oficial "onnxruntime" de PyPI (trae libonnxruntime.so).
#   - Headers C/C++: AAR oficial de Android en Maven Central (misma versión), con SHA-1 verificado.
# Uso: uriel/tools/fetch_onnxruntime.sh <carpeta_destino> [versión]
# Resultado: <destino>/include y <destino>/lib, listos para -DONNXRUNTIME_ROOT=<destino>
set -euo pipefail

DEST=${1:?uso: fetch_onnxruntime.sh <carpeta_destino> [versión]}
VER=${2:-1.31.0}
mkdir -p "$DEST"
DEST=$(cd "$DEST" && pwd)
WORK="$DEST/.work"
mkdir -p "$WORK" "$DEST/lib"

python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install -q "onnxruntime==$VER"
SO=$(find "$WORK/venv" -name "libonnxruntime.so.$VER" | head -n1)
[ -n "$SO" ] || { echo "no se encontró libonnxruntime.so.$VER en el paquete" >&2; exit 1; }
cp "$SO" "$DEST/lib/"
ln -sf "libonnxruntime.so.$VER" "$DEST/lib/libonnxruntime.so.1"
ln -sf "libonnxruntime.so.$VER" "$DEST/lib/libonnxruntime.so"

BASE="https://repo1.maven.org/maven2/com/microsoft/onnxruntime/onnxruntime-android/$VER"
curl -sSfL --retry 5 --retry-delay 5 --retry-all-errors -o "$WORK/ort.aar" "$BASE/onnxruntime-android-$VER.aar"
curl -sSfL --retry 5 --retry-delay 5 --retry-all-errors -o "$WORK/ort.aar.sha1" "$BASE/onnxruntime-android-$VER.aar.sha1"
echo "$(cat "$WORK/ort.aar.sha1")  $WORK/ort.aar" | sha1sum -c --quiet
mkdir -p "$WORK/aar" && (cd "$WORK/aar" && unzip -q -o ../ort.aar 'headers/*')
mkdir -p "$DEST/include" && cp "$WORK/aar/headers/"* "$DEST/include/"

echo "ONNX Runtime $VER listo en $DEST"
