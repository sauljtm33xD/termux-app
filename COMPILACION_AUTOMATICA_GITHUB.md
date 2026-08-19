# 🚀 Compilación Automática de URU en GitHub Actions

## ¿Cómo Funciona?

Cada vez que haces **push** a la rama `claude/clean-architecture-mvvm-refactor-c77r5x`, GitHub **compila automáticamente** la APK en la nube sin que hagas nada.

---

## 📥 Descargar la APK Compilada

### Paso 1: Ir a GitHub Actions
1. Abre tu repositorio: **https://github.com/sauljtm33xD/termux-app**
2. Click en pestaña **"Actions"** (arriba a la derecha)
3. Verás una lista de "workflows" ejecutándose

### Paso 2: Seleccionar el Build
- Click en el **workflow más reciente** (aparece con un checkmark ✅ si fue exitoso)
- Ejemplo: `Build URU APK - 841053c...`

### Paso 3: Descargar los Artifacts
Abajo de la página verás **"Artifacts"** con 2 opciones:

```
📦 URU-debug-apk       ← Para TESTING (recomendado)
📦 URU-release-apk     ← Para producción (sin firmar)
```

- Click en **URU-debug-apk** → se descarga `app-debug.apk`

---

## 📱 Instalar en tu Realme 16 Pro+

### Opción 1: Línea de Comandos (Recomendado)
```bash
# 1. Conecta tu teléfono por USB
# 2. Activa "USB Debugging" en Configuración > Opciones de Desarrollador

# 3. Instala la APK
adb install -r app-debug.apk

# 4. Inicia la app
adb shell am start -n com.uru/.presentation.ui.MainActivity
```

### Opción 2: Arrastra y Suelta (Más Fácil)
1. Conecta tu teléfono por USB
2. Arrastra `app-debug.apk` al teléfono (en la carpeta de Descargas)
3. Abre el file manager del teléfono
4. Busca `app-debug.apk` en Descargas
5. Toca el archivo → Instalar

---

## ⚙️ Qué Compila Automáticamente

El workflow compila:

✅ **Debug APK** (`app-debug.apk`)
- Tamaño: ~5-8 MB
- Para testing
- Se puede instalar directamente
- Mostrador en tiempo real

✅ **Release APK** (`app-release-unsigned.apk`)
- Tamaño: ~4-6 MB
- Optimizado
- Sin firma digital (unsigned)
- Para llevar a producción después

---

## 🔍 Ver el Proceso de Compilación

Si quieres ver el build en **tiempo real**:

1. Ve a **Actions** en GitHub
2. Click en el workflow que está corriendo
3. Click en el job **"build"**
4. Verás todos los pasos:
   - ✓ Checkout code
   - ✓ Setup JDK 17
   - ✓ Setup Android SDK
   - ✓ Build Debug APK
   - ✓ Build Release APK
   - ✓ Upload Artifacts

---

## 📊 Cuándo Se Compila

Automáticamente cuando:
- ✅ Haces **push** a la rama
- ✅ Abres un **Pull Request**
- ✅ Haces **merge** a main

**Sin hacer nada más.** La compilación es automática.

---

## 🎯 Solución de Problemas

### El Build Falló (Red X)
1. Click en el workflow fallido
2. Mira el error en los logs
3. Los errores comunes son:
   - **Gradle sync error**: Borra `build.gradle` y vuelve a hacer push
   - **Missing SDK**: GitHub lo instala automáticamente
   - **Timeout**: Reintentar (click en "Re-run jobs")

### El APK No Se Descarga
1. Asegúrate que el build tiene checkmark ✅
2. Mira la sección "Artifacts" al final
3. Si no ves artifacts = el build falló (checa los logs)

### El APK No Instala en el Teléfono
```bash
# Error común: "app already installed"
adb uninstall com.uru
adb install -r app-debug.apk

# Si aún falla:
adb install -r --replace app-debug.apk
```

---

## 🚀 Flujo Completo Resumido

```
1. Haces cambios en el código
   ↓
2. git push -u origin claude/clean-architecture-mvvm-refactor-c77r5x
   ↓
3. GitHub Actions se dispara automáticamente (ves spinning wheel en Actions)
   ↓
4. ~5-8 minutos después: APK compilada ✅
   ↓
5. Descargas desde: Actions → Artifacts → URU-debug-apk
   ↓
6. adb install -r app-debug.apk
   ↓
7. ¡A probar en tu Realme 16 Pro+! 🎉
```

---

## 📌 Tips Útiles

### Ver Tamaño del APK
En el workflow, al final verás:
```
📊 APK Sizes:
-rw-r--r--  5.2M  app-debug.apk
-rw-r--r--  4.8M  app-release-unsigned.apk
```

### Guardar APK Histórico
Los APKs se guardan **30 días** automáticamente. Si necesitas uno viejo:
1. Ve a Actions
2. Busca el workflow de hace días
3. Descarga de Artifacts (si aún existe)

### Crear una Release Oficial
Cuando quieras una versión estable:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions creará automáticamente una **Release** con el APK.

---

## ✅ Verificar que Todo Funciona

**Primera vez:**
1. Haz push a la rama
2. Espera 1-2 minutos
3. Ve a **Actions** → verás "Build URU APK" corriendo
4. Espera 5-8 minutos más
5. Verás checkmark ✅
6. Descarga el APK
7. Instala con `adb install -r app-debug.apk`
8. Abre en el teléfono → ¡debería funcionar! 🎉

---

**¡Ya no necesitas Android Studio local! Todo en la nube ☁️**
