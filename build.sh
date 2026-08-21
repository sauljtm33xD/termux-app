#!/bin/bash

# APK Builder - Automático

PROJECT_DIR="${1:-.}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Carpeta no existe: $PROJECT_DIR"
    exit 1
fi

echo ""
echo "========================================"
echo "📱 APK Builder"
echo "========================================"
echo "Proyecto: $PROJECT_DIR"
echo ""
read -p "¿Compilar? (Enter para sí): " CONFIRM

echo ""
echo "Compilando..."
echo ""

cd "$PROJECT_DIR"
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Error en compilación"
    exit 1
fi

echo ""
echo "Buscando APK..."

APK=$(find . -name "app-debug.apk" -type f | head -1)

if [ -z "$APK" ]; then
    echo "❌ APK no encontrado"
    exit 1
fi

cp "$APK" "../app.apk"
echo "✅ APK guardado en: ../app.apk"
