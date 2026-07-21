# 📊 PLAN DE DESARROLLO - Marketing Automation v1.1

Guía paso a paso para expandir el programa con nuevas características.

---

## 🎯 OBJETIVO PRINCIPAL

Convertir el MVP (Minimum Viable Product) en una plataforma profesional lista para producción.

**Meta:** Publicar en Google Play Store en 4 semanas

---

## 📅 TIMELINE

```
Semana 1: Backend APIs          (Integración con plataformas externas)
Semana 2: Frontend Mejorado     (UX/UI y nuevas funciones)
Semana 3: Mobile Optimizado     (Notificaciones y offline)
Semana 4: Publicación           (Google Play Store)
```

---

## SEMANA 1: BACKEND APIs (Integración)

### Tarea 1.1: Integración Facebook ⭐ PRIORITARIO

**Archivo:** `backend/app.py`

**Código a agregar:**

```python
# Agregar al inicio
import requests
from datetime import datetime
import json

# Variables de configuración
FACEBOOK_GRAPH_URL = "https://graph.instagram.com/v18.0"
FACEBOOK_PAGE_TOKEN = os.getenv('FACEBOOK_TOKEN', 'tu-token-aqui')

# Modelo de datos (agregar a Database)
class FacebookIntegration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    page_id = db.Column(db.String(255))
    page_name = db.Column(db.String(255))
    access_token = db.Column(db.String(500))
    connected_at = db.Column(db.DateTime, default=datetime.utcnow)

# Endpoint para conectar Facebook
@app.route('/api/facebook/connect', methods=['POST'])
@token_required
def connect_facebook(current_user):
    """Conectar cuenta de Facebook"""
    data = request.get_json()
    
    try:
        # Validar token
        response = requests.get(
            f"{FACEBOOK_GRAPH_URL}/me",
            params={'access_token': data.get('access_token')}
        )
        
        if response.status_code != 200:
            return {'error': 'Token inválido'}, 400
        
        page_data = response.json()
        
        # Guardar en BD
        integration = FacebookIntegration(
            user_id=current_user.id,
            page_id=page_data.get('id'),
            page_name=page_data.get('name'),
            access_token=data.get('access_token')
        )
        db.session.add(integration)
        db.session.commit()
        
        return {'status': 'connected', 'page': page_data.get('name')}, 201
    
    except Exception as e:
        return {'error': str(e)}, 500

# Endpoint para publicar en Facebook
@app.route('/api/facebook/publish', methods=['POST'])
@token_required
def publish_facebook(current_user):
    """Publicar contenido en Facebook"""
    data = request.get_json()
    
    # Obtener integración
    fb_integration = FacebookIntegration.query.filter_by(
        user_id=current_user.id
    ).first()
    
    if not fb_integration:
        return {'error': 'Facebook no conectado'}, 400
    
    try:
        response = requests.post(
            f"{FACEBOOK_GRAPH_URL}/{fb_integration.page_id}/feed",
            data={
                'message': data.get('message'),
                'link': data.get('link', ''),
                'picture': data.get('image', ''),
                'access_token': fb_integration.access_token
            }
        )
        
        if response.status_code != 200:
            return {'error': 'Error al publicar'}, 400
        
        post_data = response.json()
        
        return {
            'status': 'published',
            'post_id': post_data.get('id'),
            'url': f"https://facebook.com/{post_data.get('id')}"
        }, 201
    
    except Exception as e:
        return {'error': str(e)}, 500

# Endpoint para obtener analytics de Facebook
@app.route('/api/facebook/analytics', methods=['GET'])
@token_required
def get_facebook_analytics(current_user):
    """Obtener estadísticas de publicaciones"""
    fb_integration = FacebookIntegration.query.filter_by(
        user_id=current_user.id
    ).first()
    
    if not fb_integration:
        return {'error': 'Facebook no conectado'}, 400
    
    try:
        response = requests.get(
            f"{FACEBOOK_GRAPH_URL}/{fb_integration.page_id}/insights",
            params={
                'metric': 'page_post_engagement,page_engaged_users',
                'access_token': fb_integration.access_token
            }
        )
        
        return response.json(), 200
    
    except Exception as e:
        return {'error': str(e)}, 500
```

**Pasos:**

1. **Instalar dependencia:**
   ```bash
   cd backend
   pip install facebook-sdk
   ```

2. **Obtener token Facebook:**
   - Ir a https://developers.facebook.com
   - Crear app
   - Obtener Page Access Token
   - Guardar en `.env`

3. **Prueba:**
   ```bash
   curl -X POST http://localhost:5001/api/facebook/connect \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"access_token":"..."}'
   ```

---

### Tarea 1.2: Integración WhatsApp (Twilio)

