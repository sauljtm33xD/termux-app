#!/usr/bin/env python3
"""APK Builder - CLI Local"""

import subprocess
import os
import shutil
from pathlib import Path
import sys

class APKBuilder:
    def __init__(self):
        self.project_dir = None
        self.apk_path = None

    def run(self):
        print("=" * 50)
        print("📱 APK Builder")
        print("=" * 50)
        print()

        # Pedir ruta del proyecto
        self.project_dir = input("📁 Ruta del proyecto: ").strip()

        if not self.project_dir:
            self.project_dir = "."

        if not Path(self.project_dir).exists():
            print("❌ Carpeta no existe")
            return

        print()
        print("Compilando...")
        print()

        try:
            # Compilar
            result = subprocess.run(
                ["bash", "-c", f"cd {self.project_dir} && ./gradlew assembleDebug"],
                capture_output=False
            )

            if result.returncode != 0:
                print("❌ Error en compilación")
                return

            # Buscar APK
            print()
            print("Buscando APK...")
            apk_files = list(Path(self.project_dir).glob("**/app-debug.apk"))

            if not apk_files:
                print("❌ APK no encontrado")
                return

            self.apk_path = apk_files[0]
            print(f"✓ APK encontrado: {self.apk_path}")
            print()

            # Copiar a directorio actual
            dest = Path("app.apk")
            shutil.copy(str(self.apk_path), str(dest))
            print(f"✓ Guardado como: {dest}")
            print()
            print("✅ Listo")

        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    builder = APKBuilder()
    builder.run()
