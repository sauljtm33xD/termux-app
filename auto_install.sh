#!/bin/bash
# FastDL PRO - Instalador Automático Completo
# Soporta: Linux, macOS, Windows (WSL/Git Bash)

set -e

# Colores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Bandera
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║         FastDL PRO - Instalador Automático             ║"
echo "║          High-Speed PC File Downloader                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detectar SO
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)
echo -e "${GREEN}✓ Sistema Operativo Detectado: $OS${NC}"

# Función para imprimir pasos
print_step() {
    echo -e "${BLUE}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Paso 1: Verificar Python
print_step "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no encontrado"
    echo "Por favor instala Python 3.10+ desde: https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
print_success "Python $PYTHON_VERSION encontrado"

# Paso 2: Verificar pip
print_step "Verificando pip..."
if ! python3 -m pip --version &> /dev/null; then
    print_error "pip no encontrado, instalando..."
    python3 -m ensurepip --upgrade
fi
print_success "pip disponible"

# Paso 3: Actualizar pip
print_step "Actualizando pip..."
python3 -m pip install --upgrade pip setuptools wheel --quiet
print_success "pip actualizado"

# Paso 4: Instalar dependencias
print_step "Instalando dependencias..."
if [ -f "requirements.txt" ]; then
    python3 -m pip install -r requirements.txt --quiet
    print_success "Dependencias instaladas"
else
    print_error "requirements.txt no encontrado"
    exit 1
fi

# Paso 5: Crear directorios
print_step "Creando directorios necesarios..."
mkdir -p "$HOME/.fastdl/logs"
mkdir -p "$HOME/Downloads/FastDL"
print_success "Directorios creados"

# Paso 6: Crear acceso directo
print_step "Creando accesos directos..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$OS" = "linux" ]; then
    # Linux - Desktop Entry
    DESKTOP_DIR="$HOME/.local/share/applications"
    mkdir -p "$DESKTOP_DIR"

    cat > "$DESKTOP_DIR/fastdl.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=FastDL PRO
Comment=Descargador ultrarrápido de archivos
Exec=python3 $SCRIPT_DIR/src/main.py
Icon=download
Terminal=false
Categories=Utility;Network;
StartupNotify=true
EOF
    chmod +x "$DESKTOP_DIR/fastdl.desktop"
    print_success "Acceso directo creado en: $DESKTOP_DIR/fastdl.desktop"

elif [ "$OS" = "macos" ]; then
    # macOS - App Bundle
    APP_DIR="$HOME/Applications/FastDL.app"
    mkdir -p "$APP_DIR/Contents/MacOS"
    mkdir -p "$APP_DIR/Contents/Resources"

    cat > "$APP_DIR/Contents/MacOS/FastDL" << EOF
#!/bin/bash
cd "$SCRIPT_DIR"
python3 src/main.py
EOF
    chmod +x "$APP_DIR/Contents/MacOS/FastDL"

    cat > "$APP_DIR/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>FastDL</string>
    <key>CFBundleIdentifier</key>
    <string>com.fastdl.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>FastDL PRO</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
</dict>
</plist>
EOF
    print_success "App Bundle creado en: $APP_DIR"

elif [ "$OS" = "windows" ]; then
    # Windows - Acceso directo en escritorio
    DESKTOP="$USERPROFILE/Desktop"
    if [ -d "$DESKTOP" ]; then
        cp FastDL.bat "$DESKTOP/FastDL PRO.bat"
        print_success "Acceso directo creado en Escritorio"
    fi
fi

# Paso 7: Crear script ejecutable
print_step "Creando script ejecutable..."
cat > "$SCRIPT_DIR/launch_fastdl.sh" << 'LAUNCH_SCRIPT'
#!/bin/bash
cd "$(dirname "$0")"
python3 src/main.py
LAUNCH_SCRIPT
chmod +x "$SCRIPT_DIR/launch_fastdl.sh"
print_success "Script ejecutable creado"

# Paso 8: Crear configuración
print_step "Inicializando configuración..."
cat > "$HOME/.fastdl/config.json" << 'CONFIG'
{
    "version": "1.0",
    "download_folder": "~/Downloads/FastDL",
    "parallel_connections": 8,
    "resume_downloads": true,
    "chunk_size": 262144
}
CONFIG
print_success "Configuración inicializada"

# Paso 9: Crear acceso directo en Inicio Rápido (si es Linux)
if [ "$OS" = "linux" ] && command -v gnome-desktop-item-edit &> /dev/null; then
    print_step "Agregando a accesos rápidos de GNOME..."
    gsettings set org.gnome.shell favorite-apps "[$(gsettings get org.gnome.shell favorite-apps | sed "s/']/', 'fastdl.desktop']/"), ]" 2>/dev/null || true
fi

# Paso Final: Resumen
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✓ INSTALACIÓN COMPLETADA EXITOSAMENTE             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📦 INFORMACIÓN DE INSTALACIÓN:${NC}"
echo "  • Sistema: $OS"
echo "  • Python: $PYTHON_VERSION"
echo "  • Carpeta de instalación: $SCRIPT_DIR"
echo "  • Carpeta de descargas: ~/Downloads/FastDL"
echo ""

echo -e "${BLUE}🚀 PARA EJECUTAR FASTDL PRO:${NC}"
if [ "$OS" = "linux" ]; then
    echo "  • Método 1: Busca 'FastDL' en tu menú de aplicaciones"
    echo "  • Método 2: Ejecuta: python3 $SCRIPT_DIR/src/main.py"
    echo "  • Método 3: Ejecuta: $SCRIPT_DIR/launch_fastdl.sh"
elif [ "$OS" = "macos" ]; then
    echo "  • Abre: ~/Applications/FastDL.app"
    echo "  • O ejecuta: python3 $SCRIPT_DIR/src/main.py"
elif [ "$OS" = "windows" ]; then
    echo "  • Busca 'FastDL' en el escritorio"
    echo "  • O ejecuta: python src/main.py"
fi

echo ""
echo -e "${BLUE}📚 DOCUMENTACIÓN:${NC}"
echo "  • Guía Completa: FASTDL_README.md"
echo "  • Inicio Rápido: QUICKSTART.md"
echo "  • Para Desarrolladores: DEVELOPER_GUIDE.md"
echo ""

echo -e "${BLUE}⚙️  PRÓXIMOS PASOS:${NC}"
echo "  1. Abre FastDL PRO"
echo "  2. Configura tu carpeta de descargas"
echo "  3. ¡Comienza a descargar archivos!"
echo ""

echo -e "${GREEN}¡Instalación completada! ¡Disfruta FastDL PRO!${NC}"
