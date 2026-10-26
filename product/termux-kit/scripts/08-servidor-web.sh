#!/data/data/com.termux/files/usr/bin/bash
# Comparte una carpeta por la red local con un servidor web simple.
# Uso: ./08-servidor-web.sh [carpeta] [puerto]
DIR="${1:-$HOME/storage/shared}"; PORT="${2:-8000}"
IP=$(ip -4 addr show wlan0 2>/dev/null | awk '/inet /{print $2}' | cut -d/ -f1)
echo "Sirviendo $DIR en http://$IP:$PORT  (Ctrl+C para detener)"
cd "$DIR" && python -m http.server "$PORT"
