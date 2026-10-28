#!/data/data/com.termux/files/usr/bin/bash
#
# restore-termux.sh — Restaura un backup generado por backup-termux.sh
#
# Uso:
#   restore-termux.sh /ruta/a/termux-backup-YYYYMMDD-HHMMSS.tar.gz
#
# Extrae el archivo sobre $HOME. Pide confirmación porque puede
# sobrescribir archivos existentes.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: restore-termux.sh /ruta/al/backup.tar.gz" >&2
  exit 1
fi

ARCHIVE="$1"

if [ ! -f "$ARCHIVE" ]; then
  echo "❌ No se encontró el archivo: $ARCHIVE" >&2
  exit 1
fi

echo "⚠️  Esto extraerá el contenido de:"
echo "    $ARCHIVE"
echo "    sobre: $HOME"
echo "    Los archivos existentes con el mismo nombre se sobrescribirán."
read -r -p "¿Continuar? [s/N] " CONFIRM
case "$CONFIRM" in
  s|S|si|Si|SI) ;;
  *) echo "Cancelado."; exit 0 ;;
esac

tar -xzf "$ARCHIVE" -C "$HOME"

MANIFEST="${ARCHIVE%.tar.gz}.manifest"
echo ""
echo "✅ Archivos restaurados en \$HOME."
if [ -f "$MANIFEST" ]; then
  echo "ℹ️  Hay un manifiesto de paquetes junto al backup:"
  echo "    $MANIFEST"
  echo "   Revísalo y reinstala con 'pkg install <paquete>' lo que necesites;"
  echo "   este script no reinstala paquetes automáticamente para evitar"
  echo "   sobrescribir versiones distintas sin que lo decidas tú."
fi