**Archivo:** `backend/app.py`

```python
from twilio.rest import Client

# Configuración Twilio
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH')
TWILIO_WHATSAPP = os.getenv('TWILIO_WHATSAPP')

# Modelo WhatsApp
class WhatsAppIntegration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    twilio_sid = db.Column(db.String(255))
    twilio_token = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    connected_at = db.Column(db.DateTime, default=datetime.utcnow)

# Conectar WhatsApp
@app.route('/api/whatsapp/connect', methods=['POST'])
@token_required
def connect_whatsapp(current_user):
    """Conectar Twilio WhatsApp"""
    data = request.get_json()
    
    try:
        client = Client(data.get('sid'), data.get('token'))
        
        # Verificar credenciales
        account = client.api.accounts.fetch()
        
        integration = WhatsAppIntegration(
            user_id=current_user.id,
            twilio_sid=data.get('sid'),
            twilio_token=data.get('token'),
            phone_number=data.get('phone')
        )
        db.session.add(integration)
        db.session.commit()
        
        return {'status': 'connected'}, 201
    except Exception as e:
        return {'error': str(e)}, 500

# Enviar WhatsApp
@app.route('/api/whatsapp/send', methods=['POST'])
@token_required
def send_whatsapp(current_user):
    """Enviar mensaje WhatsApp"""
    data = request.get_json()
    
    integration = WhatsAppIntegration.query.filter_by(
        user_id=current_user.id
    ).first()
    
    if not integration:
        return {'error': 'WhatsApp no conectado'}, 400
    
    try:
        client = Client(integration.twilio_sid, integration.twilio_token)
        
        message = client.messages.create(
            body=data.get('message'),
            from_=f"whatsapp:{integration.phone_number}",
            to=f"whatsapp:{data.get('phone')}"
        )
        
        return {'status': 'sent', 'sid': message.sid}, 201
    except Exception as e:
        return {'error': str(e)}, 500

# Enviar WhatsApp a múltiples
@app.route('/api/whatsapp/send-bulk', methods=['POST'])
@token_required
def send_whatsapp_bulk(current_user):
    """Enviar mensaje a múltiples contactos"""
    data = request.get_json()
    
    integration = WhatsAppIntegration.query.filter_by(
        user_id=current_user.id
    ).first()
    
    if not integration:
        return {'error': 'WhatsApp no conectado'}, 400
    
    results = []
    client = Client(integration.twilio_sid, integration.twilio_token)
    
    for phone in data.get('phones', []):
        try:
            message = client.messages.create(
                body=data.get('message'),
                from_=f"whatsapp:{integration.phone_number}",
                to=f"whatsapp:{phone}"
            )
            results.append({'phone': phone, 'status': 'sent', 'sid': message.sid})
        except Exception as e:
            results.append({'phone': phone, 'status': 'failed', 'error': str(e)})
    
    return {'results': results}, 200
```

**Pasos:**

1. **Instalar Twilio:**
   ```bash
   pip install twilio
   ```

2. **Crear cuenta Twilio:**
   - https://www.twilio.com
   - Obtener SID, Auth Token, WhatsApp Number

3. **Guardar en .env:**
   ```
   TWILIO_SID=your-sid
   TWILIO_AUTH=your-token
   TWILIO_WHATSAPP=+34...
   ```

---

### Tarea 1.3: Programación de Campañas

**Archivo:** `backend/app.py`

```python
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta

# Inicializar scheduler
scheduler = BackgroundScheduler()
scheduler.start()

# Agregar modelo para campañas programadas
class ScheduledCampaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'))
    scheduled_for = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Programar campaña
@app.route('/api/campaigns/<int:id>/schedule', methods=['POST'])
@token_required
def schedule_campaign(current_user, id):
    """Programar campaña para ejecutarse en fecha/hora específica"""
    campaign = Campaign.query.filter_by(id=id, user_id=current_user.id).first()
    if not campaign:
        return {'error': 'Campaign not found'}, 404
    
    data = request.get_json()
    scheduled_time = datetime.fromisoformat(data.get('scheduled_for'))
    
    # Guardar en BD
    scheduled = ScheduledCampaign(
        campaign_id=id,
        scheduled_for=scheduled_time
    )
    db.session.add(scheduled)
    db.session.commit()
    
    # Programar en scheduler
    def execute_campaign():
        campaign.status = 'active'
        db.session.commit()
        # Aquí va la lógica de envío
    
    scheduler.add_job(
        execute_campaign,
        'date',
        run_date=scheduled_time,
        id=f'campaign_{id}'
    )
    
    return {'status': 'scheduled', 'run_at': scheduled_time.isoformat()}, 201
```

---

## SEMANA 2: FRONTEND MEJORADO

### Tarea 2.1: Página de Integraciones

