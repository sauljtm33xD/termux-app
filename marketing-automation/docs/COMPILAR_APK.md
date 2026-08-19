# 📦 Compilar APK para Android

Guía paso a paso para crear tu APK listo para Google Play Store.

---

## Requisitos Previos

✅ Node.js 14+ instalado
✅ npm instalado
✅ Expo CLI instalado
✅ Cuenta en EAS (gratuita)

---

## Paso 1: Preparar el Proyecto

```bash
cd marketing-automation/mobile

# Instalar Expo CLI
npm install -g eas-cli

# Instalar dependencias
npm install
```

---

## Paso 2: Configurar EAS (Primera vez)

```bash
# Crear cuenta EAS (sigue las instrucciones)
eas login
```

---

## Paso 3: Compilar APK

### Opción A: Compilación Local (Recomendado)

```bash
eas build --platform android --local
```

**Ventajas:**
- ✅ Más rápido (~10-15 minutos)
- ✅ No requiere esperar en servidores
- ✅ Mejor control

**Requisitos:**
- Instalar Android SDK localmente
- Instalar Java JDK 11+

### Opción B: Compilación en Servidor EAS

```bash
eas build --platform android
```

**Ventajas:**
- ✅ No requiere Android SDK local
- ✅ Más fácil si no tienes el SDK

**Desventaja:**
- ⏱️ Esperar ~20-30 minutos

---

## Paso 4: Descarga el APK

Después de compilar:

```bash
# Ver tus builds
eas build:list

# Descargar APK
eas build:download [build-id]
```

El APK estará en tu carpeta de descargas.

---

## Paso 5: Instalar en tu Teléfono

### Desde Computadora
```bash
# Conectar teléfono por USB
adb install marketing-automation-v1.0.0.apk
```

### Directamente desde Teléfono
1. Descarga el APK
2. Abre el archivo en tu teléfono
3. Toca "Instalar"
4. ¡Listo!

---

## Paso 6: Publicar en Google Play Store

### A. Preparar Cuentas

1. **Crear cuenta desarrollador Google Play** ($25 de pago único)
2. **Crear keystore (firma)**

```bash
keytool -genkey -v -keystore marketing-automation.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias marketing_key
```

### B. Configurar en eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "image": "latest"
      }
    }
  }
}
```

### C. Subir a Google Play

1. Abre Google Play Console
2. Crear nueva aplicación
3. Llenar información:
   - Nombre: Marketing Automation
   - Descripción
   - Screenshots
   - Categoría: Business
4. Subir APK
5. Completar formulario de contenido
6. Enviar para revisión

---

## 📋 Información para Google Play

### Datos Necesarios

**Nombre de la App**
```
Marketing Automation
```

**Descripción Corta (80 caracteres)**
```
Sistema completo de automatización de marketing para múltiples plataformas
```

**Descripción Completa**
```
Marketing Automation es tu solución completa para:

✅ Gestionar campañas en Facebook, WhatsApp, TikTok e Instagram
✅ Mantener base de datos segura de contactos
✅ Analizar métricas en tiempo real
✅ Programar envíos automáticos
✅ Segmentar audiencias

Características:
• Dashboard intuitivo
• Analytics completo
• Múltiples plataformas
• Base de datos segura
• Segmentación inteligente
• Reportes en tiempo real

¡Automatiza tu marketing hoy!
```

**Categoría**
```
Business
```

**Contenido**
```
Sin restricción de edad
```

---

## 🔐 Seguridad del Keystore

⚠️ **IMPORTANTE**: Guarda tu keystore en lugar seguro

```bash
# Guardar keystore
mv marketing-automation.keystore ~/.android/

# Nunca subas a Git:
echo "marketing-automation.keystore" >> .gitignore
```

---

## 🚀 Versiones y Updates

Para actualizar la app:

1. Cambiar versionCode en app.json
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

2. Compilar de nuevo
```bash
eas build --platform android
```

3. Subir nuevo APK a Google Play

---

## 📊 Monitoreo Post-Lanzamiento

Después de publicar:

1. **Google Play Console** → Analytics
2. Ver:
   - Descargas
   - Instalaciones
   - Usuarios activos
   - Crashes
   - Ratings

3. **Responder a reseñas**

---

## 🆘 Troubleshooting

### Build falló
```bash
# Limpiar caché
eas build:list --platform android
eas build:cancel [build-id]

# Reintentar
eas build --platform android --clear-cache
```

### APK muy grande
```bash
# Optimizar tamaño
# En package.json, reducir dependencias innecesarias
npm prune --production
```

### Permisos faltantes
Verificar `app.json` para `expo.android.permissions`

---

## 📝 Checklist Pre-Lanzamiento

- [ ] APK compilado y probado localmente
- [ ] Versión incrementada en app.json
- [ ] Descripción en español completa
- [ ] Screenshots de la app (mínimo 2)
- [ ] Icono de app en 512x512px
- [ ] Privacy Policy creada
- [ ] Términos de servicio
- [ ] Keystore guardado de forma segura
- [ ] Build ID anotado

---

## 📞 Soporte

Para problemas:
- Revisar logs: `eas build:logs [build-id]`
- Documentación Expo: https://docs.expo.dev
- Google Play Help: https://play.google.com/console/support

---

**¡Tu app está lista para el mundo! 🌍**
