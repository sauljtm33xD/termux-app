@echo off
REM FastDL PRO - Instalador Automático para Windows
REM Autor: Claude Code
REM Descripción: Instala FastDL PRO con todas sus dependencias

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ======================================================
echo FastDL PRO - Instalador Automático para Windows
echo ======================================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python no está instalado
    echo    Descarga Python desde: https://www.python.org/downloads/
    echo    Asegúrate de marcar "Add Python to PATH"
    pause
    exit /b 1
)

echo ✅ Python encontrado
python --version

REM Verificar si pip está disponible
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: pip no está disponible
    pause
    exit /b 1
)

echo ✅ pip disponible

REM Crear carpeta de descargas si no existe
if not exist "Downloads" mkdir Downloads
echo ✅ Carpeta de descargas lista

REM Instalar dependencias
echo.
echo Instalando dependencias de Python...
echo.

pip install --upgrade pip
pip install PyQt6==6.6.1
pip install aiohttp==3.9.1
pip install aiofiles==23.2.1
pip install beautifulsoup4==4.12.2
pip install requests==2.31.0
pip install pydantic==2.5.0

if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo ======================================================
echo ✅ Instalación completada correctamente
echo ======================================================
echo.
echo Iniciando FastDL PRO...
echo.

REM Ejecutar la aplicación
python src/main.py

pause
