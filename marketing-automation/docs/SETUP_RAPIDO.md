# ⚡ Setup Rápido (5 Minutos)

## Opción 1: Todo en Local (Recomendado para empezar)

### Terminal 1: Backend
```bash
cd marketing-automation/backend
pip install -r requirements.txt
python app.py
```
✅ Backend corriendo en `http://localhost:5001`

### Terminal 2: Web
```bash
cd marketing-automation/web
npm install
npm start
```
✅ Web abierta en `http://localhost:3000`

### Terminal 3: Mobile (Opcional)
```bash
cd marketing-automation/mobile
npm install
npm start
# Selecciona 'a' para Android o 'w' para web
```

---

## Paso 1: Registrarse

1. Abre `http://localhost:3000`
2. Haz clic en "Registrate aquí"
3. Completa:
   - Nombre: Tu nombre
   - Email: test@email.com
   - Contraseña: 123456
4. ¡Listo! Ya estás dentro

---

## Paso 2: Crear Primera Campaña

1. Ve a **Campañas**
2. Haz clic en **+ Nueva Campaña**
3. Completa:
   - Nombre: "Mi Primera Campaña"
   - Plataforma: Facebook
4. ¡Campaña creada!

---

## Paso 3: Agregar Contactos

1. Ve a **Contactos**
2. Haz clic en **+ Agregar Contacto**
3. Completa:
   - Nombre: Juan Pérez
   - Email: juan@email.com
   - Teléfono: +34612345678
   - Segmento: VIP
4. ¡Contacto agregado!

---

## Paso 4: Ver Analytics

1. Ve a **Analytics**
2. Verás gráficos de:
   - Impresiones
   - Clicks
   - Conversiones
   - CTR

---

## 📱 Para Android (APK)

### Opción A: Con Expo Go (Más rápido)
```bash
cd mobile
npm install
npm start
# Escanea el código QR con tu teléfono
```

### Opción B: Compilar APK Real
```bash
cd mobile
npm install -g eas-cli
eas build --platform android --local
```

---

## ✅ Checklist de Setup

- [ ] Backend corriendo en puerto 5001
- [ ] Web accesible en localhost:3000
- [ ] Puedes registrarte e iniciar sesión
- [ ] Crear una campaña
- [ ] Agregar un contacto
- [ ] Ver analytics
- [ ] (Opcional) Mobile con Expo Go

---

## 🆘 Si algo no funciona

### Backend no inicia
```bash
# Verificar Python
python --version

# Reinstalar dependencias
pip install --upgrade pip
pip install -r requirements.txt
```

### Web no abre
```bash
# Limpiar cache de npm
npm cache clean --force
cd web && npm install
npm start
```

### Mobile no conecta
- Editar `src/screens/LoginScreen.js`
- Cambiar `API_URL` a tu IP local:
```javascript
const API_URL = 'http://192.168.1.100:5001/api';
```

---

## 🎉 ¡Listo!

Ya tienes tu sistema de marketing automation funcionando localmente. Próximos pasos:

1. Explorar todas las funcionalidades
2. Crear más campañas y contactos
3. Ver las métricas en Analytics
4. Compilar APK para distribución

**¡Bienvenido al futuro del marketing! 🚀**
