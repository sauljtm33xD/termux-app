#!/data/data/com.termux/files/usr/bin/bash
# Configura git y genera una llave SSH para GitHub.
set -e
pkg install -y git openssh
read -rp "Tu nombre: " N
read -rp "Tu correo: " E
git config --global user.name "$N"
git config --global user.email "$E"
git config --global init.defaultBranch main
[ -f ~/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -C "$E" -f ~/.ssh/id_ed25519 -N ""
echo "Copia esta llave pública en GitHub > Settings > SSH keys:"
cat ~/.ssh/id_ed25519.pub
