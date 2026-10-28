#!/bin/bash
# FastDL PRO - Instalador Automático para Linux y macOS
# Autor: Claude Code
# Descripción: Instala FastDL PRO con todas sus dependencias

set -e

echo ""
echo "======================================================"
echo "FastDL PRO - Instalador Automático"
echo "======================================================"
echo ""

# Detectar sistema operativo
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    PACKAGE_MANAGER=""
    if command -v apt-get &> /dev/null; then
        PACKAGE_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
    elif command -v pacman &> /dev/null; then
        PACKAGE_MANAGER="pacman"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    PACKAGE_MANAGER="brew"
else
    echo "❌ Sistema operativo no soportado"
    exit 1
fi

echo "✅ Sistema operativo detectado: $OS"
echo ""

# Verificar si Python 3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "⚙️  Instalando Python 3..."

    case $PACKAGE_MANAGER in
        apt)
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip python3-venv
            ;;
        yum)
            sudo yum install -y python3 python3-pip
            ;;
        pacman)
            sudo pacman -Sy --noconfirm python python-pip
            ;;
        brew)
            brew install python3
            ;;
        *)
            echo "❌ No se puede instalar Python automáticamente"
            echo "   Por favor instala Python 3 manualmente"
            exit 1
            ;;
    esac
fi

echo "✅ Python 3 encontrado"
python3 --version

# Verificar pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 no está disponible"
    exit 1
fi

echo "✅ pip3 disponible"
echo ""

# Crear carpeta de descargas
mkdir -p ~/Downloads
echo "✅ Carpeta de descargas lista"
echo ""

# Instalar dependencias de Python
echo "Instalando dependencias de Python..."
echo ""

pip3 install --upgrade pip
pip3 install PyQt6==6.6.1
pip3 install aiohttp==3.9.1
pip3 install aiofiles==23.2.1
pip3 install beautifulsoup4==4.12.2
pip3 install requests==2.31.0
pip3 install pydantic==2.5.0

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""
echo "======================================================"
echo "✅ Instalación completada correctamente"
echo "======================================================"
echo ""

# Obtener ruta del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Ejecutar la aplicación
echo "Iniciando FastDL PRO..."
echo ""

cd "$SCRIPT_DIR"
python3 src/main.py

exit 0
