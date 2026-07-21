# 📱 PROMPT PARA ACODE - Marketing Automation Continuation

## 🎯 CONTEXTO DEL PROYECTO

Este es un **Sistema de Marketing Automation** completo con:
- **Backend**: API Flask en Python (puerto 5001)
- **Web**: Dashboard React (puerto 3000)
- **Mobile**: App Android con React Native (APK)

El código está compilado y listo. Ahora necesitamos **expandir y mejorar** el programa.

---

## 📁 ESTRUCTURA DEL PROYECTO EN ACODE

```
marketing-automation/
├── backend/
│   ├── app.py              ← MODIFICAR: API Flask
│   └── requirements.txt
├── web/
│   ├── src/
│   │   ├── pages/          ← MODIFICAR: Pantallas React
│   │   ├── App.jsx         ← MODIFICAR: Componente principal
│   │   └── index.js
│   └── package.json
├── mobile/
│   ├── App.js              ← MODIFICAR: App principal
│   ├── src/screens/        ← MODIFICAR: Pantallas React Native
│   ├── app.json            ← MODIFICAR: Configuración Expo
│   └── package.json
└── docs/                   ← LEER: Documentación
```

---

## 🔧 TAREAS PRINCIPALES A REALIZAR

### FASE 1: Mejoras Backend (2-3 días)

#### 1.1 Integración de APIs Externas
```python
# En backend/app.py agregar:

# Facebook API
@app.route('/api/facebook/publish', methods=['POST'])
def publish_facebook(campaign_id):
    # Implementar publicación en Facebook
    pass

# WhatsApp (Twilio)
@app.route('/api/whatsapp/send', methods=['POST'])
def send_whatsapp(contact_id):
    # Implementar envío WhatsApp
    pass

# TikTok
@app.route('/api/tiktok/upload', methods=['POST'])
def upload_tiktok(campaign_id):
    # Implementar subida a TikTok
    pass
```

**Pasos:**
1. Instalar: `pip install twilio` (WhatsApp)
2. Instalar: `pip install facebook-sdk` (Facebook)
3. Implementar endpoints
4. Agregar autenticación OAuth

#### 1.2 Programación de Campañas
```python
from apscheduler.schedulers.background import BackgroundScheduler

# Scheduler para ejecutar campañas en horarios programados
@app.route('/api/campaigns/<id>/schedule', methods=['POST'])
def schedule_campaign(id):
    # Programar campaña para fecha/hora específica
    pass
```

#### 1.3 Exportación de Datos
```python
@app.route('/api/contacts/export', methods=['GET'])
def export_contacts():
    # Exportar contactos a CSV/Excel
    pass

@app.route('/api/analytics/export', methods=['GET'])
def export_analytics():
    # Exportar reportes a PDF
    pass
```

---

### FASE 2: Mejoras Web (Frontend)

#### 2.1 Nuevas Páginas
- [ ] Página de Configuración/Settings
- [ ] Página de Integraciones (APIs)
- [ ] Página de Reportes Avanzados
- [ ] Página de Usuarios/Equipos
- [ ] Página de Plantillas

#### 2.2 Componentes Nuevos
```javascript
// web/src/components/

// CampaignBuilder.jsx
- Constructor visual de campañas
- Drag & drop
- Preview en tiempo real

// AnalyticsViewer.jsx
- Gráficos más avanzados
- Filtros por fecha
- Comparación entre campañas

// ContactImporter.jsx
- Importar CSV
- Validación de datos
- Preview antes de importar

// TemplateEditor.jsx
- Editor de templates
- Guardar como borrador
- Duplicar templates
```

#### 2.3 Mejoras de UX
- [ ] Modo oscuro
- [ ] Notificaciones en tiempo real
- [ ] Buscador global
- [ ] Atajos de teclado
- [ ] Tema personalizable

---

### FASE 3: Mejoras Mobile (React Native)

#### 3.1 Nuevas Funciones
- [ ] Notificaciones push
- [ ] Cámara para capturar contactos
- [ ] QR code para compartir campañas
- [ ] Offline mode
- [ ] Sincronización automática

#### 3.2 Optimizaciones
- [ ] Reducir tamaño APK
- [ ] Mejorar velocidad de carga
- [ ] Optimizar consumo de batería
- [ ] Modo oscuro nativo

