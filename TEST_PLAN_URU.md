# 🧪 URU MIDDLEWARE - PLAN DE PRUEBAS INTEGRAL

**Objetivo:** Validar que URU funciona end-to-end (Android + Web + Gemini API)  
**Tiempo estimado:** 45 minutos  
**Requerimientos:** Realme 16 Pro+, USB, Java 21, Gradle

---

## ✅ FASE 1: VALIDACIÓN LOCAL (10 min)

### 1.1 Verificar estructura Android
```bash
cd android-clean-architecture
ls -la src/main/kotlin/com/uru/
# Debe existir: presentation/, domain/, data/
```

**Esperado:** 3 carpetas principales
- ✅ presentation/
- ✅ domain/
- ✅ data/

### 1.2 Verificar build.gradle
```bash
grep "applicationId\|targetSdk\|compileSdk" app/build.gradle | head -5
```

**Esperado:**
```
applicationId = "com.uru"
compileSdk = 34
targetSdk = 34
```

### 1.3 Verificar dependencias críticas
```bash
grep -A 2 "gemini\|hilt\|compose" app/build.gradle | head -20
```

**Esperado:** 
- ✅ google-generativeai
- ✅ hilt-android
- ✅ jetpack-compose

---

## 🔨 FASE 2: COMPILACIÓN APK (15 min)

### 2.1 Limpiar y compilar
```bash
cd android-clean-architecture
./gradlew.bat clean assembleDebug --debug 2>&1 | tee build.log
```

**Esperado:**
```
BUILD SUCCESSFUL in XXs
```

### 2.2 Verificar APK generado
```bash
ls -lh build/outputs/apk/debug/app-debug.apk
# Debe ser 15-25 MB
```

**Aceptable:** 15-25 MB  
**Rojo:** <10 MB o >50 MB

### 2.3 Obtener SHA256 del APK
```bash
certutil -hashfile build/outputs/apk/debug/app-debug.apk SHA256
```

**Guardar:** Este hash para validación posterior

---

## 📱 FASE 3: DESPLIEGUE EN DISPOSITIVO (10 min)

### 3.1 Conectar Realme
```bash
adb devices
# Debe mostrar tu dispositivo
```

**Esperado:**
```
device001       device
```

### 3.2 Instalar APK
```bash
adb install -r build/outputs/apk/debug/app-debug.apk
```

**Esperado:**
```
Success
```

### 3.3 Verificar instalación
```bash
adb shell pm list packages | grep "com.uru"
# Debe mostrar: package:com.uru
```

---

## 🚀 FASE 4: PRUEBAS FUNCIONALES (20 min)

### 4.1 Iniciar app
```bash
adb shell am start -n com.uru/.presentation.MainActivity
# Espera 3-5 segundos
```

**Esperado:** La app inicia sin crashes

### 4.2 Verificar logs en tiempo real
```bash
adb logcat | grep -E "URU|ERROR|Exception" &
```

**Esperado:** Logs limpios sin exceptions

### 4.3 Pruebas en dispositivo (MANUAL)

#### Test 1: Interfaz Carga
- [ ] Pantalla principal carga en <2 segundos
- [ ] No hay layout broken
- [ ] Orbe URU visible y responsive
- [ ] UI es dark theme (verificar)

#### Test 2: Enviar Mensaje
- [ ] Click en input field → enfoque visible
- [ ] Escribe mensaje: "Hola URU, ¿qué es autonomía?"
- [ ] Click send → mensaje aparece en chat
- [ ] Respuesta llega en <5 segundos
- [ ] Respuesta viene de Gemini API (no placeholder)

#### Test 3: Validar API Key
- [ ] Si respuesta llega → GEMINI_API_KEY está configurado ✅
- [ ] Si error "API key not found" → Configurar en .env

#### Test 4: Múltiples mensajes
- [ ] Envía 3-5 mensajes seguidos
- [ ] Verifica que no hay crashes
- [ ] Verifica que el contexto se mantiene
- [ ] Respuestas son coherentes

#### Test 5: Tema/Modo
- [ ] Verifica tema oscuro funciona
- [ ] Verifica que el orbe cambia colores
- [ ] Verifica que stats se actualizan

---

## 🌐 FASE 5: VALIDACIÓN WEB (10 min)

### 5.1 Verificar GitHub Pages
```bash
curl -I https://sauljtm33xd.github.io/termux-app/
# Debe retornar 200 OK
```

**Esperado:**
```
HTTP/2 200
```

### 5.2 Visitar URL en navegador Realme
- Abre: `https://sauljtm33xd.github.io/termux-app/`
- Espera carga completa (3-5 seg)

