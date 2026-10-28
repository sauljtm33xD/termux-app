#!/data/data/com.termux/files/usr/bin/bash
#
# backup-termux.sh — Copia de seguridad completa del entorno Termux
#
# Genera dos archivos con la misma marca de tiempo en el directorio de
# destino:
#   termux-backup-<fecha>.tar.gz   -> todo $HOME (sin storage/ ni .cache/)
#   termux-backup-<fecha>.manifest -> paquetes instalados (pkg/pip/npm/gem)
#
# Uso:
#   backup-termux.sh [directorio_destino]
#
# Por defecto guarda en ~/storage/shared/TermuxBackups (requiere haber
# ejecutado `termux-setup-storage` una vez).

set -euo pipefail

DEST="${1:-$HOME/storage/shared/TermuxBackups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$DEST/termux-backup-${STAMP}.tar.gz"
MANIFEST="$DEST/termux-backup-${STAMP}.manifest"

mkdir -p "$DEST"

echo "==> Generando manifiesto de paquetes instalados..."
{
  echo "# Paquetes pkg"
  pkg list-installed 2>/dev/null || true
  if command -v pip >/dev/null 2>&1; then
    echo ""
    echo "# Paquetes pip"
    pip freeze 2>/dev/null || true
  fi
  if command -v npm >/dev/null 2>&1; then
    echo ""
    echo "# Paquetes npm globales"
    npm ls -g --depth=0 2>/dev/null || true
  fi
  if command -v gem >/dev/null 2>&1; then
    echo ""
    echo "# Gemas de Ruby"
    gem list 2>/dev/null || true
  fi
} > "$MANIFEST"

echo "==> Empaquetando \$HOME..."
tar -czf "$ARCHIVE" \
    --exclude="./storage" \
    --exclude="./.cache" \
    -C "$HOME" .

SIZE=$(du -h "$ARCHIVE" | cut -f1)
echo ""
echo "✅ Backup completado:"
echo "   - $ARCHIVE ($SIZE)"
echo "   - $MANIFEST"
echo "   Restaura con: ./restore-termux.sh \"$ARCHIVE\""
