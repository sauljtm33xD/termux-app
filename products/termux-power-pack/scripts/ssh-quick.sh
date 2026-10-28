#!/data/data/com.termux/files/usr/bin/bash
#
# ssh-quick.sh — Deja un servidor SSH funcionando en Termux en un solo paso
#
# Instala openssh si falta, genera una clave ed25519 si no existe,
# arranca sshd y muestra los datos exactos para conectarte desde otro
# equipo en la misma red.
#
# Uso: ssh-quick.sh

set -euo pipefail

echo "== ssh-quick: configurando SSH en Termux =="
echo ""

if ! command -v sshd >/dev/null 2>&1; then
  echo "[1/4] Instalando openssh..."
  pkg install -y openssh
else
  echo "[1/4] openssh ya está instalado."
fi

echo ""
echo "[2/4] Clave de usuario..."
if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
  mkdir -p "$HOME/.ssh"
  ssh-keygen -t ed25519 -N "" -f "$HOME/.ssh/id_ed25519" -C "termux-quick-$(date +%Y%m%d)"
  echo "  Clave generada en ~/.ssh/id_ed25519"
else
  echo "  Ya existe una clave en ~/.ssh/id_ed25519, se conserva."
fi

echo ""
echo "[3/4] Arrancando sshd..."
sshd

echo ""
echo "[4/4] Datos de conexión"
PORT=8022
USER_NAME="$(whoami)"
IP_LOCAL="$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}')"
[ -z "$IP_LOCAL" ] && IP_LOCAL="<IP-de-tu-telefono-en-la-WiFi>"

echo "  Usuario:   $USER_NAME"
echo "  Puerto:    $PORT (puerto por defecto de Termux, cambia con 'sshd -p <puerto>')"
echo "  IP local:  $IP_LOCAL"
echo ""
echo "  Desde otro equipo en la misma red:"
echo "    ssh -p $PORT $USER_NAME@$IP_LOCAL"
echo ""
echo "  Pon una contraseña con 'passwd' si vas a conectarte con usuario/clave"
echo "  en vez de una llave SSH."