**Archivo:** `web/src/pages/Integrations.jsx`

```javascript
import React, { useState } from 'react';
import axios from 'axios';

export default function IntegrationsPage() {
  const [facebook, setFacebook] = useState({ connected: false });
  const [whatsapp, setWhatsapp] = useState({ connected: false });
  const [tiktok, setTiktok] = useState({ connected: false });

  const handleFacebookConnect = async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/facebook/connect',
        { access_token: token },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setFacebook({ connected: true, page: response.data.page });
    } catch (error) {
      alert('Error connecting Facebook');
    }
  };

  return (
    <div className="integrations-container">
      <h2>Conectar APIs</h2>

      {/* Facebook */}
      <div className="integration-card">
        <h3>📘 Facebook</h3>
        {facebook.connected ? (
          <>
            <p>✅ Conectado a: {facebook.page}</p>
            <button>Desconectar</button>
          </>
        ) : (
          <>
            <input type="text" placeholder="Access Token" />
            <button onClick={() => handleFacebookConnect(document.querySelector('input').value)}>
              Conectar
            </button>
          </>
        )}
      </div>

      {/* WhatsApp */}
      <div className="integration-card">
        <h3>💬 WhatsApp</h3>
        {/* Similar a Facebook */}
      </div>

      {/* TikTok */}
      <div className="integration-card">
        <h3>🎵 TikTok</h3>
        {/* Similar a Facebook */}
      </div>
    </div>
  );
}
```

---

### Tarea 2.2: Importador de Contactos CSV

**Archivo:** `web/src/components/ContactImporter.jsx`

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

export default function ContactImporter() {
  const [preview, setPreview] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const csvFile = e.target.files[0];
    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
        setFile(results.data);
      }
    });
  };

  const handleImport = async () => {
    try {
      for (const contact of file) {
        await axios.post(
          'http://localhost:5001/api/contacts',
          {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            segment: contact.segment || 'general'
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      alert(`✅ ${file.length} contactos importados`);
    } catch (error) {
      alert('Error importing contacts');
    }
  };

  return (
    <div className="importer">
      <h3>Importar Contactos CSV</h3>
      
      <input type="file" accept=".csv" onChange={handleFileChange} />
      
      {preview.length > 0 && (
        <>
          <h4>Vista Previa:</h4>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={handleImport}>
            Importar {file.length} Contactos
          </button>
        </>
      )}
    </div>
  );
}
```

---

## SEMANA 3: MOBILE OPTIMIZADO

### Tarea 3.1: Notificaciones Push

**Archivo:** `mobile/App.js`

```javascript
import * as Notifications from 'expo-notifications';

// Configurar manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Función para solicitar permiso y obtener token
export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

// En App.js useEffect
useEffect(() => {
  registerForPushNotificationsAsync().then(token => {
    if (token) {
      // Guardar token en backend
      savePushToken(token);
    }
  });
}, []);
```

---

## SEMANA 4: PUBLICACIÓN

### Pasos para Google Play Store

1. **Crear cuenta desarrollador:** $25
2. **Firmar APK:** Crear keystore
3. **Llenar metadatos:** Nombre, descripción, screenshots
4. **Subir APK:** A Google Play Console
5. **Esperar revisión:** 24-48 horas

Ver: `docs/COMPILAR_APK.md`

---

## 🎯 CHECKLIST POR SEMANA

### Semana 1
- [ ] Integración Facebook completa
- [ ] Integración WhatsApp (Twilio)
- [ ] Programación de campañas
- [ ] Tests de endpoints
- [ ] Commit y Push

### Semana 2
- [ ] Página de Integraciones
- [ ] Importador CSV
- [ ] Modo oscuro
- [ ] Mejorar gráficos
- [ ] Tests de componentes
- [ ] Commit y Push

### Semana 3
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Optimizar tamaño APK
- [ ] Tests en dispositivo real
- [ ] Commit y Push

### Semana 4
- [ ] Compilar APK final
- [ ] Firmar APK
- [ ] Crear cuenta Google Play
- [ ] Llenar metadatos
- [ ] Subir a Google Play
- [ ] Esperar aprobación

---

## 💡 TIPS IMPORTANTES

1. **Mantén commits pequeños** - Un feature por commit
2. **Prueba continuamente** - No esperes al final
3. **Documenta cambios** - README actualizado
4. **Variables de entorno** - Nunca hardcodes de secretos
5. **Sigue el estilo** - Usa el mismo formato que el código existente

---

## 🚀 ¡A PROGRAMAR!

Cada semana completada te acerca a publicar en Google Play Store.

**Próximo paso:** Abre Acode y comienza con la Tarea 1.1 (Integración Facebook)

**¡Vamos! 💪**
