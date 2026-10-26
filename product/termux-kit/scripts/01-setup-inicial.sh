#!/data/data/com.termux/files/usr/bin/bash
# Configuración inicial de Termux: actualiza e instala herramientas esenciales.
set -e
echo "==> Actualizando paquetes..."
pkg update -y && pkg upgrade -y
echo "==> Instalando herramientas esenciales..."
pkg install -y git curl wget nano vim openssh python nodejs zip unzip htop tree jq termux-api
echo "==> Acceso al almacenamiento (acepta el permiso en pantalla)..."
termux-setup-storage || true
echo "Listo. Reinicia Termux para aplicar todo."
