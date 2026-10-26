#!/data/data/com.termux/files/usr/bin/env bash
# Termux Power Pack - instalador. Uso: bash install.sh
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
PKGS=(git curl wget openssh python nodejs qrencode jq rsync zip unzip tmux nano htop termux-api)

echo "==> Actualizando paquetes..."
pkg update -y && pkg upgrade -y
echo "==> Instalando herramientas: ${PKGS[*]}"
pkg install -y "${PKGS[@]}"

mkdir -p "$HOME/bin"
cp "$SRC"/bin/tp-* "$HOME/bin/"
chmod +x "$HOME"/bin/tp-*

MARK="# >>> termux-power-pack >>>"
if ! grep -qF "$MARK" "$HOME/.bashrc" 2>/dev/null; then
  { echo "$MARK"; cat "$SRC/config/bashrc.sh"; echo "# <<< termux-power-pack <<<"; } >> "$HOME/.bashrc"
fi
cp "$SRC/config/tmux.conf" "$HOME/.tmux.conf"

echo "==> Listo. Cierra y abre Termux, luego escribe: tp-help"
