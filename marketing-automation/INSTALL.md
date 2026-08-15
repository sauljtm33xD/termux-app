# 📦 Marketing Automation - Guía de Instalación

**Versión:** 1.0.0  
**Proyecto:** Marketing Automation System  
**Última actualización:** 2026-08-12

---

## 🚀 Instalación Rápida (2 minutos)

### Windows (PC)
```bash
# 1. Descarga
# Descarga: Marketing-Automation-v1.0.0.exe

# 2. Ejecuta
Double-click: Marketing-Automation-v1.0.0.exe

# 3. Accede
http://localhost:3000
```

### Android (Móvil)
```bash
# 1. Descarga
# Desde GitHub Releases o EAS Build

# 2. Instala
adb install marketing-automation-v1.0.0.apk

# 3. Abre la app
"Marketing Automation" en tu teléfono
```

---

## 📋 Requisitos del Sistema

### Windows
| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **OS** | Windows XP SP3 | Windows 7+ |
| **RAM** | 512 MB | 2 GB |
| **Disco** | 200 MB | 500 MB |
| **Procesador** | Pentium 4 | Core i5+ |
| **Puertos** | 3000, 5001 | Disponibles |

### Android
| Requisito | Especificación |
|-----------|----------------|
| **Android** | 5.0 o superior |
| **RAM** | 1 GB mínimo |
| **Disco** | 50 MB espacio libre |
| **API** | 21-33 |

---

## 🖥️ Instalación Detallada - Windows

### Opción 1: Ejecutable Portable (RECOMENDADO)

**Paso 1: Descargar**
- Descarga: `Marketing-Automation-v1.0.0.exe` (7.4 MB)
- Ubicación: `dist/pc/Marketing-Automation-v1.0.0.exe`

**Paso 2: Ejecutar**
```bash
# Doble clic en el archivo
Marketing-Automation-v1.0.0.exe

# O desde línea de comandos
cd dist/pc
.\Marketing-Automation-v1.0.0.exe
```

**Paso 3: Esperar**
- Espera 5-10 segundos mientras se inicia
- Se abre automáticamente el navegador

**Paso 4: Acceder**
```
URL: http://localhost:3000
Backend API: http://localhost:5001
```

**Paso 5: Login**
```
Email: test@email.com
Password: 123456
```

**Ventajas:**
- ✅ Sin instalación
- ✅ Portable (puedes moverlo a cualquier carpeta)
- ✅ Sin permisos de admin
- ✅ Base de datos incluida

---

### Opción 2: Instalador NSIS (Profesional)

**Paso 1: Crear instalador**
```bash
# Requiere NSIS instalado en Windows
# Descarga desde: https://nsis.sourceforge.io

# En la carpeta dist/pc/:
makensis setup.nsi

# Genera: Marketing-Automation-Setup-v1.0.0.exe
```

**Paso 2: Ejecutar instalador**
```bash
Double-click: Marketing-Automation-Setup-v1.0.0.exe
```

**Paso 3: Seguir asistente**
1. Selecciona idioma (Español/English)
2. Lee la licencia
3. Selecciona carpeta de instalación (por defecto: C:\Program Files\MarketingAutomation)
4. Haz clic "Install"
5. Espera a que termine

**Paso 4: Acceder**
- Se crean accesos directos automáticamente
- Menú Inicio: `Marketing Automation` > `Marketing Automation`
- Escritorio: `Marketing Automation` (icono)
- Panel de Control: Aparece en Programas instalados

**Ventajas:**
- ✅ Instalación profesional
- ✅ Accesos directos automáticos
- ✅ Entrada en Panel de Control
- ✅ Fácil desinstalación

---

### Opción 3: Desde Código Fuente (Desarrollo)

**Requisitos:**
- Python 3.11+
- Node.js 16+
- npm 8+

**Instalación:**
```bash
# 1. Clonar repositorio
git clone https://github.com/sauljtm33xD/termux-app.git
cd termux-app/marketing-automation

# 2. Instalar dependencias backend
cd backend
pip install -r requirements.txt

# 3. Instalar dependencias web
cd ../web
npm install

# 4. Compilar web (opcional, para producción)
npm run build

# 5. Ejecutar
# Terminal 1 (Backend)
cd backend
python app.py

# Terminal 2 (Web)
cd web
npm start  # Para desarrollo
# O: npm run build + usar http-server

# 6. Acceder
http://localhost:3000  # Frontend
http://localhost:5001  # API
```

---

## 📱 Instalación Detallada - Android

