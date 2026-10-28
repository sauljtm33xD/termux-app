@echo off
REM FastDL PRO - Ejecutor Automático Inteligente para Windows
REM Verifica requisitos antes de ejecutar

setlocal enabledelayedexpansion
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║      FastDL PRO - Ejecutor Automático                 ║
echo ║    High-Speed File Downloader for PC                  ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"
set FASTDL_DIR=%cd%
set ERROR_COUNT=0

REM ════════════════════════════════════════════════════════
REM Función para verificar Python
REM ════════════════════════════════════════════════════════

echo 📋 VERIFICANDO REQUISITOS...
echo.

python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo ✗ Python 3 no encontrado
        set /a ERROR_COUNT+=1
        set PYTHON=N/A
    ) else (
        set PYTHON=python3
    )
) else (
    set PYTHON=python
)

if not "%PYTHON%"=="N/A" (
    echo ✓ Python encontrado
    for /f "tokens=2" %%i in ('%PYTHON% --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo   Versión: %PYTHON_VERSION%
)

echo.

REM ════════════════════════════════════════════════════════
REM Verificar archivos clave
REM ════════════════════════════════════════════════════════

echo 📁 VERIFICANDO ARCHIVOS...
echo.

if exist "src\main.py" (
    echo ✓ src\main.py encontrado
) else (
    echo ✗ src\main.py NO encontrado
    set /a ERROR_COUNT+=1
)

if exist "requirements.txt" (
    echo ✓ requirements.txt encontrado
) else (
    echo ✗ requirements.txt NO encontrado
    set /a ERROR_COUNT+=1
)

if exist "src\config.py" (
    echo ✓ src\config.py encontrado
) else (
    echo ✗ src\config.py NO encontrado
    set /a ERROR_COUNT+=1
)

if exist "src\ui\main_window.py" (
    echo ✓ src\ui\main_window.py encontrado
) else (
    echo ✗ src\ui\main_window.py NO encontrado
    set /a ERROR_COUNT+=1
)

echo.

REM ════════════════════════════════════════════════════════
REM Verificar dependencias Python
REM ════════════════════════════════════════════════════════

echo 📦 VERIFICANDO DEPENDENCIAS PYTHON...
echo.

if not "%PYTHON%"=="N/A" (
    %PYTHON% -c "import PyQt6" >nul 2>&1 && (echo ✓ PyQt6 (GUI^)) || (echo ⚠ PyQt6 no está instalado)
    %PYTHON% -c "import aiohttp" >nul 2>&1 && (echo ✓ aiohttp (Descargas^)) || (echo ⚠ aiohttp no está instalado)
    %PYTHON% -c "import aiofiles" >nul 2>&1 && (echo ✓ aiofiles (I/O^)) || (echo ⚠ aiofiles no está instalado)
    %PYTHON% -c "import pydantic" >nul 2>&1 && (echo ✓ pydantic) || (echo ⚠ pydantic no está instalado)
)

echo.

REM ════════════════════════════════════════════════════════
REM Verificar conexión
REM ════════════════════════════════════════════════════════

echo 🌐 VERIFICANDO CONEXIÓN...
ping -n 1 8.8.8.8 >nul 2>&1
if errorlevel 1 (
    echo ⚠ Sin conexión a internet
) else (
    echo ✓ Conexión OK
)

echo.

REM ════════════════════════════════════════════════════════
REM Resumen
REM ════════════════════════════════════════════════════════

echo ═══════════════════════════════════════════════════════
echo INFORMACIÓN DEL SISTEMA
echo ═══════════════════════════════════════════════════════
if "%PYTHON%"=="N/A" (
    echo Python: NO ENCONTRADO
) else (
    echo Python: %PYTHON_VERSION%
)
echo Carpeta: %FASTDL_DIR%
echo Descargas: %USERPROFILE%\Downloads\FastDL
echo.

REM ════════════════════════════════════════════════════════
REM Mostrar errores si hay
REM ════════════════════════════════════════════════════════

if %ERROR_COUNT% gtr 0 (
    color 0C
    echo.
    echo ✗ Se encontraron %ERROR_COUNT% problemas
    echo.
    echo Por favor ejecuta primero:
    echo   auto_install.bat
    echo.
    pause
    exit /b 1
)

color 0A

REM ════════════════════════════════════════════════════════
REM Menú de opciones
REM ════════════════════════════════════════════════════════

cls
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║           FastDL PRO - Ejecutor Automático            ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo ¿QUÉ DESEAS HACER?
echo.
echo [1] ► Ejecutar FastDL PRO
echo [2] ► Verificar instalación
echo [3] ► Reinstalar dependencias
echo [4] ► Abrir carpeta de descargas
echo [5] ► Abrir documentación
echo [6] ► Salir
echo.

set /p OPTION="Selecciona una opción (1-6): "

if "%OPTION%"=="1" (
    cls
    echo.
    echo 🚀 Iniciando FastDL PRO...
    echo.
    cd /d "%FASTDL_DIR%"
    %PYTHON% src/main.py
) else if "%OPTION%"=="2" (
    cls
    echo.
    echo ✓ Verificación completada exitosamente
    echo   La instalación está lista para ejecutar
    echo.
    pause
) else if "%OPTION%"=="3" (
    cls
    echo.
    echo 🔄 Reinstalando dependencias...
    echo   (esto puede tomar 2-3 minutos)
    echo.
    %PYTHON% -m pip install --upgrade pip
    %PYTHON% -m pip install -r requirements.txt
    echo.
    echo ✓ Dependencias reinstaladas
    echo.
    pause
) else if "%OPTION%"=="4" (
    start "" "%USERPROFILE%\Downloads\FastDL"
) else if "%OPTION%"=="5" (
    if exist "FASTDL_README.md" (
        start "" "FASTDL_README.md"
    ) else (
        echo No se encontró la documentación
        pause
    )
) else if "%OPTION%"=="6" (
    cls
    echo.
    echo Hasta luego!
    echo.
    exit /b 0
) else (
    cls
    color 0C
    echo.
    echo ✗ Opción inválida
    echo.
    pause
    exit /b 1
)
