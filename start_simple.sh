#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   🎯 APK Builder - Interfaz Simplificada  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no encontrado"
    exit 1
fi

echo "✓ Python3 detectado"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
pip3 install -q flask flask-cors 2>/dev/null || pip3 install flask flask-cors

echo "✓ Dependencias instaladas"

# Puerto
PORT=${1:-5000}

echo ""
echo "════════════════════════════════════════════"
echo ""
echo "✅ Servidor en http://localhost:$PORT"
echo ""
echo "Pasos simples:"
echo "  1️⃣  Subir proyecto (ZIP)"
echo "  2️⃣  Compilar"
echo "  3️⃣  Descargar APK"
echo ""
echo "❌ Para detener: Ctrl+C"
echo ""
echo "════════════════════════════════════════════"
echo ""

python3 web_ui_simple.py
