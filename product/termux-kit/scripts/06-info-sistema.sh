#!/data/data/com.termux/files/usr/bin/bash
# Resumen rápido del dispositivo: almacenamiento, memoria, batería y red.
echo "== Sistema =="; uname -a
echo "== Almacenamiento =="; df -h "$HOME" | tail -1
echo "== Memoria =="; free -h 2>/dev/null | head -2
echo "== Batería =="
command -v termux-battery-status >/dev/null && termux-battery-status || echo "Instala termux-api"
echo "== IP local =="; ip -4 addr show wlan0 2>/dev/null | awk '/inet /{print $2}'
