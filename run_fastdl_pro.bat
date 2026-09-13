@echo off
REM FastDL PRO - Ejecutor para Windows
REM Inicia la aplicación sin necesidad de reinstalar dependencias

cd /d "%~dp0"

echo.
echo ======================================================
echo FastDL PRO - Gestor de Descargas Ultra Rápido
echo ======================================================
echo.

python src/main.py

if errorlevel 1 (
    echo.
    echo ❌ Error al iniciar FastDL PRO
    echo    Ejecuta primero: install_fastdl_pro.bat
    pause
    exit /b 1
)

exit /b 0
