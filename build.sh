#!/bin/bash

echo "=========================================="
echo "📱 APK Builder"
echo "=========================================="
echo ""

read -p "📁 Ruta del proyecto: " PROJECT_DIR

if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="."
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Carpeta no existe"
    exit 1
fi

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

APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)

if [ -z "$APK_PATH" ]; then
    echo "❌ APK no encontrado"
    exit 1
fi

echo "✓ APK encontrado: $APK_PATH"
echo ""

cp "$APK_PATH" "app.apk"

echo "✓ Guardado como: app.apk"
echo ""
echo "✅ Listo"
