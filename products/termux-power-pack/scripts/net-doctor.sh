#!/data/data/com.termux/files/usr/bin/bash
#
# net-doctor.sh — Diagnóstico rápido de red para Termux
#
# Comprueba, en orden, lo más probable que esté fallando cuando "no hay
# internet": conectividad básica, DNS, IP pública y latencia aproximada.
# No requiere herramientas externas más allá de las que trae Termux
# (ping, curl); si existen, usa también `dig` y `traceroute`.
#
# Uso: net-doctor.sh

set -uo pipefail

ok()   { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; }
info() { echo "  ℹ️  $1"; }

echo "== net-doctor: diagnóstico de red =="
echo ""

echo "[1/5] Conectividad básica (ping a 1.1.1.1)"
if ping -c 2 -W 2 1.1.1.1 >/dev/null 2>&1; then
  ok "Hay salida a internet por IP."
else
  fail "No hay respuesta a 1.1.1.1. Revisa WiFi/datos móviles o el firewall."
fi
echo ""

echo "[2/5] Resolución DNS (ping a google.com)"
if ping -c 2 -W 2 google.com >/dev/null 2>&1; then
  ok "El DNS resuelve nombres correctamente."
else
  fail "Falla la resolución DNS. Prueba a cambiar el DNS del dispositivo (p.ej. 1.1.1.1 u 8.8.8.8)."
fi
echo ""

echo "[3/5] IP pública y proveedor"
if command -v curl >/dev/null 2>&1; then
  PUBIP="$(curl -s -m 5 https://ifconfig.me 2>/dev/null || true)"
  if [ -n "$PUBIP" ]; then
    info "IP pública: $PUBIP"
  else
    fail "No se pudo obtener la IP pública (curl falló o sin internet)."
  fi
else
  info "curl no está instalado (pkg install curl) — se omite esta prueba."
fi
echo ""

echo "[4/5] Latencia aproximada (10 pings a 1.1.1.1)"
if command -v ping >/dev/null 2>&1; then
  ping -c 10 -i 0.3 1.1.1.1 2>/dev/null | tail -3
else
  info "ping no disponible."
fi
echo ""

echo "[5/5] Ruta de red (si hay traceroute/tracepath instalado)"
if command -v traceroute >/dev/null 2>&1; then
  traceroute -m 10 1.1.1.1 2>/dev/null
elif command -v tracepath >/dev/null 2>&1; then
  tracepath 1.1.1.1 2>/dev/null
else
  info "Ninguna herramienta de traza instalada (pkg install traceroute para más detalle)."
fi

echo ""
echo "== Fin del diagnóstico =="
