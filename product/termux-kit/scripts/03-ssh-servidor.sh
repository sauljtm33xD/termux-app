#!/data/data/com.termux/files/usr/bin/bash
# Activa un servidor SSH en el teléfono (puerto 8022) para entrar desde tu PC.
set -e
pkg install -y openssh
echo "Define una contraseña para este usuario:"
passwd
sshd
echo "SSH activo en el puerto 8022."
echo "Tu usuario: $(whoami)"
echo "Tu IP local: $(ip -4 addr show wlan0 2>/dev/null | awk '/inet /{print $2}' | cut -d/ -f1)"
echo "Desde tu PC: ssh -p 8022 $(whoami)@<IP>"
