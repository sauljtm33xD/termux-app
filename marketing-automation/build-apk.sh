#!/bin/bash

set -e

echo "📱 Marketing Automation - Compilar APK para Android"
echo "=================================================="

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no instalado${NC}"
    echo "Descarga desde: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo ""

# Ir a carpeta mobile
cd mobile

# Verificar si eas-cli está instalado
if ! command -v eas &> /dev/null; then
    echo -e "${BLUE}Instalando EAS CLI...${NC}"
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI instalado${NC}"
fi

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Instalando dependencias...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Eligiendo método de compilación...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1) Compilación Local (Recomendado - ~15 min)"
echo "   Requisitos: Android SDK, Java JDK"
echo ""
echo "2) Compilación en servidor EAS (~30 min)"
echo "   ✅ Sin requisitos locales"
echo ""
read -p "Selecciona opción (1 o 2): " OPTION

if [ "$OPTION" = "1" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Verificando Android SDK...${NC}"

    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}❌ ANDROID_HOME no configurado${NC}"
        echo ""
        echo "Para usar compilación local:"
        echo "1. Descarga Android Studio desde:"
        echo "   https://developer.android.com/studio"
        echo ""
        echo "2. Configura ANDROID_HOME:"
        echo "   export ANDROID_HOME=~/Android/Sdk"
        echo ""
        echo "3. Luego ejecuta: eas build --platform android --local"
        exit 1
    fi

    echo -e "${BLUE}Compilando APK localmente...${NC}"
    eas build --platform android --local

    echo ""
    echo -e "${GREEN}✅ APK COMPILADO CON ÉXITO${NC}"
    echo ""
    echo "El APK se descargará automáticamente"
    echo "Archivo: marketing-automation-v1.0.0.apk"

elif [ "$OPTION" = "2" ]; then
    echo ""
    echo -e "${BLUE}Verificando login en EAS...${NC}"

    # Verificar si está autenticado
    if ! eas whoami &> /dev/null; then
        echo -e "${YELLOW}Inicia sesión en EAS:${NC}"
        eas login
    fi

    echo -e "${BLUE}Compilando en servidor EAS...${NC}"
    echo -e "${YELLOW}Esto puede tomar 20-30 minutos...${NC}"
    eas build --platform android

    echo ""
    echo -e "${GREEN}✅ BUILD ENVIADO A EAS${NC}"
    echo ""
    echo "Monitorea el progreso en:"
    echo "  eas build:list"
    echo ""
    echo "Descarga cuando esté listo:"
    echo "  eas build:download <build-id>"

else
    echo -e "${RED}Opción inválida${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ COMPILACIÓN COMPLETA${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📱 INSTALAR EN TELÉFONO:${NC}"
echo ""
echo "1️⃣  Por USB:"
echo "   adb install marketing-automation-v1.0.0.apk"
echo ""
echo "2️⃣  Directamente:"
echo "   Descarga el APK y toca para instalar en tu teléfono"
echo ""
echo -e "${YELLOW}📤 PUBLICAR EN GOOGLE PLAY:${NC}"
echo "   Ver: docs/COMPILAR_APK.md"
echo ""
