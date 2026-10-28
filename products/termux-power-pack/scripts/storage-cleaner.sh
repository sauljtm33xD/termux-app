#!/data/data/com.termux/files/usr/bin/bash
#
# storage-cleaner.sh — Encuentra y libera espacio en Termux de forma segura
#
# Por defecto solo MUESTRA qué se borraría (modo seguro). Nada se elimina
# hasta que pases --apply explícitamente.
#
# Qué limpia:
#   - $PREFIX/var/cache/apt (caché de paquetes ya instalados)
#   - ~/.cache (cachés de pip, npm, etc.)
#   - Archivos *.log mayores de 5MB bajo $HOME
#   - Archivos *.tmp y *.apk sueltos en ~/downloads si existe
#
# Uso:
#   storage-cleaner.sh            # modo seguro: solo lista
#   storage-cleaner.sh --apply    # borra de verdad lo listado

set -uo pipefail

APPLY=false
[ "${1:-}" = "--apply" ] && APPLY=true

human() { du -sh "$1" 2>/dev/null | cut -f1; }

list_or_delete() {
  local target="$1"
  local desc="$2"
  if [ -e "$target" ]; then
    local size
    size="$(human "$target")"
    echo "  - $desc: $target ($size)"
    if $APPLY; then
      rm -rf "$target"
    fi
  fi
}

echo "== storage-cleaner: $( $APPLY && echo "APLICANDO limpieza" || echo "modo seguro (solo lista)" ) =="
echo ""

echo "[1/3] Cachés conocidas"
list_or_delete "$PREFIX/var/cache/apt/archives" "caché de apt"
list_or_delete "$HOME/.cache" "caché de usuario (pip/npm/etc.)"
echo ""

echo "[2/3] Logs grandes (>5MB) bajo \$HOME"
find "$HOME" -xdev -type f -name "*.log" -size +5M 2>/dev/null | while read -r f; do
  size="$(human "$f")"
  echo "  - log: $f ($size)"
  if $APPLY; then
    rm -f "$f"
  fi
done
echo ""

echo "[3/3] Temporales y APK sueltos en ~/downloads"
if [ -d "$HOME/downloads" ]; then
  find "$HOME/downloads" -maxdepth 1 -type f \( -name "*.tmp" -o -name "*.apk" \) 2>/dev/null | while read -r f; do
    size="$(human "$f")"
    echo "  - archivo: $f ($size)"
    if $APPLY; then
      rm -f "$f"
    fi
  done
fi

echo ""
if $APPLY; then
  echo "✅ Limpieza aplicada."
else
  echo "ℹ️  Nada se ha borrado todavía. Repite con --apply para liberar este espacio."
fi
