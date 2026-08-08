#!/bin/bash
# Script de setup automático para MAYORDOMO en Linux/Mac
# Este script instala todas las dependencias y configura VS Code

echo "==============================================="
echo "  MAYORDOMO Swiss Knife - Setup Automático"
echo "  Linux/Mac Edition"
echo "==============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "[1/6] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Para Mac: brew install node"
    echo "Para Linux: sudo apt-get install nodejs npm"
    exit 1
fi
echo -e "${GREEN}✅ Node.js instalado ($(node --version))${NC}"

# Verificar Git
echo "[2/6] Verificando Git..."
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado${NC}"
    echo "Para Mac: brew install git"
    echo "Para Linux: sudo apt-get install git"
    exit 1
fi
echo -e "${GREEN}✅ Git instalado${NC}"

# Instalar Claude Code
echo "[3/6] Instalando Claude Code CLI..."
npm install -g @anthropic-ai/claude-code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Claude Code instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Error instalando Claude Code${NC}"
fi

# Crear .vscode/settings.json
echo "[4/6] Configurando VS Code..."
mkdir -p .vscode
cp .vscode-settings.json .vscode/settings.json 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ VS Code configurado${NC}"
else
    echo -e "${YELLOW}⚠️  Error copiando settings${NC}"
fi

# Instalar extensions VS Code
echo "[5/6] Instalando extensions VS Code..."
code --install-extension esbenp.prettier-vscode &>/dev/null
code --install-extension dbaeumer.vscode-eslint &>/dev/null
code --install-extension ritwickdey.LiveServer &>/dev/null
code --install-extension eamodio.gitlens &>/dev/null
code --install-extension rangav.vscode-thunder-client &>/dev/null
code --install-extension coenraads.bracket-pair-colorizer &>/dev/null
echo -e "${GREEN}✅ Extensions instaladas${NC}"

# Crear script de inicio
echo "[6/6] Creando script de inicio..."
SCRIPT_PATH="$HOME/start-mayordomo.sh"
cat > "$SCRIPT_PATH" << 'EOF'
#!/bin/bash
clear
echo "=============================="
echo "MAYORDOMO Swiss Knife"
echo "=============================="
echo ""
echo "Iniciando VS Code con Claude Code..."
echo ""
cd "$(dirname "$0")/termux-app" || exit
code .
EOF

chmod +x "$SCRIPT_PATH"
echo -e "${GREEN}✅ Script de inicio creado: $SCRIPT_PATH${NC}"

# Resumen
echo ""
echo "==============================================="
echo -e "${GREEN}✅ SETUP COMPLETADO EXITOSAMENTE${NC}"
echo "==============================================="
echo ""
echo "Próximos pasos:"
echo "1. Abre VS Code: code ."
echo "2. O ejecuta: $SCRIPT_PATH"
echo "3. Instala extensions recomendadas (Marketplace)"
echo "4. Abre proyecto: File → Open Folder"
echo "5. Inicia Live Server: Clic derecho en index.html"
echo ""
echo -e "${GREEN}🚀 ¡Listo para desarrollar MAYORDOMO!${NC}"
echo ""