---

### FASE 4: Características Avanzadas

#### 4.1 Automatización
```python
# Bot automático para responder mensajes
@app.route('/api/automation/rules', methods=['POST'])
def create_automation_rule():
    # Crear regla de automatización
    # Ej: Si recibe X, responder con Y
    pass
```

#### 4.2 Análisis IA
```python
# Predicción de engagement
@app.route('/api/ai/predict', methods=['POST'])
def predict_engagement():
    # Predecir cuál será el mejor momento para enviar
    pass

# Generador de texto IA
@app.route('/api/ai/generate', methods=['POST'])
def generate_message():
    # Generar mensaje automático
    pass
```

#### 4.3 A/B Testing
```python
@app.route('/api/campaigns/<id>/ab-test', methods=['POST'])
def create_ab_test():
    # Dividir campaña en 2 versiones
    # Medir resultados
    pass
```

---

## 📝 CÓMO USAR ESTE PROMPT EN ACODE

### Paso 1: Abrir Acode
```
En tu Android:
1. Abre Acode
2. Abre la carpeta marketing-automation/
3. Navega a backend/, web/, o mobile/
```

### Paso 2: Selecciona qué Modificar

**Para trabajar en Backend:**
```
Abre: backend/app.py

Busca la línea comentada:
# TODO: Agregar más endpoints

Allí puedes agregar nuevas funciones
```

**Para trabajar en Web:**
```
Abre: web/src/pages/Settings.jsx

Crear nueva página para integraciones
Agregar formularios para APIs
```

**Para trabajar en Mobile:**
```
Abre: mobile/src/screens/

Crear nuevas pantallas
Agregar funciones nativas
```

### Paso 3: Commit y Push

```bash
# Desde Acode (Terminal)
cd marketing-automation

git add .
git commit -m "feat: [DESCRIPCIÓN DE LO QUE HICISTE]"
git push origin claude/marketing-automation-setup-qyl1do
```

---

## 🎯 ROADMAP SUGERIDO (Orden de Prioridad)

### SEMANA 1: Backend Crítico
- [ ] Integración Facebook API
- [ ] Integración WhatsApp (Twilio)
- [ ] Endpoint para programación de campañas
- [ ] Exportar contactos a CSV

### SEMANA 2: Frontend Mejorado
- [ ] Nueva página de Integraciones
- [ ] Componente CampaignBuilder
- [ ] Importador de contactos mejorado
- [ ] Modo oscuro

### SEMANA 3: Mobile Optimizado
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Sincronización automática
- [ ] Reducir tamaño APK

### SEMANA 4: Características Avanzadas
- [ ] A/B Testing
- [ ] Automatización de respuestas
- [ ] Analytics avanzado
- [ ] Publicación en Google Play

---

## 🔑 VARIABLES DE ENTORNO (Agregar a .env)

```
# APIs Externas
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_TOKEN=

WHATSAPP_TWILIO_SID=
WHATSAPP_TWILIO_AUTH=
WHATSAPP_PHONE=

TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=
TIKTOK_TOKEN=

# Email (para notificaciones)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=

# Base de datos
DATABASE_URL=sqlite:///marketing.db

# Seguridad
JWT_SECRET=tu-secreto-aqui
CORS_ORIGINS=*
```

---

## 📊 ENDPOINTS A AGREGAR

```
# Nuevos endpoints recomendados

POST   /api/campaigns/<id>/publish       - Publicar campaña
POST   /api/campaigns/<id>/schedule      - Programar campaña
POST   /api/campaigns/<id>/pause         - Pausar campaña
POST   /api/campaigns/<id>/resume        - Reanudar campaña

POST   /api/facebook/auth                - Autenticar Facebook
POST   /api/facebook/publish             - Publicar en Facebook
GET    /api/facebook/analytics           - Obtener analytics

POST   /api/whatsapp/send                - Enviar mensaje
POST   /api/whatsapp/send-bulk           - Enviar a múltiples

POST   /api/contacts/import              - Importar CSV
POST   /api/contacts/export              - Exportar CSV
PUT    /api/contacts/<id>/segment        - Cambiar segmento

GET    /api/automation/rules             - Listar reglas
POST   /api/automation/rules             - Crear regla
PUT    /api/automation/rules/<id>        - Editar regla
DELETE /api/automation/rules/<id>        - Eliminar regla

POST   /api/analytics/compare            - Comparar campañas
GET    /api/analytics/trends             - Tendencias
POST   /api/analytics/export             - Exportar reporte
```