### Opción 1: Descargar APK Precompilado (MÁS FÁCIL)

**Paso 1: Descargar APK**
- Fuente 1: GitHub Releases
- Fuente 2: EAS Build (después de compilar)
- Archivo: `marketing-automation-v1.0.0.apk`

**Paso 2: Transferir al teléfono**
```bash
# Opción A: Usando ADB (recomendado)
adb devices  # Verificar conexión
adb install marketing-automation-v1.0.0.apk

# Opción B: Manualmente
# 1. Copia el archivo a Google Drive
# 2. Descarga en tu teléfono
# 3. Abre el archivo desde la app de Descargas
```

**Paso 3: Permitir instalación**
- Si ves aviso: "Instalar apps de origen desconocido"
- Ir a Configuración > Seguridad > Fuentes desconocidas
- Activar la opción
- Intentar instalar de nuevo

**Paso 4: Aceptar permisos**
```
La app solicita:
✅ Almacenamiento (para base de datos)
✅ Internet (para conectar con API)
```

**Paso 5: Abrir app**
- Busca "Marketing Automation" en tu menú de apps
- Toca el icono para abrir

**Paso 6: Login**
```
Email: test@email.com
Password: 123456
```

---

### Opción 2: Compilar APK Localmente

**Requisitos:**
- Node.js 16+
- npm 8+
- Cuenta Expo (gratuita)
- Android SDK (opcional, para build local)

**Instalación:**
```bash
# 1. Navegar a carpeta
cd dist/apk

# 2. Ejecutar compilador
./COMPILE_APK.sh

# 3. Seleccionar opción
# Opción 1: EAS Build (recomendado, sin requerir Android SDK)
# Opción 2: Build Local (requiere Android SDK)

# 4. Seguir instrucciones interactivas
# - Hacer login en Expo
# - Esperar 30-45 minutos
# - Descargar APK

# 5. Instalar
adb install output/app.apk
```

---

## 🔐 Credenciales de Prueba

Para ambas plataformas, usa:
```
Email:    test@email.com
Password: 123456
```

**Para crear usuario nuevo:**
1. Haz clic en "Register"
2. Ingresa email y contraseña
3. Haz clic en "Register"
4. Ya puedes hacer login

---

## 🔧 Solución de Problemas

### Windows

#### "El programa no se abre"
```bash
# Solución 1: Ejecutar como administrador
# Clic derecho > Ejecutar como administrador

# Solución 2: Revisar puertos
# Comando (PowerShell/CMD):
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# Si están ocupados, esperar o cerrar otros programas
```

#### "Puerto 3000/5001 ya está en uso"
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :5001

# Matar el proceso (reemplaza PID)
taskkill /PID 1234 /F

# O cambiar puertos en:
# backend/app.py (línea de app.run)
# web/build/index.html (si está compilado)
```

#### "No se abre el navegador"
```bash
# Solución:
# Abre manualmente: http://localhost:3000
# Si no carga, espera 10 segundos
# Verifica que Backend está iniciado (puedes ver la consola)
```

#### "Error: "This site can't be reached""
```bash
# Verificar que backend está corriendo
# Deberías ver una ventana de consola con Python

# Si no ves la consola:
# 1. Abre otra ventana de CMD
# 2. Navega a dist/pc/backend
# 3. Ejecuta: python app.py

# Si sigue sin funcionar:
# Revisa que port 5001 está libre
netstat -ano | findstr :5001
```

### Android

#### "App no se instala"
```bash
# Solución 1: Desinstalar versión anterior
adb uninstall com.marketingautomation.app
adb install marketing-automation-v1.0.0.apk

# Solución 2: Permitir origen desconocido
# Configuración > Seguridad > Fuentes desconocidas > Activar

# Solución 3: Liberar espacio
# Necesita mínimo 50 MB libres
# Elimina archivos temporales / apps no usadas
```

#### "No se conecta al backend"
```bash
# Problema: IP del backend es diferente

# Si usas emulador:
# Cambiar en mobile/src/screens/LoginScreen.js
const API_URL = 'http://10.0.2.2:5001/api'  // Para emulador
// const API_URL = 'http://192.168.x.x:5001/api'  // Para dispositivo real

# Si usas dispositivo real:
# 1. Obtener IP de tu PC
# Windows CMD: ipconfig
# Linux/Mac: ifconfig

# 2. Usar esa IP en LoginScreen.js
const API_URL = 'http://[TU-IP]:5001/api'

# 3. Recompilar APK o editar la app en desarrollo
```

#### "Pantalla en blanco o se cierra"
```bash
# Solución 1: Limpiar caché
adb shell pm clear com.marketingautomation.app

