@echo off
REM Script de setup automático para MAYORDOMO en Windows
REM Este script instala todas las dependencias y configura VS Code

echo ===============================================
echo   MAYORDOMO Swiss Knife - Setup Automático
echo   Windows Edition
echo ===============================================
echo.

REM Verificar Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo Descárgalo en: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js instalado

REM Verificar Git
echo [2/6] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git no está instalado
    echo Descárgalo en: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✅ Git instalado

REM Instalar Claude Code
echo [3/6] Instalando Claude Code CLI...
npm install -g @anthropic-ai/claude-code >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Error instalando Claude Code
) else (
    echo ✅ Claude Code instalado
)

REM Crear .vscode/settings.json
echo [4/6] Configurando VS Code...
if not exist ".vscode" mkdir .vscode
copy ".vscode-settings.json" ".vscode\settings.json" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Error copiando settings
) else (
    echo ✅ VS Code configurado
)

REM Instalar extensions VS Code
echo [5/6] Instalando extensions VS Code...
code --install-extension esbenp.prettier-vscode >nul 2>&1
code --install-extension dbaeumer.vscode-eslint >nul 2>&1
code --install-extension ritwickdey.LiveServer >nul 2>&1
code --install-extension eamodio.gitlens >nul 2>&1
code --install-extension rangav.vscode-thunder-client >nul 2>&1
code --install-extension coenraads.bracket-pair-colorizer >nul 2>&1
echo ✅ Extensions instaladas

REM Crear archivo startup en Escritorio
echo [6/6] Creando acceso directo en Escritorio...
set DESKTOP=%USERPROFILE%\Desktop
echo @echo off >> "%DESKTOP%\iniciar-mayordomo.bat"
echo cd /d "%CD%" >> "%DESKTOP%\iniciar-mayordomo.bat"
echo cls >> "%DESKTOP%\iniciar-mayordomo.bat"
echo echo ============================== >> "%DESKTOP%\iniciar-mayordomo.bat"
echo echo MAYORDOMO Swiss Knife >> "%DESKTOP%\iniciar-mayordomo.bat"
echo echo ============================== >> "%DESKTOP%\iniciar-mayordomo.bat"
echo echo. >> "%DESKTOP%\iniciar-mayordomo.bat"
echo echo Iniciando VS Code con Claude Code... >> "%DESKTOP%\iniciar-mayordomo.bat"
echo echo. >> "%DESKTOP%\iniciar-mayordomo.bat"
echo code . >> "%DESKTOP%\iniciar-mayordomo.bat"
echo pause >> "%DESKTOP%\iniciar-mayordomo.bat"
echo ✅ Acceso directo creado en Escritorio

echo.
echo ===============================================
echo   ✅ SETUP COMPLETADO EXITOSAMENTE
echo ===============================================
echo.
echo Próximos pasos:
echo 1. Abre VS Code (o el atajo en Escritorio)
echo 2. Instala extensions recomendadas (Marketplace)
echo 3. Abre proyecto: File → Open Folder
echo 4. Inicia Live Server: Click derecho en index.html
echo.
echo 🚀 ¡Listo para desarrollar MAYORDOMO!
echo.
pause
