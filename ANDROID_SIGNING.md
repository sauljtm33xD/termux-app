# 🔐 Android Release Signing Guide

## Overview

Este documento explica cómo generar y configurar un keystore válido para firmar APK de release en Google Play Store.

**CRÍTICO**: El keystore es una credencial de distribución. No debe ser versionado en Git.

---

## 1️⃣ Generar un Keystore de Release

### Opción A: Desde Android Studio (Recomendado)

```bash
# Si tienes Android Studio instalado, usa:
# Build → Generate Signed Bundle/APK → Create new keystore

# O desde terminal:
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -alias uru_release_key
```

**Parámetros solicitados:**
```
Contraseña del keystore (min 6 caracteres): [MUY_SEGURA]
Nombre y apellido: URU
Unidad organizativa: Tech
Organización: Norxtec
Localidad: Mexico
Estado/Provincia: Mexico
Código país (2 letras): MX
¿Es correcta? (sí/no): sí
Contraseña de la clave (ENTER = igual a keystore): [ENTER o diferente]
```

### Opción B: Usando jarsigner

```bash
# Crear keystore con validez de 25 años
keytool -genkey -v \
  -keystore ~/.uru/release.keystore \
  -keyalg RSA -keysize 2048 \
  -validity 9125 \
  -alias uru_release_key \
  -dname "CN=URU,OU=Technology,O=Norxtec,L=Mexico,S=Mexico,C=MX"
```

---

## 2️⃣ Almacenar Keystore de Forma Segura

### LOCAL (Desarrollo)

```bash
# Crear carpeta oculta
mkdir -p ~/.uru
mv release.keystore ~/.uru/

# Permisos restrictivos
chmod 600 ~/.uru/release.keystore

# Nunca commitar a Git
echo "release.keystore" >> .gitignore
echo "*.keystore" >> .gitignore
```

### GITHUB SECRETS (CI/CD)

Para GitHub Actions, necesitas:

1. **Base64-encode el keystore** (sin saltos de línea):
   ```bash
   base64 -w0 ~/.uru/release.keystore > keystore.b64
   cat keystore.b64 | wc -c  # Verifica tamaño
   ```

2. **Crear GitHub Secrets** en Settings → Secrets and variables → Actions:
   - `KEYSTORE_B64`: Contenido del archivo .b64
   - `KEYSTORE_PASSWORD`: Contraseña del keystore
   - `KEY_ALIAS`: `uru_release_key`
   - `KEY_PASSWORD`: Contraseña de la clave

3. **Crear workflow** (`.github/workflows/release-build.yml`):
   ```yaml
   - name: Decode Keystore
     run: |
       mkdir -p ~/.uru
       echo "${{ secrets.KEYSTORE_B64 }}" | base64 -d > ~/.uru/release.keystore
       chmod 600 ~/.uru/release.keystore

   - name: Build Release APK
     run: ./gradlew :android-clean-architecture:assembleRelease
     env:
       KEYSTORE_PATH: ~/.uru/release.keystore
       KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
       KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
       KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
   ```

---

## 3️⃣ Configuración en build.gradle

La configuración actual (`android-clean-architecture/build.gradle`) usa variables de entorno:

```gradle
signingConfigs {
    release {
        storeFile = file(System.getenv('KEYSTORE_PATH') ?: 'debug.keystore')
        storePassword = System.getenv('KEYSTORE_PASSWORD') ?: ''
        keyAlias = System.getenv('KEY_ALIAS') ?: 'androiddebugkey'
        keyPassword = System.getenv('KEY_PASSWORD') ?: ''
    }
}

buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
```

---

## 4️⃣ Generar APK de Release Localmente

```bash
# Con keystore en ~/.uru/release.keystore
export KEYSTORE_PATH=~/.uru/release.keystore
export KEYSTORE_PASSWORD="tu_password_aqui"
export KEY_ALIAS="uru_release_key"
export KEY_PASSWORD="tu_key_password_aqui"

# Build release APK
cd android-clean-architecture
./gradlew assembleRelease

# APK generado en: build/outputs/apk/release/android-clean-architecture-release.apk
```

---

## 5️⃣ Validar Firma del APK

```bash
# Verificar que el APK esté firmado correctamente
jarsigner -verify -verbose -certs build/outputs/apk/release/android-clean-architecture-release.apk

# Salida esperada:
# jar verified. This jar contains entries whose certificate chain is not validated.
# [Certificado con alias uru_release_key]
```

---

## 6️⃣ Google Play Store

### Paso 1: Crear Certificado SHA1 para Firebase

```bash
keytool -list -v -keystore ~/.uru/release.keystore | grep SHA1
```

Ejemplo de salida:
```
SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

### Paso 2: Subir a Google Play Console

1. Ir a **Release Management → App signing**
2. Subir `android-clean-architecture-release.apk`
3. Google Play asignará automáticamente un certificado de distribución

### Paso 3: Primera release

```bash
# bundletool (descargar desde Google)
bundletool build-apks \
  --bundle=build/outputs/bundle/release/app.aab \
  --output=app.apks \
  --ks=~/.uru/release.keystore \
  --ks-pass=pass:$KEYSTORE_PASSWORD \
  --ks-key-alias=$KEY_ALIAS \
  --key-pass=pass:$KEY_PASSWORD
```

---

## ⚠️ Seguridad: Mejores Prácticas

| Hazlo ✅ | No lo hagas ❌ |
|---------|----------------|
| Guarda keystore en `~/.uru/` con `chmod 600` | Commitar keystore a Git |
| Usa env vars en CI/CD | Hardcodear passwords en código |
| Rota el keystore cada 3-5 años | Compartir keystore por Slack/Email |
| Documenta la contraseña en 1Password | Guardar en notes.txt |
| Usa GitHub Secrets para CI/CD | Usar fallback 'test-key' |

---

## 📋 Checklist de Deployment

- [ ] Keystore generado con `keytool`
- [ ] Keystore almacenado en `~/.uru/` con permisos 600
- [ ] GitHub Secrets configurados (KEYSTORE_B64, PASSWORD, ALIAS)
- [ ] Release APK generado y verificado con `jarsigner`
- [ ] APK probado en dispositivo físico
- [ ] SHA1 registrado en Firebase Console
- [ ] APK subido a Google Play Console
- [ ] Primera release publicada

---

## 🔗 Referencias

- [Android Key and Certificate Attestation](https://developer.android.com/training/articles/security-key-attestation)
- [Google Play - App signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [KeyTool Documentation](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/keytool.html)

