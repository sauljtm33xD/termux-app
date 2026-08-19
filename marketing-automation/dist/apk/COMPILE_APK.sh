#!/bin/bash

# 📱 Marketing Automation - Compilar APK
# Este script compila el APK para Android

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📱 Marketing Automation - APK Builder${NC}"
echo "======================================"
echo ""

# Directorio base
BASE_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MOBILE_DIR="$BASE_DIR/mobile"
OUTPUT_DIR="$(dirname "$0")/output"

mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}Directorio del proyecto: $BASE_DIR${NC}"
echo -e "${BLUE}Directorio móvil: $MOBILE_DIR${NC}"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no instalado${NC}"
    echo "Descarga desde: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Instalar dependencias
cd "$MOBILE_DIR"
echo -e "${BLUE}Instalando dependencias...${NC}"
npm install --legacy-peer-deps

# Instalar EAS CLI globalmente
echo -e "${BLUE}Instalando EAS CLI...${NC}"
npm install -g eas-cli

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Método de compilación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1️⃣  EAS Build (Recomendado - En servidor Expo)"
echo "    ✅ No requiere Android SDK"
echo "    ⏱️  Tiempo: 30-45 minutos"
echo "    📋 Requisitos: Cuenta Expo gratuita"
echo ""
echo "2️⃣  Build Local (Rápido pero requiere Android SDK)"
echo "    ⚠️  Requiere Android SDK instalado"
echo "    ⏱️  Tiempo: 15-30 minutos"
echo "    📋 Requisitos: Java, Android SDK, NDK"
echo ""

read -p "Selecciona opción (1 o 2): " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}Iniciando compilación con EAS Build...${NC}"
        echo ""
        echo "Para continuar necesitas:"
        echo "1. Una cuenta Expo (gratuita en https://expo.dev)"
        echo "2. Ejecutar: npx eas-cli login"
        echo ""
        read -p "¿Continuar? (s/n): " confirm

        if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
            npx eas-cli login
            echo -e "${BLUE}Compilando APK...${NC}"
            npx eas-cli build --platform android --non-interactive --output="$OUTPUT_DIR/app.apk"
        fi
        ;;
    2)
        echo ""
        echo -e "${BLUE}Compilación Local${NC}"
        echo ""

        # Verificar Android SDK
        if [ -z "$ANDROID_SDK_ROOT" ] && [ -z "$ANDROID_HOME" ]; then
            echo -e "${RED}❌ Android SDK no encontrado${NC}"
            echo ""
            echo "Para instalar:"
            echo "1. Descarga Android Studio: https://developer.android.com/studio"
            echo "2. Instala SDK Build Tools 33 o superior"
            echo "3. Establece ANDROID_HOME en tu PATH"
            echo ""
            exit 1
        fi

        echo -e "${GREEN}✅ Android SDK encontrado${NC}"
        echo ""
        echo -e "${BLUE}Compilando...${NC}"
        npx eas-cli build --platform android --local --non-interactive --output="$OUTPUT_DIR/app.apk"
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$OUTPUT_DIR/app.apk" ]; then
    APK_SIZE=$(du -h "$OUTPUT_DIR/app.apk" | cut -f1)
    echo -e "${GREEN}✅ APK COMPILADO EXITOSAMENTE${NC}"
    echo ""
    echo "📦 Archivo: $OUTPUT_DIR/app.apk"
    echo "📊 Tamaño: $APK_SIZE"
    echo ""
    echo "🚀 Para instalar en teléfono:"
    echo "   adb install $OUTPUT_DIR/app.apk"
    echo ""
    echo "📤 Para compartir:"
    echo "   cp $OUTPUT_DIR/app.apk ~/Downloads/"
else
    echo -e "${YELLOW}⚠️  APK aún en proceso de compilación${NC}"
    echo "Revisa los logs arriba para más información"
fi

echo ""
