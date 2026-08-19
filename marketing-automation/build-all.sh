#!/bin/bash

set -e

echo "🚀 Marketing Automation - Build Completo"
echo "========================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Paso 1: Backend
echo -e "${BLUE}[1/3] Preparando Backend...${NC}"
cd backend
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✅ Backend listo${NC}"
cd ..

# Paso 2: Web
echo -e "${BLUE}[2/3] Compilando Web para PC...${NC}"
cd web
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Web compilada en web/build/${NC}"
cd ..

# Paso 3: Mobile
echo -e "${BLUE}[3/3] Preparando Mobile para APK...${NC}"
cd mobile
npm install > /dev/null 2>&1
echo -e "${GREEN}✅ Mobile listo para compilar${NC}"
cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BUILD COMPLETO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📱 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1️⃣  EJECUTAR BACKEND:"
echo "   cd backend && python app.py"
echo ""
echo "2️⃣  EJECUTAR WEB (Opción A - Desarrollo):"
echo "   cd web && npm start"
echo ""
echo "3️⃣  EJECUTAR WEB (Opción B - Producción):"
echo "   npm install -g serve"
echo "   serve -s web/build -l 3000"
echo ""
echo "4️⃣  COMPILAR APK:"
echo "   cd mobile && npm install -g eas-cli"
echo "   eas build --platform android --local"
echo ""
