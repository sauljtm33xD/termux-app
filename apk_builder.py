#!/usr/bin/env python3
"""APK Builder - Automático"""

import subprocess
import os
import shutil
from pathlib import Path
import sys

PROJECT_DIR = sys.argv[1] if len(sys.argv) > 1 else "."

if not Path(PROJECT_DIR).exists():
    print(f"❌ Carpeta no existe: {PROJECT_DIR}")
    exit(1)

print()
print("=" * 40)
print("📱 APK Builder")
print("=" * 40)
print(f"Proyecto: {PROJECT_DIR}")
print()
input("¿Compilar? (Enter para sí): ")

print()
print("Compilando...")
print()

result = subprocess.run(
    ["bash", "-c", f"cd {PROJECT_DIR} && ./gradlew assembleDebug"],
    cwd=PROJECT_DIR
)

if result.returncode != 0:
    print("❌ Error en compilación")
    exit(1)

print()
print("Buscando APK...")

apk_files = list(Path(PROJECT_DIR).glob("**/app-debug.apk"))

if not apk_files:
    print("❌ APK no encontrado")
    exit(1)

apk_path = apk_files[0]
dest = Path("app.apk")
shutil.copy(str(apk_path), str(dest))

print(f"✅ APK guardado en: {dest.resolve()}")