---

## 🧪 TESTING EN ACODE

### Backend
```bash
# Terminal en Acode
cd backend

# Ver si funciona
python app.py

# Probar endpoint
curl http://localhost:5001/api/health
```

### Web
```bash
# Terminal en Acode
cd web

# Compilar cambios
npm run build

# O en desarrollo
npm start
```

### Mobile
```bash
# Terminal en Acode
cd mobile

# Probar cambios
npm start

# O compilar
eas build --platform android
```

---

## 💾 GIT WORKFLOW EN ACODE

```bash
# 1. Ver estado
git status

# 2. Agregar cambios
git add .

# 3. Hacer commit
git commit -m "feat: descripción de cambios"

# 4. Push a rama
git push origin claude/marketing-automation-setup-qyl1do

# 5. Ver historial
git log --oneline
```

---

## 🚨 REGLAS IMPORTANTES

1. **Nunca modifiques la rama main**
   - Siempre trabaja en `claude/marketing-automation-setup-qyl1do`

2. **Commits claros**
   ```
   git commit -m "feat: Integración Facebook API"
   git commit -m "fix: Bug en validación de emails"
   git commit -m "docs: Actualizar README"
   git commit -m "refactor: Mejorar estructura de código"
   ```

3. **Mantén .env seguro**
   - Nunca commits con contraseñas
   - Usa .env.example para plantilla

4. **Prueba antes de commit**
   - Backend: `python app.py`
   - Web: `npm run build`
   - Mobile: `npm start`

---

## 📚 DOCUMENTACIÓN PARA LEER

**Antes de empezar, lee:**
1. `README.md` - Overview general
2. `BUILD_GUIDE.md` - Guía de compilación
3. `docs/CONECTAR_APIS.md` - Integración de APIs
4. `docs/COMPILAR_APK.md` - Publicación en Play Store

---

## 🎯 CHECKLIST INICIAL EN ACODE

Cuando abras Acode y hagas cambios:

- [ ] Leo el archivo completo antes de modificar
- [ ] Entiendo la estructura existente
- [ ] Mis cambios son compatibles con el resto del código
- [ ] Pruebo localmente antes de commit
- [ ] Hago commit con mensaje claro
- [ ] Push a la rama correcta
- [ ] Verifico que no rompí nada

---

## 🆘 AYUDA RÁPIDA

**¿Cómo agrego una nueva dependencia?**
```bash
# Backend
cd backend && pip install nombre-libreria

# Web
cd web && npm install nombre-libreria

# Mobile
cd mobile && npm install nombre-libreria
```

**¿Cómo veo errores?**
```bash
# Backend
python app.py  # Ver errores en consola

# Web
npm run build  # Ver errores de build

# Mobile
npm start      # Ver errores de Expo
```

**¿Cómo revierto cambios?**
```bash
# Descartar cambios en un archivo
git checkout -- backend/app.py

# Descartar todos los cambios
git reset --hard

# Ver cambios pendientes
git diff
```

---

## 📞 PRÓXIMAS ACCIONES

1. **Abre Acode** en tu Android
2. **Clona/abre** la carpeta `marketing-automation/`
3. **Selecciona una tarea** del roadmap
4. **Implementa** siguiendo las instrucciones
5. **Prueba** localmente
6. **Commit y Push** a la rama
7. **Repite** con la siguiente tarea

---

## 🎉 MOTIVACIÓN

¡Acabas de crear un sistema de Marketing Automation completo!

Ahora es el momento de **mejorar y expandir** las funcionalidades.

**Cada cambio que hagas:**
- ✅ Se guarda en Git
- ✅ Se compila automáticamente
- ✅ Funciona en las 3 plataformas
- ✅ Te acerca a publicar en Google Play

**¡Vamos a hacerlo! 🚀**

---

**Git Branch:** `claude/marketing-automation-setup-qyl1do`
**Proyecto:** Marketing Automation System v1.0
**Status:** En desarrollo activo ✅
