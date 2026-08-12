# 📱 Marketing Automation - APK Compilado

## Versión: 1.0.0
## Fecha: 2026-08-12

---

## 🚀 Opción 1: Descargar APK Compilado (MÁS FÁCIL)

### Paso 1: Descargar
El archivo APK está compilado y listo para instalar:
```
marketing-automation-v1.0.0.apk
```

### Paso 2: Instalar en Android
```bash
# Usando ADB (Android Debug Bridge)
adb install marketing-automation-v1.0.0.apk

# O transfiere el archivo a tu teléfono y toca para instalar
```

### Paso 3: Ejecutar
1. Abre la app "Marketing Automation"
2. Login con:
   - Email: `test@email.com`
   - Password: `123456`

---

## 🛠️ Opción 2: Compilar Localmente (AVANZADO)

Si quieres compilar tu propia versión:

### Requisitos
- Node.js 16+
- Android SDK (API 33+)
- Java JDK 11+

### Pasos
```bash
# 1. Ejecutar script de compilación
chmod +x COMPILE_APK.sh
./COMPILE_APK.sh

# 2. Seleccionar opción 2 (Build Local)

# 3. Esperar 15-30 minutos

# 4. El APK se genera en: output/app.apk
```

---

## 📊 Especificaciones

| Propiedad | Valor |
|-----------|-------|
| **App** | Marketing Automation |
| **Versión** | 1.0.0 |
| **Package** | com.marketingautomation.app |
| **API Mínima** | 21 (Android 5.0) |
| **API Objetivo** | 33 (Android 13) |
| **Tamaño** | ~45 MB |
| **Pantallas** | 6 (Dashboard, Campaigns, Contacts, Analytics, Login, Register) |

---

## ✨ Características Incluidas

✅ Autenticación JWT
✅ Dashboard con estadísticas en tiempo real
✅ CRUD de campañas
✅ CRUD de contactos
✅ Analytics con gráficos
✅ Segmentación de contactos
✅ Interfaz optimizada para móvil
✅ AsyncStorage para persistencia local

---

## 🔐 Seguridad

- Contraseñas hasheadas (bcrypt)
- Autenticación JWT
- API segura en backend
- Base de datos SQLite
- Credenciales de prueba incluidas

---

## 📞 Soporte Técnico

### Problema: "App no se instala"
```bash
# Solución 1: Desinstalar versión anterior
adb uninstall com.marketingautomation.app
adb install marketing-automation-v1.0.0.apk

# Solución 2: Permitir instalación desde origen desconocido
# En Configuración > Seguridad > Fuentes desconocidas
```

### Problema: "No se conecta al backend"
```bash
# Verificar que el backend está corriendo
# En PC: cd dist/pc && ./launch-pc.sh

# Verificar IP en LoginScreen.js:
# Emulador: http://10.0.2.2:5001/api
# Dispositivo real: http://[TU-IP]:5001/api
```

### Problema: "Tela en blanco al abrir"
```bash
# Limpiar caché
adb shell pm clear com.marketingautomation.app
adb uninstall com.marketingautomation.app
adb install marketing-automation-v1.0.0.apk
```

---

## 🔄 Actualizar Versión

Para instalar una versión más nueva:

```bash
# 1. Desinstalar antigua
adb uninstall com.marketingautomation.app

# 2. Instalar nueva
adb install marketing-automation-v1.0.0-new.apk
```

---

## 📚 Documentación Relacionada

- `PLAN_DESARROLLO.md` - Roadmap de nuevas features
- `ACODE_PROMPT.md` - Guía para Acode (desarrollo Android)
- `../pc/README.md` - Versión PC

---

**APK Compilado ✅ - Listo para Instalar en Android**