# Solución 2: Reinstalar
adb uninstall com.marketingautomation.app
adb install marketing-automation-v1.0.0.apk

# Solución 3: Verificar Android version
# La app requiere Android 5.0 (API 21) o superior
# Verifica tu versión en Configuración > Acerca del dispositivo
```

---

## 📊 Verificación de Instalación

### Windows
```bash
# Verificar que todo funciona:

# 1. Backend corriendo en puerto 5001
http://localhost:5001/health
# Debería devolver: {"status": "ok"}

# 2. Web corriendo en puerto 3000
http://localhost:3000
# Debería cargar la interfaz web

# 3. Base de datos existe
# Archivo: backend/marketing.db
# Debe existir después de primer inicio
```

### Android
```bash
# Verificar que la app está instalada:
adb shell pm list packages | grep marketing
# Debería mostrar: com.marketingautomation.app

# Verificar que se ejecuta:
adb shell am start -n com.marketingautomation.app/.MainActivity
```

---

## 🔄 Actualizar a Nueva Versión

### Windows
```bash
# Opción 1: Ejecutable Portable
# Simplemente ejecuta la nueva versión
# Los datos se mantienen en backend/marketing.db

# Opción 2: Instalador
# 1. Desinstala la versión anterior (Panel de Control)
# 2. Instala la nueva versión (ejecuta Setup)
# 3. Los datos se conservan
```

### Android
```bash
# Opción 1: Actualizar automáticamente (si está publicado en Play Store)
# Google Play > Marketing Automation > Actualizar

# Opción 2: Actualizar manualmente
adb uninstall com.marketingautomation.app
adb install marketing-automation-v1.0.0-new.apk
```

---

## 📚 Documentación Relacionada

| Documento | Descripción |
|-----------|-------------|
| `README.md` | Overview general del proyecto |
| `dist/pc/INSTALAR_WINDOWS.md` | Guía detallada Windows |
| `dist/apk/output/INSTRUCCIONES_APK.md` | Guía detallada Android |
| `PLAN_DESARROLLO.md` | Roadmap y nuevas features |
| `ACODE_PROMPT.md` | Desarrollo en Acode (Android) |
| `RESUMEN_COMPILACION_FINAL.md` | Resumen técnico de compilación |

---

## 🎯 Próximos Pasos

### Después de instalar:

1. **Explorar la interfaz**
   - Dashboard: Ver estadísticas
   - Campaigns: Crear campañas de prueba
   - Contacts: Agregar contactos
   - Analytics: Ver gráficos

2. **Personalizar**
   - Cambiar datos de prueba
   - Crear tus propias campañas
   - Agregar tus contactos

3. **Desarrollo**
   - Lee `PLAN_DESARROLLO.md` para nuevas features
   - Lee `ACODE_PROMPT.md` para desarrollo en Android
   - Modifica el código según tus necesidades

---

## 🆘 Soporte Técnico

Si tienes problemas:

1. **Revisa la sección "Solución de Problemas" arriba**
2. **Revisa documentación específica:**
   - Windows: `dist/pc/INSTALAR_WINDOWS.md`
   - Android: `dist/apk/output/INSTRUCCIONES_APK.md`
3. **Verifica requisitos del sistema**
4. **Intenta reinstalar la aplicación**
5. **Revisa los logs de error en consola**

---

## 📝 Notas Importantes

- **Primera ejecución:** Puede tardar 5-10 segundos en iniciarse
- **Base de datos:** Creada automáticamente en `backend/marketing.db`
- **Puertos:** Asegúrate que 3000 y 5001 están disponibles
- **Credenciales:** test@email.com / 123456 son para pruebas
- **Desarrollo:** Modifica código en `backend/`, `web/`, o `mobile/`
- **Compilación:** Lee `RESUMEN_COMPILACION_FINAL.md`

---

## ✅ ¡Lista para Instalar!

**Versión:** 1.0.0  
**Opciones:** Windows (EXE) + Android (APK)  
**Estado:** ✅ LISTO PARA PRODUCCIÓN

### Windows
```bash
Ejecuta: Marketing-Automation-v1.0.0.exe
Accede: http://localhost:3000
```

### Android
```bash
Instala: marketing-automation-v1.0.0.apk
Abre: Marketing Automation
```

**¡Disfruta tu Sistema de Marketing Automation! 🚀**

---

**Última actualización:** 2026-08-12  
**Versión:** 1.0.0  
**Proyecto:** Marketing Automation System
