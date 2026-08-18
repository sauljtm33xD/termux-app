# 🚀 URU - Instrucciones de Compilación Local

## ⚠️ IMPORTANTE
Este proyecto **DEBE compilarse en tu máquina local** (Windows, Mac o Linux) con **Android Studio**.  
El entorno remoto NO tiene Android SDK.

---

## 📋 ANTES DE EMPEZAR - Verifica que tienes:

```bash
# JDK 17+
java -version

# Android SDK (debería estar en tu Android Studio)
echo $ANDROID_HOME

# Git
git --version
```

---

## 🔧 PASO 1: Clonar/Actualizar Repositorio

**Si es la primera vez:**
```bash
git clone https://github.com/sauljtm33xD/termux-app.git
cd termux-app
git checkout claude/clean-architecture-mvvm-refactor-c77r5x
cd android-clean-architecture
```

**Si ya lo tenías:**
```bash
cd termux-app
git fetch origin claude/clean-architecture-mvvm-refactor-c77r5x
git checkout claude/clean-architecture-mvvm-refactor-c77r5x
cd android-clean-architecture
```

---

## 🔨 PASO 2: Abrir en Android Studio

### Opción A: Línea de Comandos (Rápido)
```bash
# En la carpeta android-clean-architecture/

# Limpiar cachés anteriores
./gradlew clean

# Compilar APK debug
./gradlew assembleDebug

# El APK estará en:
# build/outputs/apk/debug/app-debug.apk
```

### Opción B: Android Studio GUI (Recomendado)
1. Abre **Android Studio**
2. Click en **File → Open**
3. Navega a: `termux-app/android-clean-architecture`
4. Espera a que Gradle sincronice (2-3 minutos)
5. Click en **Build → Make Project**
6. Verás el progreso en la pestaña **Build**
7. Cuando termine: ✅ **BUILD SUCCESSFUL**

---

## 📱 PASO 3: Instalar en tu Teléfono

### Conectar el teléfono:
```bash
# Asegúrate que el teléfono esté conectado por USB
# y que tengas "USB Debugging" habilitado en Configuración > Opciones de Desarrollador

adb devices
# Deberías ver algo como:
# List of attached devices
# emulator-5554 device
```

### Instalar la APK:
```bash
cd android-clean-architecture

# Si compilaste con ./gradlew:
adb install -r build/outputs/apk/debug/app-debug.apk

# O directamente en Android Studio:
# Click en Run → Run 'app'
```

---

## ▶️ PASO 4: Ejecutar la App

### Desde línea de comandos:
```bash
adb shell am start -n com.uru/.presentation.ui.MainActivity
```

### Desde Android Studio:
1. Asegúrate que el teléfono está conectado
2. Click en ▶️ **Run** (o Shift+F10)
3. Selecciona tu dispositivo

---

## ✅ Checklist - Si Todo Funciona:

- [ ] APK compilado sin errores
- [ ] APK instalado en el teléfono
- [ ] App abre sin crashes
- [ ] Ves el header "URU" con status IDLE
- [ ] Puedes escribir en el campo de texto
- [ ] Cuando envías un mensaje, aparece en el chat
- [ ] URU responde con latencia y SHA-256 signature

---

## 🔍 TROUBLESHOOTING

### Error: "Could not resolve dependency"
```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

### Error: "No Android SDK found"
```bash
# En Linux/Mac:
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
export ANDROID_HOME=$HOME/Android/Sdk           # Linux
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Verifica:
echo $ANDROID_HOME
```

### Error: "Gradle sync failed"
1. **File → Invalidate Caches / Restart**
2. Cierra Android Studio
3. Elimina carpeta: `android-clean-architecture/.gradle/`
4. Reabre Android Studio

### Error: "Compilation failed"
- Verifica que tu teléfono tenga **minSdk 28** (Android 9+)
- Actualiza Android SDK a versión 34
- Ejecuta: `./gradlew clean`

---

## 📊 Verificar Que Todo Esté OK

### Después de compilar:
```bash
# Tamaño del APK (debe ser 10-30 MB)
ls -lh build/outputs/apk/debug/app-debug.apk

# Ver logs en tiempo real
adb logcat | grep -i uru
```

---

## 🎯 Lo Que Verás en la App

**Header (Top):**
- URU (logo)
- Estado: IDLE → LISTENING → PROCESSING → DECIDING → etc
- Contador de eventos
- Latencia promedio

**Chat (Centro):**
- Tus mensajes: burbuja índigo a la derecha
- Respuestas de URU: burbuja gris a la izquierda
- Metadata: latencia (ms) + SHA-256 signature

**Input (Bottom):**
- Campo de texto para escribir
- Botón SEND (avión de papel)

---

## 💡 Comandos de Prueba

Una vez que la app esté corriendo, intenta escribir:

```
"Hola URU"
"¿Cuál es mi estado?"
"Procesa una orden"
"Muéstrame el contexto"
```

Cada mensaje será publicado como evento a la ContextEngine.

---

## 📞 Si Algo Falla

1. **Revisa los logs:**
   ```bash
   adb logcat | grep uru
   ```

2. **Verifica que Gradle sincronizó:**
   - Android Studio → View → Tool Windows → Gradle
   - Haz clic en el ícono de refresh 🔄

3. **Borra cachés y recompila:**
   ```bash
   ./gradlew clean
   ./gradlew build --dry-run
   ./gradlew assembleDebug
   ```

---

**Tiempo estimado: 10-15 minutos**

¿Preguntas? ¡Dale a compilar! 🚀
