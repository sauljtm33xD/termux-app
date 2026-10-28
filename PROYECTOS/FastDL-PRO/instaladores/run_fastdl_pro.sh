#!/bin/bash
# FastDL PRO - Ejecutor para Linux y macOS
# Inicia la aplicación sin necesidad de reinstalar dependencias

echo ""
echo "======================================================"
echo "FastDL PRO - Gestor de Descargas Ultra Rápido"
echo "======================================================"
echo ""

# Obtener ruta del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Ejecutar la aplicación
python3 src/main.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error al iniciar FastDL PRO"
    echo "   Ejecuta primero: ./install_fastdl_pro.sh"
    exit 1
fi

exit 0
