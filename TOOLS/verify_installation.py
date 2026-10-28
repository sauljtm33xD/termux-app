#!/usr/bin/env python3
"""
FastDL PRO - Script de Verificación de Instalación
Verifica que todos los archivos y dependencias estén correctamente configurados
"""

import os
import sys
import subprocess
from pathlib import Path

def check_color(passed):
    """Retorna el símbolo de estado"""
    return "✅" if passed else "❌"

def main():
    print("\n" + "="*60)
    print("FastDL PRO - Verificación de Instalación")
    print("="*60 + "\n")

    errors = []

    # 1. Verificar Python
    print("1. Verificando Python...")
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}"
    python_ok = sys.version_info >= (3, 8)
    print(f"   {check_color(python_ok)} Python {python_version}")
    if not python_ok:
        errors.append("Python 3.8+ requerido")

    # 2. Verificar archivos de instalación
    print("\n2. Verificando archivos de instaladores...")
    files_required = {
        "install_fastdl_pro.bat": "Instalador Windows",
        "install_fastdl_pro.sh": "Instalador Linux/macOS",
        "run_fastdl_pro.bat": "Ejecutor Windows",
        "run_fastdl_pro.sh": "Ejecutor Linux/macOS",
        "INSTALACION.md": "Guía de instalación",
    }

    for filename, description in files_required.items():
        exists = Path(filename).exists()
        print(f"   {check_color(exists)} {filename} ({description})")
        if not exists:
            errors.append(f"Archivo faltante: {filename}")

    # 3. Verificar estructura de carpetas
    print("\n3. Verificando estructura de carpetas...")
    folders_required = {
        "src": "Código fuente",
        "src/ui": "Interfaz gráfica",
    }

    for folder, description in folders_required.items():
        exists = Path(folder).exists()
        print(f"   {check_color(exists)} {folder}/ ({description})")
        if not exists:
            errors.append(f"Carpeta faltante: {folder}")

    # 4. Verificar archivos Python principales
    print("\n4. Verificando módulos Python...")
    modules_required = {
        "src/main.py": "Punto de entrada",
        "src/download_engine.py": "Motor de descargas",
        "src/config.py": "Configuración",
        "src/batch_downloader.py": "Descargador por lotes",
        "src/torrent_downloader.py": "Descargador de torrents",
        "src/web_search.py": "Búsqueda web",
        "src/ui/main_window.py": "Ventana principal",
    }

    for module, description in modules_required.items():
        exists = Path(module).exists()
        print(f"   {check_color(exists)} {module} ({description})")
        if not exists:
            errors.append(f"Módulo faltante: {module}")

    # 5. Verificar optimizaciones en download_engine.py
    print("\n5. Verificando optimizaciones del motor...")
    engine_file = Path("src/download_engine.py")
    if engine_file.exists():
        with open(engine_file, 'r') as f:
            content = f.read()

        optimizations = {
            "_segmented_download": "Descargas segmentadas",
            "_download_segment": "Descarga por segmentos",
            "accept-ranges": "Soporte de rango HTTP",
            "TCPConnector": "Pool de conexiones TCP",
            "use_dns_cache": "Cache DNS",
            "keepalive_timeout": "Keep-alive",
        }

        for opt, description in optimizations.items():
            has_opt = opt in content
            print(f"   {check_color(has_opt)} {description}")
            if not has_opt:
                errors.append(f"Optimización faltante: {description}")

    # 6. Verificar configuración
    print("\n6. Verificando configuración...")
    config_file = Path("src/config.py")
    if config_file.exists():
        with open(config_file, 'r') as f:
            content = f.read()

        configs = {
            "max_parallel_connections: int = 16": "16 conexiones paralelas",
            "chunk_size: int = 1024 * 1024 * 4": "Chunk size 4MB",
            "timeout: int = 60": "Timeout 60 segundos",
            "segment_size: int = 1024 * 1024 * 10": "Segmentos 10MB",
            "enable_segmented: bool = True": "Descarga segmentada habilitada",
        }

        for config, description in configs.items():
            has_config = config in content
            print(f"   {check_color(has_config)} {description}")
            if not has_config:
                errors.append(f"Configuración faltante: {description}")

    # 7. Intentar importar módulos Python
    print("\n7. Verificando dependencias de Python...")
    dependencies = {
        "PyQt6": "Interfaz gráfica",
        "aiohttp": "Cliente HTTP asincrónico",
        "aiofiles": "Archivos asincrónico",
        "requests": "HTTP requests",
        "pydantic": "Validación de datos",
        "bs4": "Web scraping",
    }

    for module, description in dependencies.items():
        try:
            __import__(module)
            print(f"   {check_color(True)} {module} ({description})")
        except ImportError:
            print(f"   {check_color(False)} {module} ({description})")
            errors.append(f"Dependencia no instalada: {module}")

    # 8. Verificar permisos de ejecución (Linux/macOS)
    if sys.platform != "win32":
        print("\n8. Verificando permisos de ejecución...")
        scripts = ["install_fastdl_pro.sh", "run_fastdl_pro.sh"]

        for script in scripts:
            script_path = Path(script)
            if script_path.exists():
                is_executable = os.access(script_path, os.X_OK)
                print(f"   {check_color(is_executable)} {script}")
                if not is_executable:
                    errors.append(f"Permisos incorrectos: {script}")

    # Resumen final
    print("\n" + "="*60)
    if errors:
        print(f"❌ Se encontraron {len(errors)} problema(s):\n")
        for i, error in enumerate(errors, 1):
            print(f"   {i}. {error}")
        print("\n" + "="*60)
        return 1
    else:
        print("✅ ¡Verificación completada exitosamente!")
        print("\n📝 Próximos pasos:")
        print("   1. Ejecuta el instalador correspondiente:")
        print("      - Windows: install_fastdl_pro.bat")
        print("      - Linux/macOS: ./install_fastdl_pro.sh")
        print("   2. Usa el ejecutor para iniciar FastDL PRO:")
        print("      - Windows: run_fastdl_pro.bat")
        print("      - Linux/macOS: ./run_fastdl_pro.sh")
        print("\n" + "="*60)
        return 0

if __name__ == "__main__":
    sys.exit(main())
