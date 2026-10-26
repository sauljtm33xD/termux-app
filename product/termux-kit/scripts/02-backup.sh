#!/data/data/com.termux/files/usr/bin/bash
# Respaldo comprimido de tu HOME de Termux al almacenamiento compartido.
# Uso: ./02-backup.sh
set -e
DEST="$HOME/storage/shared/termux-backups"
mkdir -p "$DEST"
FILE="$DEST/termux-home-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$FILE" -C "$HOME" --exclude=storage .
echo "Respaldo creado: $FILE"
echo "Restaurar: tar -xzf <archivo> -C \$HOME"
