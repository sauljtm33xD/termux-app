#!/bin/bash

# Instalador de Termux Manager
# Descarga, configura e instala Termux Manager automáticamente
# Uso: bash install-termux-manager.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║      📱 INSTALADOR DE TERMUX MANAGER 1.0                  ║
║      Gestor de herramientas sin root para Termux         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Variables
TERMUX_PREFIX="${PREFIX:-$HOME/../usr}"
INSTALL_DIR="$HOME/.termux-manager"
BIN_DIR="$TERMUX_PREFIX/bin"
GITHUB_RAW="https://raw.githubusercontent.com/termux/termux-app/claude/termux-executable-no-root-w55bb0"

# Colores
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

# Verificar si estamos en Termux
if [[ ! -d "$TERMUX_PREFIX" ]]; then
    log_error "Este instalador solo funciona en Termux"
    log_info "Descarga Termux desde: https://termux.com"
    exit 1
fi

log_success "¡Termux detectado!"
echo ""

# Crear directorio de instalación
log_info "Creando directorio de instalación..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
log_success "Directorios listos"
echo ""

# Descargar termux-manager
log_info "Descargando Termux Manager..."
if command -v wget &>/dev/null; then
    wget -q "$GITHUB_RAW/termux-manager" -O "$INSTALL_DIR/termux-manager" 2>/dev/null || {
        log_error "Error descargando con wget"
        exit 1
    }
elif command -v curl &>/dev/null; then
    curl -s "$GITHUB_RAW/termux-manager" -o "$INSTALL_DIR/termux-manager" 2>/dev/null || {
        log_error "Error descargando con curl"
        exit 1
    }
else
    log_error "Se requiere wget o curl"
    exit 1
fi
log_success "Descarga completada"
echo ""

# Hacer el script ejecutable
log_info "Configurando permisos..."
chmod +x "$INSTALL_DIR/termux-manager"
log_success "Permisos configurados"
echo ""

# Crear enlace simbólico en el PATH
log_info "Instalando en el PATH..."
ln -sf "$INSTALL_DIR/termux-manager" "$BIN_DIR/termux-manager"
log_success "Ejecutable instalado globalmente"
echo ""

# Crear alias en bashrc
log_info "Configurando alias en .bashrc..."
if ! grep -q "alias termux-manager" "$HOME/.bashrc" 2>/dev/null; then
    echo "alias termux-manager='$INSTALL_DIR/termux-manager'" >> "$HOME/.bashrc"
    log_success "Alias añadido"
else
    log_warning "Alias ya existe"
fi
echo ""

# Mostrar información final
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
log_success "¡INSTALACIÓN COMPLETADA!"
echo ""
echo -e "${CYAN}📍 Ubicación:${NC} $INSTALL_DIR/termux-manager"
echo -e "${CYAN}🚀 Cómo usar:${NC}"
echo ""
echo -e "  ${GREEN}1. Abre Termux${NC}"
echo -e "  ${GREEN}2. Ejecuta:${NC} ${YELLOW}termux-manager${NC}"
echo -e "  ${GREEN}3. Elige una opción del menú${NC}"
echo ""
echo -e "${CYAN}⚡ Comandos rápidos:${NC}"
echo ""
echo -e "  ${YELLOW}termux-manager${NC}                    - Menú interactivo"
echo -e "  ${YELLOW}termux-manager install-basic${NC}     - Instalar lo básico"
echo -e "  ${YELLOW}termux-manager install-community${NC} - Herramientas especiales"
echo -e "  ${YELLOW}termux-manager system-info{{NC}        - Info del sistema"
echo -e "  ${YELLOW}termux-manager root-info{{NC}         - Info sobre root"
echo -e "  ${YELLOW}termux-manager optimize{{NC}         - Limpiar y actualizar"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Preguntar si ejecutar ahora
read -p "¿Deseas ejecutar Termux Manager ahora? (s/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    "$INSTALL_DIR/termux-manager"
else
    log_info "Para ejecutar más tarde, usa: termux-manager"
fi
