# 📦 Guía Completa de Build - PC & Android

Instrucciones paso a paso para compilar las 2 versiones de tu sistema.

---

## 🎯 Resumen Rápido

| Versión | Archivo | Tiempo | Requisitos |
|---------|---------|--------|-----------|
| **PC** | `build-pc.sh` | ~5 min | Python 3, Node.js |
| **Android APK** | `build-apk.sh` | 15-30 min | Node.js, Android SDK (opt) |

---

## 💻 OPCIÓN 1: Compilar Versión PC

### Requisitos Previos

✅ Python 3.8+
✅ Node.js 14+
✅ npm

### Paso 1: Ejecutar Build

```bash
cd marketing-automation
chmod +x build-pc.sh
./build-pc.sh
```

**Qué hace:**
- Instala dependencias Python
- Compila React a archivos estáticos
- Crea launcher automático
- Genera carpeta `dist/pc/`

### Paso 2: Ejecutar Aplicación

**Linux/Mac:**
```bash
cd dist/pc
./launch-pc.sh
```

**Windows:**
```bash
cd dist/pc
launch-pc.bat
```

### Paso 3: Usar la Aplicación

- **Web**: http://localhost:3000
- **Backend**: http://localhost:5001
- **Email**: test@email.com
- **Password**: 123456

### Paso 4: Empaquetar para Distribuir

```bash
cd dist
zip -r marketing-automation-pc.zip pc/
# Archivo: marketing-automation-pc.zip (~150MB)
```

---

## 📱 OPCIÓN 2: Compilar APK para Android

### Requisitos Previos

✅ Node.js 14+
✅ npm
✅ Expo CLI (se instala automáticamente)

**Opcional para compilación local:**
- Android Studio
- Android SDK
- Java JDK 11+

### Paso 1: Ejecutar Build

```bash
cd marketing-automation
chmod +x build-apk.sh
./build-apk.sh
```

### Paso 2: Seleccionar Método

El script te preguntará:

**Opción 1: Compilación Local** (Recomendado)
```
Requisitos:
- Android SDK instalado
- Java JDK 11+
- ANDROID_HOME configurado

Ventajas:
✅ Más rápido (~15 min)
✅ Control completo
```

**Opción 2: Compilación en Servidor EAS**
```
Requisitos:
- Cuenta Expo (gratuita)

Ventajas:
✅ Sin requisitos locales
✅ Construcción en la nube
```

### Paso 3: Compilación Local (Si elegiste opción 1)

```bash
# Android SDK debe estar instalado
# Verificar que ANDROID_HOME está configurado
echo $ANDROID_HOME

# Ejecutar compilación
eas build --platform android --local
```

**Tiempo:** ~15 minutos
**Resultado:** APK descargado automáticamente

### Paso 4: Compilación en Servidor (Si elegiste opción 2)

```bash
# Inicia sesión en Expo
eas login
# o eas register

# Compilar
eas build --platform android

# Monitorear progreso
eas build:list

# Descargar cuando esté listo
eas build:download <build-id>
```

**Tiempo:** 20-30 minutos
**Resultado:** APK listo en tu carpeta de descargas

### Paso 5: Instalar en Teléfono

**Opción A: Por USB**
```bash
adb install marketing-automation-v1.0.0.apk
```

**Opción B: Directamente**
1. Descarga el APK a tu teléfono
2. Toca el archivo
3. Toca "Instalar"
4. ¡Listo!

### Paso 6: Configurar Conexión

⚠️ **IMPORTANTE**: Cambiar URL del API

En `mobile/src/screens/LoginScreen.js`:

**Para emulador:**
```javascript
const API_URL = 'http://10.0.2.2:5001/api';
```

**Para dispositivo real:**
```javascript
const API_URL = 'http://192.168.1.100:5001/api';
// Reemplaza con tu IP local
```

Luego recompila el APK.

### Paso 7: Publicar en Google Play Store (Opcional)

Ver: `docs/COMPILAR_APK.md` para guía completa

---

## 🔧 Scripts Disponibles

### `build-all.sh`
Prepara todo sin compilar

```bash
./build-all.sh
```

**Resultado:**
- Backend listo
- Web compilada
- Mobile preparado

### `build-pc.sh`
Compila versión para PC

```bash
./build-pc.sh
```

**Resultado:**
- Carpeta `dist/pc/` con launcher

### `build-apk.sh`
Compila APK para Android

```bash
./build-apk.sh
```

**Resultado:**
- APK descargado

### `run-local.sh`
Ejecuta todo localmente para desarrollo

```bash
./run-local.sh
```

**Abre 3 terminales:**
1. Backend: `cd backend && source venv/bin/activate && python app.py`
2. Web: `cd web && npm start`
3. Monitoreo (esta terminal)

---

## 📊 Comparativa de Métodos

