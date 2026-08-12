; Marketing Automation - Windows Installer
; NSIS Script para crear instalador profesional

!include "MUI2.nsh"
!include "x64.nsh"

; Configuración general
Name "Marketing Automation"
OutFile "Marketing-Automation-Setup-v1.0.0.exe"
InstallDir "$PROGRAMFILES\MarketingAutomation"
InstallDirRegKey HKLM "Software\MarketingAutomation" "Install_Dir"

; MUI Settings
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "English"

; Versión del instalador
VIProductVersion "1.0.0.0"
VIAddVersionKey /LANG=${LANG_SPANISH} "ProductName" "Marketing Automation"
VIAddVersionKey /LANG=${LANG_SPANISH} "CompanyName" "Marketing Automation"
VIAddVersionKey /LANG=${LANG_SPANISH} "FileVersion" "1.0.0"
VIAddVersionKey /LANG=${LANG_SPANISH} "FileDescription" "Sistema de Automatización de Marketing"
VIAddVersionKey /LANG=${LANG_SPANISH} "LegalCopyright" "2026"

; Secciones
Section "Marketing Automation"
  SetOutPath "$INSTDIR"

  ; Copiar archivos ejecutables
  File "Marketing-Automation-v1.0.0.exe"
  File "launch-pc.bat"

  ; Copiar directorio backend
  SetOutPath "$INSTDIR\backend"
  File /r "backend\*.*"

  ; Copiar directorio web
  SetOutPath "$INSTDIR\web"
  File /r "web\*.*"

  ; Crear accesos directos
  SetOutPath "$INSTDIR"

  ; Atajo en menú Inicio
  CreateDirectory "$SMPROGRAMS\Marketing Automation"
  CreateShortcut "$SMPROGRAMS\Marketing Automation\Marketing Automation.lnk" "$INSTDIR\Marketing-Automation-v1.0.0.exe"
  CreateShortcut "$SMPROGRAMS\Marketing Automation\Desinstalar.lnk" "$INSTDIR\uninstall.exe"

  ; Atajo en escritorio
  CreateShortcut "$DESKTOP\Marketing Automation.lnk" "$INSTDIR\Marketing-Automation-v1.0.0.exe"

  ; Escribir registro de desinstalación
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarketingAutomation" "DisplayName" "Marketing Automation"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarketingAutomation" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarketingAutomation" "DisplayVersion" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarketingAutomation" "Publisher" "Marketing Automation"

  ; Crear desinstalador
  WriteUninstaller "$INSTDIR\uninstall.exe"

SectionEnd

; Sección de desinstalación
Section "Uninstall"

  ; Eliminar archivos
  RMDir /r "$INSTDIR"

  ; Eliminar accesos directos
  RMDir /r "$SMPROGRAMS\Marketing Automation"
  Delete "$DESKTOP\Marketing Automation.lnk"

  ; Eliminar entrada del registro
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarketingAutomation"
  DeleteRegKey HKLM "Software\MarketingAutomation"

SectionEnd