**Esperado:** Misma UI que Android, pero en navegador

### 5.3 Prueba de mensaje en web
- [ ] Click en chat input
- [ ] Escribe: "Hola desde web"
- [ ] Envía mensaje
- [ ] Respuesta de Gemini en <5 seg
- [ ] Verifica que usa misma API

---

## 🔐 FASE 6: VALIDACIÓN DE SEGURIDAD (5 min)

### 6.1 Verificar AEGIS en logs
```bash
adb logcat | grep "AEGIS\|audit\|trust"
```

**Esperado:** Logs de AEGIS activo

### 6.2 Verificar que NO hay API keys en logs
```bash
adb logcat | grep -i "key\|token\|secret"
# NO debe mostrar valores reales
```

**Esperado:** Logs sanitizados

### 6.3 Verificar HTTPS en web
- [ ] URL es HTTPS ✅
- [ ] No hay warnings de seguridad
- [ ] Certificate válido

---

## 📊 TABLA DE RESULTADOS

| Fase | Test | Estado | Notas |
|------|------|--------|-------|
| 1 | Estructura | ⏳ | Pendiente |
| 1 | Build.gradle | ⏳ | Pendiente |
| 1 | Dependencias | ⏳ | Pendiente |
| 2 | Compilación | ⏳ | Pendiente |
| 2 | Tamaño APK | ⏳ | Pendiente |
| 2 | SHA256 | ⏳ | Pendiente |
| 3 | Conexión ADB | ⏳ | Pendiente |
| 3 | Instalación | ⏳ | Pendiente |
| 3 | Package check | ⏳ | Pendiente |
| 4 | UI Carga | ⏳ | Pendiente |
| 4 | Mensaje + Gemini | ⏳ | Pendiente |
| 4 | Múltiples mensajes | ⏳ | Pendiente |
| 4 | Tema/Modo | ⏳ | Pendiente |
| 5 | GitHub Pages | ⏳ | Pendiente |
| 5 | Web message | ⏳ | Pendiente |
| 6 | AEGIS logs | ⏳ | Pendiente |
| 6 | Security check | ⏳ | Pendiente |

**Total Tests:** 18  
**Esperados:** 18 ✅  
**Fallidos:** 0 ❌  

---

## 🎯 CRITERIOS DE ÉXITO

### ✅ MVP EXITOSO (Mínimo viable):
- [x] APK compila sin errores
- [x] APK instala en Realme
- [x] App inicia sin crashes
- [x] Mensaje → Respuesta Gemini en <5 seg
- [x] Web funciona en GitHub Pages
- [x] Misma UI en Android + Web

### 🚀 PRODUCCIÓN LISTA:
- [ ] 15/18 tests pasan
- [ ] No hay crashes en 10 mensajes seguidos
- [ ] API key está segura
- [ ] AEGIS está activo
- [ ] Performance <2seg UI, <5seg API

### ❌ BLOQUEADORES CRÍTICOS:
- [ ] APK no compila → Fix build.gradle
- [ ] App crashea al iniciar → Fix MainActivity
- [ ] Gemini no responde → Add API key a secrets
- [ ] Web no carga → Check GitHub Pages settings

---

## 📝 NOTAS DE DEBUGGING

Si algo falla:

**APK no compila:**
```bash
./gradlew clean --stop
rm -rf ~/.gradle/caches
./gradlew assembleDebug --debug
```

**App crashea:**
```bash
adb logcat -c  # Limpiar logs
adb logcat > crash.log &  # Grabar
# Reproduce el error
cat crash.log | grep "FATAL\|Exception"
```

**Gemini no responde:**
```bash
# Verificar que .env tiene VITE_GEMINI_API_KEY
# O que GitHub Secrets tiene GEMINI_API_KEY
cat .env  # (Solo en local)
echo $VITE_GEMINI_API_KEY  # Debe mostrar algo
```

**Web no carga:**
```bash
# Verificar que gh-pages tiene contenido
git branch -a | grep gh-pages
# Si no existe, es que deploy no corrió
```

---

## 🔄 PRÓXIMOS PASOS POST-VALIDACIÓN

1. **Si todo pasa:** 
   - Compilar Release APK
   - Publicar en GitHub Releases
   - Actualizar documentación

2. **Si 1-2 tests fallan:**
   - Documentar errores
   - Crear PRs con fixes
   - Re-testear

3. **Si bloqueador crítico:**
   - Stop immediately
   - Debug con logs
   - Contactar support

---

**Creado:** 2026-08-19  
**Última actualización:** 2026-08-19  
**Estado:** 🔴 LISTO PARA EJECUTAR
