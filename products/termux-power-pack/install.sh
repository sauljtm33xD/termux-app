#!/data/data/com.termux/files/usr/bin/bash
#
# install.sh — Instala Termux Power Pack en ~/bin
#
# Copia todos los scripts de scripts/ a ~/bin, les da permiso de
# ejecución y comprueba que ~/bin esté en el PATH.
#
# Uso: ./install.sh

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
BIN="$HOME/bin"

mkdir -p "$BIN"

echo "== Instalando Termux Power Pack =="
for f in "$HERE"/scripts/*.sh; do
  nombre="$(basename "$f")"
  cp "$f" "$BIN/$nombre"
  chmod +x "$BIN/$nombre"
  echo "  ✅ $nombre instalado en ~/bin/$nombre"
done

echo ""
case ":$PATH:" in
  *":$BIN:"*)
    echo "ℹ️  ~/bin ya está en tu PATH. Puedes usar los comandos directamente."
    ;;
  *)
    echo "⚠️  ~/bin no está en tu PATH todavía. Añade esta línea a tu ~/.bashrc:"
    echo '      export PATH="$HOME/bin:$PATH"'
    echo "   y luego ejecuta: source ~/.bashrc"
    ;;
esac

echo ""
echo "✅ Instalación completa. Prueba con: system-info.sh"
