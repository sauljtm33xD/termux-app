#!/data/data/com.termux/files/usr/bin/bash
# Libera espacio: cache de paquetes, pip y npm.
pkg clean
pkg autoclean 2>/dev/null || true
command -v pip >/dev/null && pip cache purge 2>/dev/null || true
command -v npm >/dev/null && npm cache clean --force 2>/dev/null || true
echo "Espacio libre ahora:"; df -h "$HOME" | tail -1
