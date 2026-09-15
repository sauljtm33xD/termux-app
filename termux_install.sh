#!/bin/bash

echo "╔═══════════════════════════════════════════╗"
echo "║  FastDL CLI - Instalador para Termux      ║"
echo "╚═══════════════════════════════════════════╝"
echo

echo "📦 Actualizando paquetes..."
pkg update -y

echo "🐍 Instalando Python..."
pkg install -y python

echo "📚 Instalando dependencias Python..."
pip install aiohttp aiofiles pydantic python-dotenv

echo
echo "✅ ¡Instalación completada!"
echo
echo "🚀 Para usar FastDL CLI:"
echo "   cd termux-app"
echo "   python -m src.cli <URL>"
echo
echo "Ejemplo:"
echo "   python -m src.cli https://ejemplo.com/archivo.zip"
echo
