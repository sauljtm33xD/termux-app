# 🚀 Marketing Automation System

Sistema completo de automatización de marketing con versión web para PC y app móvil Android.

## 📱 Versiones Disponibles

- **Backend**: API REST con Flask
- **Web**: Dashboard interactivo con React (PC/Laptop)
- **Mobile**: App nativa Android con React Native + Expo (APK)

## ✨ Características

### Gestión de Campañas
- ✅ Crear, editar y eliminar campañas
- ✅ Múltiples plataformas (Facebook, WhatsApp, TikTok, Instagram)
- ✅ Cambio de estado (draft, active, paused, completed)
- ✅ Programación de envíos

### Gestión de Contactos
- ✅ Base de datos de contactos
- ✅ Segmentación (general, VIP, nuevo, inactivo)
- ✅ Importación de contactos
- ✅ Información de email y teléfono

### Analytics
- ✅ Métricas en tiempo real
- ✅ Impresiones, clicks, conversiones
- ✅ CTR (Click-Through Rate)
- ✅ Gráficos interactivos
- ✅ Reportes por plataforma

### Seguridad
- ✅ Autenticación JWT
- ✅ Registro y login seguros
- ✅ Datos aislados por usuario

---

## 🚀 Quick Start

### 1. BACKEND (API Flask)

```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python app.py
```

El servidor estará disponible en: `http://localhost:5001`

### 2. WEB (React Dashboard)

```bash
cd web

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

Acceder a: `http://localhost:3000`

### 3. MOBILE (APK Android)

```bash
cd mobile

# Instalar dependencias
npm install

# Opción A: Ejecutar en Expo Go (desarrollo)
npm start

# Opción B: Compilar APK (producción)
eas build --platform android --local
```

---

## 📋 Requisitos

### Backend
- Python 3.8+
- Flask 2.3+
- SQLite3

### Web
- Node.js 14+
- npm o yarn

### Mobile
- Node.js 14+
- Expo CLI
- Android Studio (para emulador)
- Expo Go (app para probar)

---

## 🔑 API Endpoints

### Autenticación
```
POST /api/auth/register
POST /api/auth/login
```

### Campañas
```
GET    /api/campaigns
POST   /api/campaigns
PUT    /api/campaigns/<id>
DELETE /api/campaigns/<id>
```

### Contactos
```
GET    /api/contacts
POST   /api/contacts
```

### Metrics
```
GET  /api/metrics/<campaign_id>
POST /api/metrics/<campaign_id>
```

---

## 🎯 Estructura de Carpetas

```
marketing-automation/
├── backend/                 # API Flask
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
├── web/                     # React Dashboard (PC)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── App.jsx
├── mobile/                  # React Native (APK)
│   ├── package.json
│   ├── app.json
│   ├── App.js
│   └── src/screens/
└── docs/                    # Documentación
```

---

## 🔧 Configuración

### Backend (.env)
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///marketing.db
PORT=5001
```

### Mobile (app.json)
Editado automáticamente por Expo. Para cambiar:
- Nombre de app: `expo.name`
- Package ID: `expo.android.package`
- Versión: `expo.version`

---

## 📱 Compilar APK

### Opción 1: Localmente (Recomendado)
```bash
cd mobile
npm install -g eas-cli
eas build --platform android --local
```

### Opción 2: Con EAS Hosting
```bash
cd mobile
eas build --platform android
```

El APK estará listo en ~20 minutos.

---

## 🌐 URL de Conexión

Para conectar la app móvil con el backend:

**En DashboardScreen.js y otros archivos:**
```javascript
const API_URL = 'http://10.0.2.2:5001/api'; // Emulador
// const API_URL = 'http://192.168.x.x:5001/api'; // IP Real
```

---

## 📚 Ejemplos de Uso

### Crear Campaña
```javascript
POST /api/campaigns
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Black Friday 2024",
  "platform": "facebook"
}
```

### Agregar Contacto
```javascript
POST /api/contacts
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "+34612345678",
  "segment": "vip"
}
```

### Obtener Métricas
```javascript
GET /api/metrics/1
Authorization: Bearer {token}
```

---

## 🧪 Testing

### Backend
```bash
cd backend
python app.py
# El endpoint /api/health devuelve {"status": "ok"}
```

### Web
```bash
cd web
npm test
```

---

## 🐛 Troubleshooting

### El Backend no inicia
```bash
# Verificar Python
python --version

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar en debug
python app.py
```

### La app móvil no conecta
- Verificar que el backend está ejecutándose
- Confirmar que `API_URL` está correcta
- Para emulador: `http://10.0.2.2:5001`
- Para dispositivo real: usar IP de tu PC `http://192.168.x.x:5001`

### Errores de CORS
El backend tiene CORS habilitado para todas las rutas.

---

## 📦 Deploy en Producción

### Backend (Gunicorn)
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Web (Build Estático)
```bash
cd web
npm run build
# Los archivos están en build/
```

### Mobile (Google Play Store)
1. Compilar APK con eas build
2. Firmar APK
3. Subir a Google Play Store
4. Completar formulario de publicación

---

## 📝 Licencia

MIT License

---

## 🤝 Soporte

¿Preguntas o problemas?
- Revisar logs: `tail -f backend/marketing.db`
- Verificar endpoints: `curl http://localhost:5001/api/health`
- Consultar API_REFERENCE.md

---

## 🎯 Roadmap v1.1

- [ ] Notificaciones push
- [ ] Templates avanzados
- [ ] A/B testing
- [ ] Rate limiting
- [ ] Multi-idioma

---

**¡Listo para empezar!** 🚀
