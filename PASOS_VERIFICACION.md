# 🧪 Pasos de Verificación Local

Después de las correcciones de seguridad, verifica que todo compila correctamente.

---

## 📋 Checklist de Verificación

### Paso 1: Descargar últimos cambios

```bash
cd /home/user/termux-app

# Asegúrate de estar en la rama correcta
git branch -v
# Output: claude/clean-architecture-mvvm-refactor-c77r5x (con commit 5ce9b18)

# Actualizar
git fetch origin
git pull origin claude/clean-architecture-mvvm-refactor-c77r5x
```

**Esperado:**
- ✅ Already up to date
- ✅ o descarga los cambios recientes

---

### Paso 2: Verificar estructura (sin /java/)

```bash
cd android-clean-architecture

# Verificar que NO existe /java/
test ! -d src/main/java && echo "✅ /java/ eliminado correctamente" || echo "❌ ERROR: /java/ aún existe"

# Verificar que EXISTE /kotlin/
test -d src/main/kotlin && echo "✅ /kotlin/ existe" || echo "❌ ERROR: /kotlin/ falta"

# Contar archivos Kotlin
find src/main/kotlin -name "*.kt" | wc -l
# Output: Debe ser entre 20-50 archivos
```

**Esperado:**
```
✅ /java/ eliminado correctamente
✅ /kotlin/ existe
47
```

---

### Paso 3: Verificar Manifest limpio

```bash
# Ver el manifest
cat src/main/AndroidManifest.xml | grep -E "(uses-permission|android:name=\")"

# Contar permisos
grep -c "uses-permission" src/main/AndroidManifest.xml
# Output: 3 (INTERNET, ACCESS_NETWORK_STATE, POST_NOTIFICATIONS)
```

**Esperado:**
```
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
3
```

---

### Paso 4: Verificar Gradle (sin duplicados)

```bash
# Limpiar cachés anteriores
./gradlew clean

# Compilar (esto puede tomar 5-10 minutos)
./gradlew build -x test

# Si sale bien, verás:
# BUILD SUCCESSFUL
```

**Esperado:**
```
✅ BUILD SUCCESSFUL in Xm XXs
```

**Si falla con "duplicate class":**
```
ERROR: Duplicate class ...
```

**Solución si ocurre:**
```bash
# Eliminar build cache completo
rm -rf build/
rm -rf .gradle/

# Reintentar
./gradlew clean
./gradlew build -x test
```

---

### Paso 5: Compilar APK Debug

```bash
./gradlew assembleDebug

# Verifica que se creó la APK
ls -lh build/outputs/apk/debug/app-debug.apk

# Output: Debe mostrar un archivo de ~5-8 MB
# -rw-r--r-- 1 user group 5.2M app-debug.apk
```

**Esperado:**
```
-rw-r--r-- 1 user group 5.2M app-debug.apk
```

---

### Paso 6: Instalar en Realme 16 Pro+

```bash
# Asegúrate que el teléfono está conectado
adb devices
# Output: Debe listar tu dispositivo

# Desinstalar versión anterior (si existe)
adb uninstall com.uru

# Instalar nueva APK
adb install -r build/outputs/apk/debug/app-debug.apk

# Output: Success si funciona
```

**Esperado:**
```
List of attached devices
emulator-5554 device   (o tu dispositivo real)

Success
```

---

### Paso 7: Verificar en el Teléfono

```bash
# Abrir la app
adb shell am start -n com.uru/.presentation.ui.MainActivity

# Ver logs en tiempo real
adb logcat | grep -i "uru\|error" &

# Presiona CTRL+C después de 5 segundos para ver los logs
```

**Esperado:**
```
I/uru: App started
D/uru: Theme loading...
I/uru: MainActivity created
```

**En el teléfono:**
- ✅ App abre sin crashes
- ✅ Ves header con "URU"
- ✅ Ves campo de input
- ✅ Puedes escribir y enviar mensajes

---

## 🎯 Resumen de Comandos (Rápido)

```bash
# 1. Actualizar código
cd ~/termux-app
git pull origin claude/clean-architecture-mvvm-refactor-c77r5x

# 2. Verificar estructura
cd android-clean-architecture
ls -la src/main/ | grep -E "java|kotlin"

# 3. Compilar
./gradlew clean
./gradlew assembleDebug

# 4. Instalar
adb install -r build/outputs/apk/debug/app-debug.apk

# 5. Ejecutar
adb shell am start -n com.uru/.presentation.ui.MainActivity
```

---

## ⚠️ Si Algo Sale Mal

### Error: "duplicate class definition"
```bash
# Significa que hay archivos duplicados todavía
# Solución:
rm -rf src/main/java/
git status
# Verifica que se eliminó
```

### Error: "Cannot find package"
```bash
# Gradle necesita sincronizar
./gradlew --refresh-dependencies
./gradlew build
```

### Error: "Android SDK not found"
```bash
# Necesitas Android SDK instalado
# En Linux:
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Verifica
echo $ANDROID_HOME
adb version
```

### Error: "No targetSdk"
```bash
# El build.gradle necesita actualización
# Verifica que tienes:
# targetSdk 34
# compileSdk 34
```

---

## ✅ Checklist Final

- [ ] ✅ Git pull completado
- [ ] ✅ /java/ no existe
- [ ] ✅ /kotlin/ existe con 20+ archivos
- [ ] ✅ Manifest solo tiene 3 permisos
- [ ] ✅ Gradle clean exitoso
- [ ] ✅ Build exitoso (SIN duplicados)
- [ ] ✅ APK de 5-8 MB creada
- [ ] ✅ APK instalada en teléfono
- [ ] ✅ App abre sin crashes
- [ ] ✅ Tema se carga correctamente

**Si todas las casillas están marcadas = ✅ TODO LISTO**

---

## 📊 Logs Esperados

Cuando ejecutes `adb logcat | grep -i "uru"`, deberías ver algo como:

```
I/uru: Initializing URU App
D/uru: Theme system initialized
I/uru: AutonomyViewModel created
D/uru: EventEngine ready
I/uru: MainActivity displayed
```

**SIN líneas con:**
- ❌ "ERROR"
- ❌ "FATAL"
- ❌ "duplicate class"
- ❌ "ClassNotFoundException"

---

**¿Problemas? Sigue estos pasos en orden y verás dónde se tranca.** 🚀