### Para PC

| Método | Tiempo | Requisitos | Portabilidad |
|--------|--------|-----------|--------------|
| **Script build-pc.sh** | 5 min | Python, Node | ⭐⭐⭐⭐⭐ |
| **Docker** | 10 min | Docker | ⭐⭐⭐⭐⭐ |
| **Ejecutable** | 20 min | PyInstaller | ⭐⭐⭐ |

### Para Android

| Método | Tiempo | Requisitos | Mantenimiento |
|--------|--------|-----------|---------------|
| **Local (EAS)** | 15 min | Android SDK | ⭐⭐⭐⭐ |
| **Servidor (EAS)** | 30 min | Cuenta Expo | ⭐⭐⭐⭐⭐ |
| **Android Studio** | 45 min | AS + JDK | ⭐⭐ |

---

## 🆘 Troubleshooting

### "Python no encontrado"
```bash
# Instalar Python
# https://www.python.org/downloads

# Verificar
python3 --version
```

### "Node.js no encontrado"
```bash
# Instalar Node.js
# https://nodejs.org

# Verificar
node --version
npm --version
```

### "Android SDK no configurado"
```bash
# Instalar Android Studio
# https://developer.android.com/studio

# Configurar variable
export ANDROID_HOME=$HOME/Android/Sdk

# Agregar a ~/.bashrc o ~/.zshrc permanentemente
echo "export ANDROID_HOME=$HOME/Android/Sdk" >> ~/.bashrc
source ~/.bashrc
```

### "APK compilation failed"
```bash
# Limpiar caché
cd mobile
rm -rf .expo
npm cache clean --force
npm install

# Reintentar
eas build --platform android --clear-cache
```

### "Web no carga en localhost:3000"
```bash
# Verificar que port no está en uso
lsof -i :3000

# O usar otro puerto
cd dist/pc/web
serve -s build -l 8000
```

---

## 📋 Checklist de Build

### PC
- [ ] Python 3 instalado
- [ ] Node.js instalado
- [ ] `./build-pc.sh` ejecutado sin errores
- [ ] Carpeta `dist/pc/` creada
- [ ] `launch-pc.sh` o `launch-pc.bat` funciona
- [ ] Backend inicia en puerto 5001
- [ ] Web carga en puerto 3000
- [ ] Login funciona

### Android APK
- [ ] Node.js instalado
- [ ] `./build-apk.sh` ejecutado
- [ ] Metodo de compilación seleccionado
- [ ] APK descargado
- [ ] APK instalado en teléfono
- [ ] App abre correctamente
- [ ] Login funciona
- [ ] Conexión al backend OK

---

## 🚀 Distribución

### PC

**Opción 1: ZIP**
```bash
cd dist
zip -r marketing-automation-pc.zip pc/
```

**Opción 2: Instalador (Avanzado)**
- Usar NSIS o Inno Setup
- Empaquetar con PyInstaller
- Ver: `docs/COMPILAR_APK.md`

**Archivo:** `marketing-automation-pc.zip` (~150MB)

### Android

**Opción 1: Distribuir APK**
```bash
# Compartir APK directamente
marketing-automation-v1.0.0.apk (~50MB)
```

**Opción 2: Google Play Store**
```
Pasos en docs/COMPILAR_APK.md
```

**Opción 3: Beta Testing**
```bash
# Con EAS
eas submit --platform android
```

---

## 📱 Versiones Finales

Después de compilar tendrás:

```
dist/
├── pc/
│   ├── backend/          # Python + venv
│   ├── web/build/        # Archivos compilados React
│   ├── launch-pc.sh      # Script ejecutable
│   └── launch-pc.bat     # Script Windows
│
└── mobile/
    └── marketing-automation-v1.0.0.apk
```

---

## ✅ Verificación Final

### PC
```bash
cd dist/pc
./launch-pc.sh    # Mac/Linux
# o
launch-pc.bat     # Windows

# Verificar
curl http://localhost:5001/api/health
```

### Android
```bash
adb install marketing-automation-v1.0.0.apk
adb shell am start -n com.marketingautomation.app/.MainActivity
```

---

## 🎉 ¡Listo!

Ya tienes tus 2 versiones compiladas y listas para:

✅ **PC**: Ejecutable localmente o distribuible
✅ **Android**: APK para instalar en teléfonos

**Próximos pasos:**
1. Prueba ambas versiones
2. Configura APIs externas (opcional)
3. Personaliza según tus necesidades
4. ¡Lanza tu marketing automation! 🚀

---

## 📞 Soporte

Para problemas:
- Revisar logs en `backend.log` o `web.log`
- Verificar puertos 5001 y 3000
- Chequear permisos de firewall
- Consultar `docs/SETUP_RAPIDO.md`

---

**¡Ahora tienes todo compilado y listo! 🎉**
