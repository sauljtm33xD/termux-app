# 📱 Compilar APK en Android Studio

## ⚠️ IMPORTANTE

Este proyecto **debe compilarse en TU PC** (no en servidor remoto) porque:
- ✅ Sin restricciones de proxy
- ✅ Android SDK instalado localmente
- ✅ Gradle descarga sin problemas
- ✅ Compilación rápida

---

## 📋 REQUISITOS

### **Instalaciones necesarias (si no las tienes):**

1. **Java Development Kit (JDK)**
   - Descarga: https://www.oracle.com/java/technologies/javase-jdk11-downloads.html
   - O: `brew install openjdk@11` (Mac)

2. **Android Studio**
   - Descarga: https://developer.android.com/studio
   - Instala en tu PC

3. **Android SDK**
   - Se instala automático con Android Studio
   - Necesita: API Level 34 (Android 14)

4. **Gradle**
   - Incluido en Android Studio (sin descargar manual)

---

## 🚀 PASO A PASO - COMPILAR APK

### **Paso 1: Abre Android Studio**

```
1. Inicia Android Studio
2. Espera a que cargue completamente
```

### **Paso 2: Abre el proyecto**

```
1. File → Open
2. Selecciona carpeta: android-project/
3. Click en "Open"
4. Espera a que Gradle sincronice (1-2 min)
```

### **Paso 3: Espera la sincronización**

```
Android Studio descargará automáticamente:
- Gradle 8.14.3
- Android SDK
- Dependencias

Verás en la esquina inferior: "Gradle build finished"
```

### **Paso 4: Conecta dispositivo o crea emulador**

#### **Opción A: Dispositivo físico**
```
1. Conecta tu Android con USB
2. Activa "Depuración USB" (Ajustes → Desarrollador)
3. Autoriza la conexión
4. Android Studio detectará automáticamente
```

#### **Opción B: Emulador**
```
1. Tools → Device Manager
2. Create Device
3. Selecciona "Pixel 4" o similar
4. Finish
5. Presiona Play para iniciar
```

### **Paso 5: Compila el APK**

```
Opción A: Directo en el dispositivo (recomendado)
1. Click en botón Play verde (▶️) arriba
2. Espera a que compile y instale
3. App se abre automáticamente en el dispositivo

Opción B: Generar APK solo
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Espera a que termine
3. Verás un popup con enlace al APK
```

### **Paso 6: ¡Listo! APK generado**

El APK estará en:
```
android-project/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 **Instalar en tu dispositivo**

### **Opción 1: Desde Android Studio (Automático)**
```
Ya está instalado si compilaste con Play (▶️)
```

### **Opción 2: Manual via USB**
```bash
# En tu PC, terminal:
adb install android-project/app/build/outputs/apk/debug/app-debug.apk
```

### **Opción 3: Transferir y instalar manual**
```
1. Copia app-debug.apk a tu dispositivo
2. Abre el archivo con Gestor de archivos
3. Instala
4. Acepta los permisos
```

---

## 🎯 **Estructura del proyecto**

```
android-project/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/mayordomo/swiss/
│   │   │   │   └── MainActivity.java       ← Carga la web
│   │   │   ├── res/
│   │   │   │   ├── layout/activity_main.xml
│   │   │   │   ├── values/
│   │   │   │   │   ├── colors.xml
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   └── themes.xml
│   │   │   └── assets/
│   │   │       ├── index.html              ← Tu app web
│   │   │       ├── style.css
│   │   │       ├── script.js
│   │   │       └── app.js
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── .gitignore
```

---

## 🛠️ **Solucionar Errores Comunes**

### **Error: "Gradle sync failed"**
```
Solución:
1. File → Invalidate Caches
2. Restart
3. Espera a que compile
```

### **Error: "SDK not found"**
```
Solución:
1. Tools → SDK Manager
2. API Levels → Selecciona API 34
3. Instala
```

### **Error: "Device not found"**
```
Solución (USB):
1. Conecta dispositivo
2. Autoriza conexión
3. Adb install -r app-debug.apk

Solución (Emulador):
1. Tools → Device Manager
2. Inicia emulador
```

### **Error: "app-debug.apk no se genera"**
```
Solución:
1. Build → Clean Project
2. Build → Rebuild Project
3. Espera a que termine
4. Build → Build APK(s)
```

---

## 📊 **Tamaño del APK**

| Tipo | Tamaño |
|------|--------|
| debug APK | ~15-20 MB |
| release APK | ~8-10 MB |

Para release (más pequeño):
```
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Selecciona "release"
3. Necesita firma digital
```

---

## 🚀 **Después de compilar**

### **Distribuir tu APK:**

**Opción 1: Google Play**
```
1. Crea cuenta Google Play Developer ($25 una vez)
2. Sube el APK release firmado
3. Publica
```

**Opción 2: GitHub Releases**
```
1. Ve a GitHub → Releases
2. Create Release
3. Sube app-debug.apk
4. Comparte el enlace
```

**Opción 3: APKMirror / APKPure**
```
Sitios que hospedan APKs públicamente
```

---

## 📝 **Cambios personalizados**

### **Cambiar nombre de la app:**
Edita: `app/src/main/res/values/strings.xml`
```xml
<string name="app_name">TU NOMBRE AQUÍ</string>
```

### **Cambiar colores:**
Edita: `app/src/main/res/values/colors.xml`
```xml
<color name="primary">#tu-color</color>
```

### **Cambiar ícono:**
1. Reemplaza: `app/src/main/res/mipmap-*/ic_launcher.png`

---

## ✅ **CHECKLIST de compilación**

- [ ] Java JDK 11+ instalado
- [ ] Android Studio instalado
- [ ] Android SDK API 34 instalado
- [ ] Proyecto abierto en Android Studio
- [ ] Gradle sincronizado sin errores
- [ ] Dispositivo conectado O emulador listo
- [ ] Build sin errores
- [ ] APK generado en `build/outputs/apk/`
- [ ] APK instalado en dispositivo
- [ ] App abierta y funcionando

---

## 🎉 **¡Listo!**

Tienes tu MAYORDOMO Swiss Knife como APK nativa en Android.

**Ventajas de esta versión:**
- ✅ Funciona sin internet (excepto módulo RED)
- ✅ Icono en pantalla de inicio
- ✅ Acceso a permisos nativos Android
- ✅ Mejor rendimiento que navegador
- ✅ Instalación directa sin Play Store

---

## 📞 **Si algo no funciona...**

1. **Limpiar todo:** `Build → Clean Project`
2. **Recompilar:** `Build → Rebuild Project`
3. **Invalidar cache:** `File → Invalidate Caches → Restart`
4. **Buscar error en Google:** Copia el mensaje de error
5. **Stack Overflow:** https://stackoverflow.com/

---

**¡A compilar!** 🚀
