#!/data/data/com.termux/files/usr/bin/bash
#
# update-all.sh — Actualiza todo el entorno Termux en un solo paso
#
# Actualiza, en este orden, lo que esté instalado:
#   1. Repositorios e índices de pkg/apt
#   2. Paquetes de Termux (pkg upgrade)
#   3. Paquetes globales de pip
#   4. Paquetes globales de npm
#   5. Gemas de Ruby
#
# Uso:
#   update-all.sh          # actualiza todo
#   update-all.sh --dry-run  # solo muestra qué se actualizaría

set -uo pipefail

DRY_RUN=false
[ "${1:-}" = "--dry-run" ] && DRY_RUN=true

run() {
  if $DRY_RUN; then
    echo "  [dry-run] $*"
  else
    "$@"
  fi
}

echo "== update-all: actualizando el entorno Termux =="
echo ""

echo "[1/5] Refrescando índices de paquetes..."
run pkg update -y

echo ""
echo "[2/5] Actualizando paquetes de Termux..."
run pkg upgrade -y

echo ""
echo "[3/5] Actualizando paquetes de pip (si pip está instalado)..."
if command -v pip >/dev/null 2>&1; then
  OUTDATED_PIP="$(pip list --outdated --format=freeze 2>/dev/null | cut -d= -f1)"
  if [ -n "$OUTDATED_PIP" ]; then
    echo "$OUTDATED_PIP" | while read -r pkgname; do
      [ -n "$pkgname" ] && run pip install --upgrade "$pkgname"
    done
  else
    echo "  (todo al día)"
  fi
else
  echo "  (pip no instalado, se omite)"
fi

echo ""
echo "[4/5] Actualizando paquetes globales de npm (si npm está instalado)..."
if command -v npm >/dev/null 2>&1; then
  run npm update -g
else
  echo "  (npm no instalado, se omite)"
fi

echo ""
echo "[5/5] Actualizando gemas de Ruby (si gem está instalado)..."
if command -v gem >/dev/null 2>&1; then
  run gem update
else
  echo "  (gem no instalado, se omite)"
fi

echo ""
if $DRY_RUN; then
  echo "✅ Simulación terminada. Ejecuta sin --dry-run para aplicar los cambios."
else
  echo "✅ Entorno actualizado."
fi
