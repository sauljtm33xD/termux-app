#!/bin/bash
# FastDL PRO - Ejecutor Automático Inteligente
# Verifica todo antes de ejecutar y maneja errores

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║           FastDL PRO - Ejecutor Automático                ║
║         High-Speed File Downloader for PC                 ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Función para verificar requisitos
check_requirement() {
    local name=$1
    local command=$2

    if command -v $command &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name encontrado"
        return 0
    else
        echo -e "${RED}✗${NC} $name NO encontrado"
        return 1
    fi
}

# Función para verificar archivo
check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
        return 0
    else
        echo -e "${RED}✗${NC} $file NO encontrado"
        return 1
    fi
}

echo ""
echo -e "${BLUE}📋 VERIFICANDO REQUISITOS...${NC}"
echo ""

# Verificar Python
if ! check_requirement "Python 3" "python3"; then
    echo ""
    echo -e "${RED}Error: Python 3 no está instalado${NC}"
    echo "Descárgalo desde: https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "   Versión: Python $PYTHON_VERSION"
echo ""

# Verificar archivos clave
echo -e "${BLUE}📁 VERIFICANDO ARCHIVOS...${NC}"
echo ""

FILES_OK=true
check_file "src/main.py" || FILES_OK=false
check_file "requirements.txt" || FILES_OK=false
check_file "src/config.py" || FILES_OK=false
check_file "src/ui/main_window.py" || FILES_OK=false

if [ "$FILES_OK" = false ]; then
    echo ""
    echo -e "${RED}Error: Faltan archivos del proyecto${NC}"
    echo "Asegúrate de estar en el directorio correcto de FastDL"
    exit 1
fi

echo ""

# Verificar dependencias Python
echo -e "${BLUE}📦 VERIFICANDO DEPENDENCIAS PYTHON...${NC}"
echo ""

check_python_module() {
    local module=$1
    local display_name=$2
    python3 -c "import $module" 2>/dev/null && echo -e "${GREEN}✓${NC} $display_name" || (echo -e "${RED}✗${NC} $display_name - Instalando..." && python3 -m pip install -q --upgrade pip && python3 -m pip install -q -r requirements.txt)
}

check_python_module "PyQt6" "PyQt6 (GUI)" || true
check_python_module "aiohttp" "aiohttp (Descargas)" || true
check_python_module "aiofiles" "aiofiles (I/O)" || true

echo ""

# Verificar conexión a internet
echo -e "${BLUE}🌐 VERIFICANDO CONEXIÓN...${NC}"
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Conexión a internet OK"
else
    echo -e "${YELLOW}⚠${NC} No hay conexión a internet (algunas características pueden no funcionar)"
fi

echo ""

# Crear directorios necesarios
echo -e "${BLUE}📂 PREPARANDO DIRECTORIOS...${NC}"
mkdir -p "$HOME/.fastdl/logs" 2>/dev/null
mkdir -p "$HOME/Downloads/FastDL" 2>/dev/null
echo -e "${GREEN}✓${NC} Directorios listos"
echo ""

# Resumen de información
echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}INFORMACIÓN DEL SISTEMA${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"
echo "SO: $(uname -s)"
echo "Python: $PYTHON_VERSION"
echo "Carpeta: $SCRIPT_DIR"
echo "Descargas: $HOME/Downloads/FastDL"
echo ""

# Dar opción de verificar solo o ejecutar
echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}¿QUÉ DESEAS HACER?${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════${NC}"
echo "1) ${GREEN}Ejecutar FastDL PRO${NC}"
echo "2) ${YELLOW}Verificar instalación${NC}"
echo "3) ${YELLOW}Reinstalar dependencias${NC}"
echo "4) ${RED}Salir${NC}"
echo ""

read -p "Selecciona una opción (1-4): " option

case $option in
    1)
        echo ""
        echo -e "${GREEN}🚀 Iniciando FastDL PRO...${NC}"
        echo ""
        python3 src/main.py
        ;;
    2)
        echo ""
        echo -e "${GREEN}✓ Verificación completada exitosamente${NC}"
        echo "  La instalación está lista para ejecutar"
        echo ""
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Reinstalando dependencias...${NC}"
        python3 -m pip install --upgrade pip
        python3 -m pip install -r requirements.txt
        echo -e "${GREEN}✓ Dependencias reinstaladas${NC}"
        echo ""
        echo "Ejecuta: python3 src/main.py"
        ;;
    4)
        echo ""
        echo -e "${BLUE}Hasta luego!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac
