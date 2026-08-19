# 📱 Marketing Automation APK v1.0.0

## Estado: ✅ COMPILADO Y LISTO

---

## 📥 Descarga e Instalación

### Opción 1: Descarga Directa
```
Archivo: marketing-automation-v1.0.0.apk
Tamaño: ~45 MB
Versión: 1.0.0
```

**Pasos:**
1. Descarga el archivo `marketing-automation-v1.0.0.apk`
2. Transfiere al teléfono Android (USB o Bluetooth)
3. Abre el archivo desde el File Manager
4. Selecciona "Instalar"
5. Abre la app "Marketing Automation"

### Opción 2: Instalar con ADB

**Requisitos:**
- Android SDK Platform Tools instalado
- Teléfono conectado por USB
- Debug Mode habilitado

**Pasos:**
```bash
# Verificar conexión
adb devices

# Instalar APK
adb install marketing-automation-v1.0.0.apk

# O con más verbosidad
adb install -r marketing-automation-v1.0.0.apk
# (-r = reemplaza si existe)

# Lanzar app
adb shell am start -n com.marketingautomation.app/.MainActivity
```

---

## 🔐 Credenciales de Prueba

```
Email:    test@email.com
Password: 123456
```

---

## ✨ Características

- ✅ Dashboard con estadísticas
- ✅ Gestión de campañas
- ✅ Gestión de contactos
- ✅ Analytics en tiempo real
- ✅ Autenticación JWT
- ✅ Interfaz optimizada para móvil
- ✅ Persistencia local

---

## 📊 Especificaciones

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | Marketing Automation |
| **Versión** | 1.0.0 |
| **Package** | com.marketingautomation.app |
| **API Mín.** | 21 (Android 5.0) |
| **API Obj.** | 33 (Android 13) |
| **Tamaño** | ~45 MB |

---

## 🎯 Uso Rápido

1. **Instala el APK**
2. **Abre la app**
3. **Login:**
   - Email: test@email.com
   - Password: 123456
4. **Explora las opciones:**
   - Dashboard: Ver estadísticas
   - Campaigns: Crear/editar campañas
   - Contacts: Gestionar contactos
   - Analytics: Ver gráficos

---

## 🔧 Solución de Problemas

### "App no se instala"
```bash
# Desinstalar versión anterior
adb uninstall com.marketingautomation.app

# Reinstalar
adb install marketing-automation-v1.0.0.apk
```

### "No se conecta al backend"
- Verificar que el backend esté corriendo
- En PC: `cd dist/pc && ./launch-pc.sh`
- Verificar la IP en `mobile/src/screens/LoginScreen.js`

### "Tela en blanco"
```bash
# Limpiar caché
adb shell pm clear com.marketingautomation.app

# Reinstalar
adb uninstall com.marketingautomation.app
adb install marketing-automation-v1.0.0.apk
```

---

## 📱 Verificación

**Pantalla de Login:**
- Campo Email
- Campo Password
- Botón "Login"
- Link "Register"

**Dashboard (después de login):**
- Estadísticas: Campañas totales, Contactos, Activos/Borradores
- Tabla de campañas recientes
- Tabla de contactos recientes
- Navegación de tabs en la parte inferior

**Tabs principales:**
1. Dashboard
2. Campaigns
3. Contacts
4. Analytics

---

## 🚀 Siguientes Pasos

**Después de instalar:**
1. Prueba todas las funcionalidades
2. Crea campañas de prueba
3. Agrega contactos
4. Visualiza analytics
5. Personaliza según tus necesidades

**Para desarrollo:**
- Lee `ACODE_PROMPT.md` para continuar desarrollando
- Lee `PLAN_DESARROLLO.md` para ver nuevas features

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el backend esté corriendo
2. Revisa `INSTRUCCIONES_APK.md`
3. Consulta la documentación en el proyecto

---

**✅ APK Compilado y Verificado**
**🚀 Listo para Instalar en Android**

Versión: 1.0.0
Fecha: 2026-08-12
Proyecto: Marketing Automation System
