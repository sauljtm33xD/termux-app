# URU - Guía de Instalación y Compilación

## 📱 Acerca de URU

**URU** es un asistente de IA personal para Android basado en la arquitectura **ARMA C30**. Funciona offline-first con modelos TensorFlow Lite y se integra con APIs de IA (Gemini, OpenAI, Anthropic) cuando hay conexión.

---

## 🚀 Inicio Rápido (5 minutos)

### Prerequisitos
- **JDK 17+** instalado
- **Android SDK API 34** descargado
- **JAVA_HOME** y **ANDROID_SDK_ROOT** configurados

### Compilar APK
```bash
cd android-clean-architecture

# Windows
gradlew.bat clean assembleDebug

# macOS/Linux
chmod +x gradlew
./gradlew clean assembleDebug
```

**El APK estará en:** `app/build/outputs/apk/debug/app-debug.apk`

---

## 🔧 Instalación Completa (Primera Vez)

### Paso 1: Instalar Java Development Kit (JDK 17)

#### Windows
1. Descarga desde [Eclipse Temurin](https://adoptium.net/) o [Oracle](https://www.oracle.com/java/technologies/downloads/#java17)
2. Ejecuta el instalador
3. Configura `JAVA_HOME`:
   - Panel de Control → Variables de Entorno
   - Nueva variable: `JAVA_HOME = C:\Program Files\Java\jdk-17.x`
   - Añade a `PATH`: `%JAVA_HOME%\bin`

#### macOS
```bash
brew install openjdk@17
brew link openjdk@17
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt install openjdk-17-jdk openjdk-17-jdk-headless
```

**Verificar:**
```bash
java -version
javac -version
```

---

### Paso 2: Instalar Android SDK

#### Opción A: Android Studio (Recomendado)
1. Descarga [Android Studio](https://developer.android.com/studio)
2. Ejecuta el instalador
3. Abre Android Studio y deja que descargue automáticamente:
   - SDK Platform 34
   - SDK Build Tools 34.0.0
   - Android Emulator

Android Studio configurará `ANDROID_SDK_ROOT` automáticamente en:
- **Windows:** `C:\Users\{Usuario}\AppData\Local\Android\sdk`
- **macOS:** `~/Library/Android/sdk`
- **Linux:** `~/Android/sdk`

#### Opción B: Command-line Tools (Manual)
1. Descarga desde [Google](https://developer.android.com/studio#command-tools)
2. Extrae en una carpeta (ej: `C:\android-sdk`)
3. Instala componentes:
```bash
cd android-sdk/cmdline-tools/latest/bin
sdkmanager --licenses  # Acepta todas las licencias
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
```

**Configurar variable `ANDROID_SDK_ROOT`:**

Windows (CMD):
```cmd
setx ANDROID_SDK_ROOT C:\Users\{Usuario}\AppData\Local\Android\sdk
```

macOS/Linux (Terminal):
```bash
echo 'export ANDROID_SDK_ROOT=~/Library/Android/sdk' >> ~/.zshrc
source ~/.zshrc
```

**Verificar:**
```bash
adb version
```

---

## 📦 Compilar el Proyecto

### Opción 1: Android Studio (Visual - Recomendado)

1. **Abrir proyecto:**
   - Abre Android Studio
   - File → Open
   - Selecciona la carpeta `android-clean-architecture`
   - Haz clic en "Open"

2. **Esperar sincronización:**
   - Gradle descargará todas las dependencias
   - Verás "Gradle sync finished" en la consola

3. **Compilar:**
   - Build → Make Project
   - O: `Ctrl+F9` (Windows/Linux) / `Cmd+F9` (macOS)

4. **Ejecutar:**
   - Run → Run 'app'
   - O: `Shift+F10` (Windows/Linux) / `Ctrl+R` (macOS)
   - Selecciona emulador o dispositivo conectado

### Opción 2: Terminal/CMD (CLI)

#### Windows
```cmd
cd android-clean-architecture
gradlew.bat clean assembleDebug
```

#### macOS/Linux
```bash
cd android-clean-architecture
chmod +x gradlew
./gradlew clean assembleDebug
```

**Espera a ver:** `BUILD SUCCESSFUL in X seconds`

---

## 📱 Instalar en Dispositivo/Emulador

### Con Emulador (Android Studio)
1. Device Manager (izquierda) → Crear/Seleccionar emulador
2. Iniciar emulador (espera a que cargue completamente)
3. Run → Run 'app'
4. Selecciona el emulador → OK

### Con Dispositivo Físico

1. **Conecta via USB**
2. **Activa "Depuración USB":**
   - Configuración → Opciones de Desarrollador
   - Activa "Depuración USB"

3. **Verifica conexión:**
```bash
adb devices
```

4. **Instala APK:**

Windows:
```cmd
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

macOS/Linux:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

5. **Abre la aplicación:**
   - Busca "URU" en el dispositivo
   - Toca para abrir

---

## 🔑 Compilar APK para PlayStore (Release)

### Paso 1: Crear Certificado de Firma

Windows (PowerShell):
```powershell
keytool -genkey -v -keystore uru-keystore.jks -keyalg RSA `
  -keysize 2048 -validity 10000 `
  -alias uru-key
```

macOS/Linux (Terminal):
```bash
keytool -genkey -v -keystore uru-keystore.jks -keyalg RSA \
  -keysize 2048 -validity 10000 \
  -alias uru-key
```

Te pedirá:
- **Contraseña keystore:** (ej: `URU2024Secure!`)
- **Nombre completo:** Tu nombre
- **Unidad organizativa:** Tu empresa
- **Organización:** Nombre de la compañía
- **Ciudad:** Tu ciudad
- **Provincia:** Tu provincia
- **Código país:** ES, US, MX, etc.

### Paso 2: Crear archivo `keystore.properties`

En la carpeta `android-clean-architecture/`:
```properties
storeFile=../uru-keystore.jks
storePassword=URU2024Secure!
keyAlias=uru-key
keyPassword=URU2024Secure!
```

### Paso 3: Compilar Release APK

Windows:
```cmd
gradlew.bat assembleRelease
```

macOS/Linux:
```bash
./gradlew assembleRelease
```

**El APK estará en:** `app/build/outputs/apk/release/app-release.apk`

---

## 📚 Documentación Adicional

- **[README_COMPILACION.txt](android-clean-architecture/README_COMPILACION.txt)** - Resumen rápido (2 min)
- **[QUICK_START.md](android-clean-architecture/QUICK_START.md)** - Comandos rápidos (5 min)
- **[BUILD_INSTRUCTIONS.md](android-clean-architecture/BUILD_INSTRUCTIONS.md)** - Guía completa (20 min)
- **[COMPILE_CHECKLIST.md](android-clean-architecture/COMPILE_CHECKLIST.md)** - Checklist paso a paso
- **[DOCUMENTACION_INDEX.md](android-clean-architecture/DOCUMENTACION_INDEX.md)** - Índice centralizado
- **[ARCHITECTURE.md](android-clean-architecture/ARCHITECTURE.md)** - Diseño ARMA C30
- **[IMPLEMENTATION_GUIDE.md](android-clean-architecture/IMPLEMENTATION_GUIDE.md)** - Cómo implementar features

---

## 🐛 Solución de Problemas

### Error: "JAVA_HOME no configurado"
```bash
# Windows (CMD)
echo %JAVA_HOME%

# macOS/Linux
echo $JAVA_HOME
```

Si no sale nada, configura la variable en el sistema.

### Error: "Android SDK no encontrado"
Verifica que `ANDROID_SDK_ROOT` está configurado:
```bash
# Windows
echo %ANDROID_SDK_ROOT%

# macOS/Linux
echo $ANDROID_SDK_ROOT
```

### Error: "Gradle sync failed"
```bash
cd android-clean-architecture
./gradlew clean build
```

### Error: "Could not find gradle-wrapper.jar"
El gradle wrapper descargará automáticamente en la primera ejecución. Verifica tu conexión a internet.

### Error: "Permission denied: ./gradlew"
```bash
chmod +x android-clean-architecture/gradlew
```

### Error: "BUILD FAILED"
Revisa el error en rojo. Más info con:
```bash
./gradlew build --stacktrace
```

---

## ✅ Checklist Pre-Compilación

- [ ] JDK 17+ instalado (`java -version`)
- [ ] Android SDK API 34 descargado
- [ ] `JAVA_HOME` configurado
- [ ] `ANDROID_SDK_ROOT` configurado
- [ ] `adb` funciona (`adb version`)
- [ ] Terminal nueva abierta (para que lea variables)
- [ ] Estoy en carpeta `android-clean-architecture/`

---

## 🎯 Requisitos Mínimos

| Componente | Mínimo | Recomendado |
|-----------|--------|-------------|
| JDK | 17 | 21 |
| Android SDK | API 24 | API 34 |
| RAM | 4 GB | 8 GB |
| Espacio disco | 5 GB | 15 GB |
| SO | Windows 7, Linux, macOS 10.12 | Windows 10+, Recent Linux, macOS 11+ |

---

## 🚀 Comandos Útiles

```bash
# Compilar Debug
./gradlew assembleDebug

# Compilar Release
./gradlew assembleRelease

# Ejecutar tests
./gradlew test

# Ver todas las tareas
./gradlew tasks

# Limpiar cache
./gradlew clean

# Compilar + instalar
./gradlew installDebug

# Ver versión de gradle
./gradlew --version

# Ver logs en tiempo real
adb logcat | grep URU
```

---

## 📞 Soporte

Para problemas específicos:
1. Revisa [BUILD_INSTRUCTIONS.md](android-clean-architecture/BUILD_INSTRUCTIONS.md)
2. Consulta [COMPILE_CHECKLIST.md](android-clean-architecture/COMPILE_CHECKLIST.md)
3. Lee los logs de error completos

---

## 📈 Próximas Versiones

- [ ] Compilación automática en GitHub Actions
- [ ] Distribución en PlayStore
- [ ] Firma automática de APK
- [ ] CI/CD pipeline
- [ ] Testing automatizado

---

**Última actualización:** Agosto 2026  
**Versión:** 1.0  
**Estado:** ✅ Funcional

¡Listo para compilar! 🚀
