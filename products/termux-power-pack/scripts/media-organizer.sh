#!/data/data/com.termux/files/usr/bin/bash
#
# media-organizer.sh — Ordena una carpeta de descargas por tipo y fecha
#
# Mueve cada archivo a <destino>/<tipo>/<AAAA-MM>/, donde <tipo> es
# imagenes, videos, audio, documentos u otros, según su extensión.
#
# Uso:
#   media-organizer.sh <carpeta_origen> [carpeta_destino]
#
# Si no se indica destino, organiza dentro de la misma carpeta de origen.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: media-organizer.sh <carpeta_origen> [carpeta_destino]" >&2
  exit 1
fi

SRC="$1"
DST="${2:-$1}"

if [ ! -d "$SRC" ]; then
  echo "❌ No existe la carpeta: $SRC" >&2
  exit 1
fi

clasificar() {
  case "${1,,}" in
    *.jpg|*.jpeg|*.png|*.gif|*.webp|*.heic) echo "imagenes" ;;
    *.mp4|*.mkv|*.webm|*.avi|*.mov)         echo "videos" ;;
    *.mp3|*.m4a|*.ogg|*.flac|*.wav)         echo "audio" ;;
    *.pdf|*.doc|*.docx|*.xls|*.xlsx|*.txt|*.odt) echo "documentos" ;;
    *) echo "otros" ;;
  esac
}

find "$SRC" -maxdepth 1 -type f | while read -r f; do
  nombre="$(basename "$f")"
  tipo="$(clasificar "$nombre")"
  mes="$(date -r "$f" +%Y-%m 2>/dev/null || date +%Y-%m)"
  carpeta_destino="$DST/$tipo/$mes"
  mkdir -p "$carpeta_destino"
  mv -n "$f" "$carpeta_destino/" && echo "  -> $nombre  ==>  $tipo/$mes/"
done

echo ""
echo "✅ Organización completada en: $DST"
