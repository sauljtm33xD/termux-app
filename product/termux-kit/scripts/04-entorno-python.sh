#!/data/data/com.termux/files/usr/bin/bash
# Crea un proyecto Python con entorno virtual listo para usar.
# Uso: ./04-entorno-python.sh nombre-proyecto
set -e
[ -z "$1" ] && { echo "Uso: $0 nombre-proyecto"; exit 1; }
pkg install -y python
mkdir -p "$1" && cd "$1"
python -m venv .venv
printf '.venv/\n__pycache__/\n' > .gitignore
echo 'print("Hola desde Termux")' > main.py
echo "Proyecto listo. Activa con: cd $1 && source .venv/bin/activate"
