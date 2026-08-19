#!/bin/bash

set -e

echo "💻 Marketing Automation - Build para PC"
echo "======================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar dependencias
echo -e "${BLUE}Verificando requisitos...${NC}"

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

# Crear directorio de compilación
mkdir -p dist/pc
cd dist/pc

echo -e "${BLUE}Compilando versión PC...${NC}"
echo ""

# Backend
echo -e "${BLUE}[1/3] Preparando Backend...${NC}"
mkdir -p backend
cp -r ../../backend/app.py backend/
cp -r ../../backend/requirements.txt backend/

# Crear venv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
deactivate
cd ..

echo -e "${GREEN}✅ Backend compilado${NC}"

# Web
echo -e "${BLUE}[2/3] Compilando Web...${NC}"
mkdir -p web
cd web
cp -r ../../../web/package.json .
cp -r ../../../web/public .
cp -r ../../../web/src .

npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

rm -rf node_modules src public package.json package-lock.json

echo -e "${GREEN}✅ Web compilada${NC}"
cd ..

# Crear launcher
echo -e "${BLUE}[3/3] Creando launcher...${NC}"

cat > launch-pc.sh << 'LAUNCHER'
#!/bin/bash

# Detectar SO
OS_TYPE=$(uname -s)

echo "🚀 Marketing Automation - PC"
echo "============================"
echo ""

# Función para limpiar en Ctrl+C
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $WEB_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT

# Iniciar Backend
echo "▶️  Iniciando Backend..."
cd backend
if [ "$OS_TYPE" = "Darwin" ] || [ "$OS_TYPE" = "Linux" ]; then
    source venv/bin/activate
else
    venv\Scripts\activate
fi
python app.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"
sleep 2

# Iniciar Web
echo "▶️  Iniciando Web..."
cd ../web
if command -v serve &> /dev/null; then
    serve -s build -l 3000 > web.log 2>&1 &
else
    python3 -m http.server 3000 > web.log 2>&1 &
fi
WEB_PID=$!
echo "✅ Web iniciada (PID: $WEB_PID)"
sleep 2

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ MARKETING AUTOMATION INICIADO    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📱 Acceso:"
echo "   🌐 Web: http://localhost:3000"
echo "   🔧 API: http://localhost:5001"
echo "   ❤️  Health: http://localhost:5001/api/health"
echo ""
echo "🔑 Credenciales test:"
echo "   Email: test@email.com"
echo "   Password: 123456"
echo ""
echo "📋 Logs:"
echo "   Backend: backend/backend.log"
echo "   Web: web/web.log"
echo ""
echo "❌ Presiona Ctrl+C para detener"
echo ""

# Esperar
wait
LAUNCHER

chmod +x launch-pc.sh

cat > launch-pc.bat << 'LAUNCHER_WIN'
@echo off
echo 🚀 Marketing Automation - PC
echo ============================
echo.

setlocal enabledelayedexpansion

cd backend
call venv\Scripts\activate.bat
start "Backend" python app.py
echo ✅ Backend iniciado
timeout /t 2 /nobreak

cd ..\web
start "Web" serve -s build -l 3000
echo ✅ Web iniciada
timeout /t 2 /nobreak

cls
echo.
echo ╔════════════════════════════════════════╗
echo ║   ✅ MARKETING AUTOMATION INICIADO    ║
echo ╚════════════════════════════════════════╝
echo.
echo 📱 Acceso:
echo    🌐 Web: http://localhost:3000
echo    🔧 API: http://localhost:5001
echo.
echo 🔑 Credenciales test:
echo    Email: test@email.com
echo    Password: 123456
echo.
echo ❌ Cierra las ventanas para detener
echo.
pause
LAUNCHER_WIN

echo -e "${GREEN}✅ Launcher creado${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BUILD PARA PC COMPLETO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📁 Ubicación:${NC}"
echo "   dist/pc/"
echo ""
echo -e "${YELLOW}🚀 Para ejecutar:${NC}"
echo ""
echo "Linux/Mac:"
echo "   cd dist/pc && ./launch-pc.sh"
echo ""
echo "Windows:"
echo "   cd dist/pc && launch-pc.bat"
echo ""
echo -e "${YELLOW}📦 Empaquetar para distribuir:${NC}"
echo "   zip -r marketing-automation-pc.zip dist/pc/"
echo ""

cd ../../..
