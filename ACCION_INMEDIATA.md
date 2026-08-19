# 🎯 URU - ACCIÓN INMEDIATA (AHORA)

**Tiempo total:** 60 minutos  
**Pasos:** 5 simples y directos  
**Resultado:** APK probado en Realme + Web validado

---

## ⏱️ PASO 1: GitHub Setup (5 MINUTOS)

### 1.1 Agregar GEMINI_API_KEY

1. Ve a: https://github.com/sauljtm33xD/termux-app/settings/secrets/actions
2. Click: **"New repository secret"**
3. Name: `GEMINI_API_KEY`
4. Value: **Tu API key de Google Gemini** (la que tienes en tu .env local)
5. Click: **"Add secret"**

**✅ Hecho cuando:** Aparezca en la lista de secrets

### 1.2 Habilitar GitHub Pages

1. Ve a: https://github.com/sauljtm33xD/termux-app/settings/pages
2. En **"Source"**: Selecciona **"Deploy from a branch"**
3. Rama: **`gh-pages`** (se crea automáticamente)
4. Click: **Save**

**✅ Hecho cuando:** Diga "Your site is live at https://sauljtm33xd.github.io/termux-app/"

### 1.3 Esperar workflows (2 MINUTOS)

1. Ve a: https://github.com/sauljtm33xD/termux-app/actions
2. Busca: "Deploy URU Web App" o "CI - Build & Test"
3. Espera que cambien a ✅ verde (máximo 3 minutos)

**✅ Hecho cuando:** Veas ✅ en la última ejecución

---

## 💻 PASO 2: Compilar APK (15 MINUTOS)

### 2.1 En tu Windows, abre PowerShell

```powershell
cd uru-android/android-clean-architecture
```

### 2.2 Compila Debug APK

```powershell
.\gradlew.bat clean assembleDebug
```

**⏳ Espera 10-15 minutos** (primera vez descarga dependencias)

### 2.3 Verifica que compiló

```powershell
ls build/outputs/apk/debug/app-debug.apk
```

**✅ Hecho cuando:** Veas algo como `app-debug.apk` (debe ser 15-25 MB)

---

## 📱 PASO 3: Instalar en Realme (10 MINUTOS)

### 3.1 Conecta Realme por USB

1. Conecta tu Realme a la PC por USB
2. En el Realme: Habilita "Transferencia de archivos" (USB settings)
3. En Windows, abre PowerShell:

```powershell
adb devices
```

**✅ Debe mostrar:**
```
device001       device
```

### 3.2 Instala APK

```powershell
adb install -r build/outputs/apk/debug/app-debug.apk
```

**✅ Hecho cuando:** Veas `Success`

### 3.3 Inicia app

```powershell
adb shell am start -n com.uru/.presentation.MainActivity
```

**✅ App debe aparecer en Realme en 2-3 segundos**

---

## 🧪 PASO 4: Pruebas en Dispositivo (20 MINUTOS)

### 4.1 Abre la app en Realme

- La app debe mostrar el Orbe URU (círculo con gradiente)
- UI debe estar en tema oscuro
- Debe haber un chat input al fondo

### 4.2 Envía tu primer mensaje

1. Click en el input field (donde dice "Type message...")
2. Escribe: **"Hola URU, ¿quién eres?"**
3. Click Send (flecha)
4. **ESPERA max 5 segundos**

**✅ ÉXITO si:**
- Mensaje aparece en el chat
- Respuesta llega de Gemini (no es "Please configure API key")
- La respuesta tiene sentido (no es error)

### 4.3 Pruebas adicionales

Envía estos 2-3 mensajes más:
```
1. "¿Cuál es tu arquitectura?"
2. "Cuéntame de tus 9 motores"
3. "¿Eres autónomo?"
```

**✅ ÉXITO si:** Todas las respuestas llegan en <5 seg

### 4.4 Verifica logs (opcional)

```powershell
adb logcat | grep "URU\|ERROR"
```

**✅ Esperado:** Logs limpios sin exceptions críticas

---

## 🌐 PASO 5: Validar Web (10 MINUTOS)

### 5.1 Abre en navegador Realme

1. En el Realme, abre Chrome
2. Ve a: **https://sauljtm33xd.github.io/termux-app/**
3. **Espera carga** (3-5 segundos)

**✅ Debe verse IDÉNTICO al APK:** Mismo Orbe, mismo chat

### 5.2 Envía mensaje en web

1. Click en input
2. Escribe: **"Hola desde web"**
3. Send
4. **Espera <5 segundos**

**✅ ÉXITO si:** Respuesta llega de Gemini

### 5.3 Compara Android vs Web

- [ ] UI idéntica en ambos
- [ ] Respuestas son idénticas (mismo contexto)
- [ ] Ambas usan Gemini API
- [ ] Velocidad similar (<5 seg)

---

## ✅ RESULTADO FINAL

Si TODOS estos puntos son ✅:

```
✅ APK compila sin errores
✅ APK instala en Realme
✅ App inicia sin crashes
✅ Mensajes → Respuestas Gemini (<5 seg)
✅ Web funciona en GitHub Pages
✅ Web responde a mensajes
✅ UI idéntica en Android + Web
```

**= URU VALIDADO. READY FOR PRODUCTION.**

---

## 🆘 SI ALGO FALLA

### APK no compila

```powershell
# Limpia caché
rm -r $env:USERPROFILE\.gradle\caches

# Re-intenta
.\gradlew.bat clean assembleDebug --debug
```

### APK instala pero app no inicia

```powershell
# Ver logs de error
adb logcat > error.log

# Busca "Exception" en error.log
cat error.log | grep "Exception"
```

### Gemini no responde (error de API key)

```
Solución: Verifica que GEMINI_API_KEY está en GitHub Secrets
          (Settings → Secrets → GEMINI_API_KEY)
```

### Web no carga

```
Solución: Espera 2-3 minutos más (GitHub Pages tarda en propagarse)
          O abre en incógnito (limpia caché)
```

---

## 📊 CHECKLIST FINAL

```
PASO 1: GitHub Setup
  [ ] GEMINI_API_KEY agregado
  [ ] GitHub Pages habilitado
  [ ] Workflows en verde ✅

PASO 2: APK Build
  [ ] Compilación exitosa
  [ ] APK 15-25 MB
  [ ] APK en build/outputs/

PASO 3: Instalación
  [ ] ADB reconoce Realme
  [ ] APK instalado ("Success")
  [ ] App inicia (ves Orbe)

PASO 4: Device Testing
  [ ] Mensaje → Respuesta (<5 seg)
  [ ] Múltiples mensajes OK
  [ ] Sin crashes
  [ ] Logs limpios

PASO 5: Web Testing
  [ ] Web carga
  [ ] Web responde a mensajes
  [ ] UI idéntica Android
  [ ] Gemini en ambos
```

---

## 🎉 CUANDO TERMINES

1. Comparte screenshot del chat funcionando
2. Comparte tiempo de respuesta promedio
3. Reporta cualquier bug en GitHub Issues
4. Sugiere mejoras

---

**¡VAMOS! Tienes TODO listo. Solo ACCIÓN.**

**Tiempo estimado: 60 minutos**  
**Comienzo: AHORA**  
**Fin esperado: HOY**

