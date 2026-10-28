@echo off
REM FastDL PRO - Instalador Automático para Windows
REM Detecta Python, instala dependencias y crea accesos directos

setlocal enabledelayedexpansion
cls

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║      FastDL PRO - Instalador Automático para Windows   ║
echo ║         High-Speed File Downloader                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"
set FASTDL_DIR=%cd%

REM ════════════════════════════════════════════════════════
REM Paso 1: Verificar Python
REM ════════════════════════════════════════════════════════

echo [1/7] Verificando Python 3...
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        color 0C
        echo.
        echo ✗ ERROR: Python 3 no encontrado
        echo.
        echo Por favor instala Python 3.10+ desde:
        echo   https://www.python.org/downloads/
        echo.
        echo Durante la instalación, asegúrate de marcar:
        echo   ✓ "Add Python to PATH"
        echo.
        pause
        exit /b 1
    )
    set PYTHON=python3
) else (
    set PYTHON=python
)

for /f "tokens=2" %%i in ('%PYTHON% --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✓ Python %PYTHON_VERSION% encontrado

REM ════════════════════════════════════════════════════════
REM Paso 2: Crear directorios
REM ════════════════════════════════════════════════════════

echo.
echo [2/7] Creando directorios...
if not exist "%USERPROFILE%\.fastdl" mkdir "%USERPROFILE%\.fastdl"
if not exist "%USERPROFILE%\.fastdl\logs" mkdir "%USERPROFILE%\.fastdl\logs"
if not exist "%USERPROFILE%\Downloads\FastDL" mkdir "%USERPROFILE%\Downloads\FastDL"
echo ✓ Directorios creados

REM ════════════════════════════════════════════════════════
REM Paso 3: Actualizar pip
REM ════════════════════════════════════════════════════════

echo.
echo [3/7] Actualizando pip...
%PYTHON% -m pip install --upgrade pip setuptools wheel --quiet >nul 2>&1
if errorlevel 1 (
    echo ⚠ Advertencia: No se pudo actualizar pip
) else (
    echo ✓ pip actualizado
)

REM ════════════════════════════════════════════════════════
REM Paso 4: Instalar dependencias
REM ════════════════════════════════════════════════════════

echo.
echo [4/7] Instalando dependencias (esto puede tomar 2-3 minutos)...
if not exist "requirements.txt" (
    color 0C
    echo.
    echo ✗ ERROR: requirements.txt no encontrado
    echo.
    pause
    exit /b 1
)

%PYTHON% -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    color 0C
    echo.
    echo ✗ ERROR: Falló la instalación de dependencias
    echo.
    echo Por favor ejecuta manualmente:
    echo   python -m pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

REM ════════════════════════════════════════════════════════
REM Paso 5: Crear script ejecutor
REM ════════════════════════════════════════════════════════

echo.
echo [5/7] Creando script ejecutor...

setlocal enabledelayedexpansion
(
    echo @echo off
    echo cd /d "%FASTDL_DIR%"
    echo %PYTHON% src/main.py
    echo pause
) > "%FASTDL_DIR%\run_fastdl.bat"

echo ✓ Script ejecutor creado

REM ════════════════════════════════════════════════════════
REM Paso 6: Crear acceso directo en Escritorio
REM ════════════════════════════════════════════════════════

echo.
echo [6/7] Creando acceso directo en Escritorio...

if exist "%USERPROFILE%\Desktop\FastDL PRO.bat" del "%USERPROFILE%\Desktop\FastDL PRO.bat"
copy "%FASTDL_DIR%\run_fastdl.bat" "%USERPROFILE%\Desktop\FastDL PRO.bat" >nul

REM Crear shortcut usando VBS (método alternativo)
set "VBSCRIPT=%TEMP%\create_shortcut.vbs"
(
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo sLinkFile = "%USERPROFILE%\Desktop\FastDL PRO.lnk"
    echo Set oLink = oWS.CreateShortcut(sLinkFile^)
    echo oLink.TargetPath = "%FASTDL_DIR%\run_fastdl.bat"
    echo oLink.WorkingDirectory = "%FASTDL_DIR%"
    echo oLink.Description = "FastDL PRO - Descargador Ultrarrápido"
    echo oLink.Save
) > "%VBSCRIPT%"
cscript.exe //nologo "%VBSCRIPT%" >nul 2>&1
del "%VBSCRIPT%" >nul 2>&1

echo ✓ Acceso directo creado en Escritorio

REM ════════════════════════════════════════════════════════
REM Paso 7: Crear archivo de configuración
REM ════════════════════════════════════════════════════════

echo.
echo [7/7] Inicializando configuración...

setlocal enabledelayedexpansion
(
    echo {
    echo     "version": "1.0",
    echo     "download_folder": "%USERPROFILE%\Downloads\FastDL",
    echo     "parallel_connections": 8,
    echo     "resume_downloads": true,
    echo     "chunk_size": 262144
    echo }
) > "%USERPROFILE%\.fastdl\config.json"

echo ✓ Configuración inicializada

REM ════════════════════════════════════════════════════════
REM Resumen Final
REM ════════════════════════════════════════════════════════

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     ✓ INSTALACIÓN COMPLETADA EXITOSAMENTE             ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo 📦 INFORMACIÓN DE INSTALACIÓN:
echo    • Sistema: Windows
echo    • Python: %PYTHON_VERSION%
echo    • Directorio: %FASTDL_DIR%
echo    • Descargas: %USERPROFILE%\Downloads\FastDL
echo.

echo 🚀 FORMAS DE EJECUTAR FASTDL PRO:
echo    1. Busca 'FastDL PRO' en el Escritorio y haz doble clic
echo    2. Ejecuta: %FASTDL_DIR%\run_fastdl.bat
echo    3. En símbolo de sistema: python src/main.py
echo.

echo 📚 DOCUMENTACIÓN:
echo    • Guía Completa: FASTDL_README.md
echo    • Inicio Rápido: QUICKSTART.md
echo    • Para Desarrolladores: DEVELOPER_GUIDE.md
echo.

echo ⚙️  PRÓXIMOS PASOS:
echo    1. Abre FastDL PRO desde el Escritorio
echo    2. Configura tu carpeta de descargas
echo    3. ¡Comienza a descargar archivos!
echo.

echo ¿Deseas ejecutar FastDL PRO ahora? (S/N)
set /p launch=
if /i "%launch%"=="S" (
    echo.
    echo Iniciando FastDL PRO...
    echo.
    cd /d "%FASTDL_DIR%"
    %PYTHON% src/main.py
) else (
    echo.
    echo Instalación completada. ¡Disfruta FastDL PRO!
    echo.
    pause
)
