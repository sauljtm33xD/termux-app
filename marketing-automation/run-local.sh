#!/bin/bash

set -e

echo "🚀 Marketing Automation - Ejecutar Localmente"
echo "============================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar dependencias
echo -e "${BLUE}Verificando dependencias...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 no instalado${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python3: $(python3 --version)${NC}"
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo ""

# Instalar dependencias si no existen
if [ ! -d "backend/venv" ]; then
    echo -e "${BLUE}Instalando dependencias Backend...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt > /dev/null 2>&1
    deactivate
    cd ..
    echo -e "${GREEN}✅ Backend listo${NC}"
fi

if [ ! -d "web/node_modules" ]; then
    echo -e "${BLUE}Instalando dependencias Web...${NC}"
    cd web
    npm install > /dev/null 2>&1
    cd ..
    echo -e "${GREEN}✅ Web listo${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ INICIANDO APLICACIÓN${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠️  Mantén esta ventana abierta. Abre otras 2 terminales para:${NC}"
echo ""
echo -e "${BLUE}Terminal 2 - Backend:${NC}"
echo "  cd marketing-automation/backend"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo -e "${BLUE}Terminal 3 - Web:${NC}"
echo "  cd marketing-automation/web"
echo "  npm start"
echo ""
echo -e "${YELLOW}Acceso:${NC}"
echo "  Web: http://localhost:3000"
echo "  Backend: http://localhost:5001"
echo "  API Health: http://localhost:5001/api/health"
echo ""
echo -e "${YELLOW}Credenciales test:${NC}"
echo "  Email: test@email.com"
echo "  Password: 123456"
echo ""
echo "Presiona Ctrl+C para salir"
echo ""

# Mantener la terminal abierta
sleep infinity
