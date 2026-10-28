#!/data/data/com.termux/files/usr/bin/bash
#
# system-info.sh — Panel rápido del estado del dispositivo y Termux
#
# Muestra batería, almacenamiento, memoria, red y versión de Termux en
# una sola pantalla legible. Usa termux-api si está instalado para los
# datos de batería (pkg install termux-api + app Termux:API).
#
# Uso: system-info.sh

set -uo pipefail

line() { printf '%s\n' "----------------------------------------"; }

echo "== Panel de estado — $(date '+%Y-%m-%d %H:%M:%S') =="
line

echo "📦 Termux"
echo "  Versión del paquete termux-tools: $(pkg list-installed termux-tools 2>/dev/null | tail -1)"
echo "  PREFIX: $PREFIX"
line

echo "💾 Almacenamiento"
df -h "$HOME" 2>/dev/null | awk 'NR==1 || NR==2'
line

echo "🧠 Memoria"
if [ -r /proc/meminfo ]; then
  awk '/MemTotal|MemAvailable/ {printf "  %-14s %.1f MB\n", $1, $2/1024}' /proc/meminfo
else
  echo "  No accesible en este dispositivo."
fi
line

echo "🔋 Batería"
if command -v termux-battery-status >/dev/null 2>&1; then
  termux-battery-status
else
  echo "  Instala termux-api (pkg install termux-api) y la app Termux:API"
  echo "  para ver el estado de batería aquí."
fi
line

echo "🌐 Red"
IP_LOCAL="$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}')"
echo "  IP local: ${IP_LOCAL:-sin conexión detectada}"
if ping -c 1 -W 2 1.1.1.1 >/dev/null 2>&1; then
  echo "  Internet: conectado"
else
  echo "  Internet: sin respuesta"
fi
line

echo "✅ Fin del panel. Ejecuta net-doctor.sh para un diagnóstico de red más completo."
