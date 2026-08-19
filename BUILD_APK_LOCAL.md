# 🔨 Compilar APK - Instrucciones Locales

Debido a limitaciones de red en entornos remotos, **compila el APK localmente en tu máquina**.

---

## 📋 Requisitos

- **Java 17+:** `java -version` (debe mostrar 17+)
- **Gradle 8.14+:** `gradle -v`
- **Android SDK:** Instalado (min compileSdk 34)
- **Git:** Para clonar/actualizar el proyecto

---

## ✅ Paso 1: Preparar el Proyecto

### Clonar/actualizar repositorio:
```bash
cd tu-directorio
git clone https://github.com/sauljtm33xD/termux-app.git
cd termux-app/android-clean-architecture
```

### Actualizar a la rama con fixes:
```bash
git fetch origin claude/clean-architecture-mvvm-refactor-c77r5x
git checkout claude/clean-architecture-mvvm-refactor-c77r5x
```

---

## 🔧 Paso 2: Verificar Configuración

### Verifica que tengas Java 17+:
```bash
java -version
# Debe mostrar: openjdk version "17" o mayor
```

### Verifica Gradle:
```bash
gradle -v
# Debe mostrar: Gradle 8.14+ (o usa ./gradlew si no tienes Gradle global)
```

### Verifica SDK:
```bash
# Linux/Mac:
echo $ANDROID_HOME

# Windows:
echo %ANDROID_HOME%
```

Si no está configurado:
```bash
# Linux/Mac:
export ANDROID_HOME=$HOME/Library/Android/sdk
# O tu ruta de instalación

# Windows (en PowerShell):
$env:ANDROID_HOME = "C:\Users\YourUser\AppData\Local\Android\sdk"
```

---

## 🚀 Paso 3: Compilar APK

### Opción A: Debug APK (recomendado para testing)

```bash
cd android-clean-architecture
./gradlew clean assembleDebug
```

**Output:** `build/outputs/apk/debug/app-debug.apk`

### Opción B: Release APK (para producción)

```bash
./gradlew clean assembleRelease
```

**Output:** `build/outputs/apk/release/app-release.apk`

---

## 📱 Paso 4: Instalar en Realme

### Con ADB:
```bash
# Conecta tu Realme por USB
adb devices  # Verifica que se ve el dispositivo

# Debug APK:
adb install build/outputs/apk/debug/app-debug.apk

# O Release APK:
adb install -r build/outputs/apk/release/app-release.apk
```

### Manual:
1. Copia el APK a tu Realme (USB o email)
2. Abre el APK en el dispositivo
3. Permite instalación de "Fuentes desconocidas"
4. ¡Listo!

---

## ✅ Verificación

### En tu Realme:
1. Abre la app "URU Personal AI Middleware"
2. Verifica que carga sin errores
3. Prueba: Envía un mensaje de chat
4. Verifica respuesta con Gemini API

---

## 🆘 Troubleshooting

### Error: "No Android SDK found"
```bash
# Instala Android SDK o configura ANDROID_HOME
# Ver: https://developer.android.com/studio/install
```

### Error: "Plugin not found"
```bash
# Asegúrate de estar en la rama correcta:
git branch  # Debe mostrar: * claude/clean-architecture-mvvm-refactor-c77r5x

# Si no, cambia:
git checkout claude/clean-architecture-mvvm-refactor-c77r5x
```

### Error: "Could not resolve dependency"
```bash
# Limpiar caché de Gradle:
rm -rf ~/.gradle/caches
./gradlew clean assembleDebug
```

### Build tarda mucho
- Primera compilación puede tardar 10-15 minutos
- Descargas dependencias una sola vez
- Compilaciones posteriores: ~2-3 minutos

---

## 📦 Build Output

Después de compilar exitosamente, encontrarás:

```
android-clean-architecture/
├── build/
│   └── outputs/
│       └── apk/
│           ├── debug/
│           │   └── app-debug.apk (8-15 MB)
│           └── release/
│               └── app-release.apk (3-8 MB, minificado)
```

---

## 🎯 Próximos Pasos

1. ✅ Compila APK localmente
2. ✅ Instala en tu Realme
3. ✅ Prueba la app con Gemini API
4. ✅ Proporciona feedback
5. ✅ (Opcional) Sube APK compilado a GitHub Releases

---

## 📊 Resumen

| Componente | Status | Ubicación |
|-----------|--------|-----------|
| Web App URU | ✅ Listo | `dist/` |
| APK Android | 🔨 Compilar localmente | `android-clean-architecture/build/` |
| Gemini API | ✅ Integrada | Ambos (web + Android) |
| CI/CD | ✅ GitHub Actions | `.github/workflows/` |

---

**Última actualización:** 2026-08-19  
**Estado:** Listo para compilación local
