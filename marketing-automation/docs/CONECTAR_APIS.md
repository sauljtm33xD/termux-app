# 🔗 Conectar APIs Externas

Guía para integrar Facebook, WhatsApp y TikTok con tu sistema.

---

## 1️⃣ FACEBOOK API

### Paso 1: Crear App en Facebook

1. Ir a https://developers.facebook.com
2. Click en "Mis Aplicaciones"
3. Crear nueva aplicación
4. Nombre: "Marketing Automation"
5. Tipo de app: "Business"

### Paso 2: Obtener Credenciales

1. En el Dashboard → Configuración → Básica
2. Copiar:
   - **App ID**: `123456789`
   - **App Secret**: `abcdef123456`

3. En Products → Agregar producto "Instagram Graph API"

### Paso 3: Obtener Page Access Token

1. Ir a Tools → Graph API Explorer
2. Seleccionar tu app
3. Token User → Get Token (válido por 60 días)
4. Ir a Facebook Page → Obtener Page Access Token
5. Este token NO expira si es para negocio

### Paso 4: Integrar en Backend

En `backend/app.py`, agregar:

```python
import requests

FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v18.0"
PAGE_ACCESS_TOKEN = "tu-page-token-aqui"

@app.route('/api/facebook/publish', methods=['POST'])
@token_required
def publish_to_facebook(current_user):
    data = request.get_json()
    
    response = requests.post(
        f"{FACEBOOK_GRAPH_URL}/me/feed",
        params={
            'message': data.get('message'),
            'access_token': PAGE_ACCESS_TOKEN
        }
    )
    
    return {'status': 'published' if response.status_code == 200 else 'failed'}
```

---

## 2️⃣ WHATSAPP BUSINESS API

### Opción A: Usar Twilio (Más fácil)

#### Paso 1: Crear Cuenta Twilio

1. Ir a https://www.twilio.com
2. Registrarse
3. Ir a Console
4. Copiar:
   - **Account SID**: `AC123456789`
   - **Auth Token**: `abc123def456`

#### Paso 2: Número WhatsApp

1. Crear "Messaging Service"
2. Agregar teléfono WhatsApp
3. Copiar **Phone Number**: `+34XXXXXXXXX`

#### Paso 3: Integrar en Backend

```python
from twilio.rest import Client

TWILIO_ACCOUNT_SID = "tu-sid"
TWILIO_AUTH_TOKEN = "tu-token"
TWILIO_PHONE = "+34XXXXXXXXX"

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.route('/api/whatsapp/send', methods=['POST'])
@token_required
def send_whatsapp(current_user):
    data = request.get_json()
    
    message = client.messages.create(
        body=data.get('message'),
        from_=f"whatsapp:{TWILIO_PHONE}",
        to=f"whatsapp:{data.get('phone')}"
    )
    
    return {'status': 'sent', 'sid': message.sid}
```

**Instalar:**
```bash
pip install twilio
```

### Opción B: WhatsApp Business API (Oficial)

1. Ir a https://www.whatsapp.com/business/api
2. Solicitar acceso (24-48h)
3. Crear cuenta de negocio
4. Obtener Business Account ID
5. Generar Access Token
6. Configurar webhook para mensajes entrantes

---

## 3️⃣ TIKTOK API

### Paso 1: Solicitar Acceso

1. Ir a https://developer.tiktok.com
2. Click en "Sign up"
3. Crear cuenta desarrollador
4. Solicitar acceso a APIs (24-48h)

### Paso 2: Crear Aplicación

1. En Console → Create App
2. Nombre: "Marketing Automation"
3. Plataforma: "Web"
4. Escoger permisos necesarios

### Paso 3: Obtener Credenciales

1. Copiar:
   - **Client Key**: `abc123def456`
   - **Client Secret**: `xyz789uvw123`

2. Configurar Redirect URI: `http://localhost:5001/callback`

### Paso 4: Integrar OAuth

```python
import requests
from urllib.parse import urlencode

TIKTOK_CLIENT_KEY = "tu-client-key"
TIKTOK_CLIENT_SECRET = "tu-client-secret"
TIKTOK_REDIRECT_URI = "http://localhost:5001/callback"

@app.route('/api/tiktok/login', methods=['GET'])
def tiktok_login():
    params = {
        'client_key': TIKTOK_CLIENT_KEY,
        'response_type': 'code',
        'scope': 'user.info.basic,video.create',
        'redirect_uri': TIKTOK_REDIRECT_URI,
        'state': 'random-state'
    }
    
    auth_url = f"https://www.tiktok.com/v1/oauth/authorize/?{urlencode(params)}"
    return {'auth_url': auth_url}

@app.route('/callback', methods=['GET'])
def tiktok_callback():
    code = request.args.get('code')
    
    # Intercambiar código por access token
    response = requests.post(
        "https://open.tiktokapis.com/v1/oauth/token/",
        json={
            'client_key': TIKTOK_CLIENT_KEY,
            'client_secret': TIKTOK_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': TIKTOK_REDIRECT_URI
        }
    )
    
    token = response.json().get('access_token')
    # Guardar token en BD
    
    return {'status': 'authorized'}
```

---

## 📝 Configuración en Web Dashboard

### En `web/src/pages/Settings.jsx` (Crear este archivo)

```javascript
import React, { useState } from 'react';

export default function SettingsPage() {
  const [facebookToken, setFacebookToken] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [tiktokToken, setTiktokToken] = useState('');

  return (
    <div className="app-container">
      <div className="settings">
        <h2>Conectar APIs</h2>

        <div className="api-card">
          <h3>📘 Facebook</h3>
          <input
            type="password"
            placeholder="Page Access Token"
            value={facebookToken}
            onChange={(e) => setFacebookToken(e.target.value)}
          />
          <button>Conectar</button>
        </div>

        <div className="api-card">
          <h3>💬 WhatsApp</h3>
          <input
            type="password"
            placeholder="Twilio Auth Token"
            value={whatsappToken}
            onChange={(e) => setWhatsappToken(e.target.value)}
          />
          <button>Conectar</button>
        </div>

        <div className="api-card">
          <h3>🎵 TikTok</h3>
          <button>Autorizar con TikTok</button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing de APIs

### Test Facebook
```bash
curl -X POST http://localhost:5001/api/facebook/publish \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test desde API"}'
```

### Test WhatsApp
```bash
curl -X POST http://localhost:5001/api/whatsapp/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+34612345678","message":"¡Hola!"}'
```

---

## 📊 Límites de Rate Limiting

### Facebook
- Ads API: 200 llamadas/usuario/hora
- Graph API: 600 llamadas/10min

### WhatsApp (Twilio)
- Mensajes: Según plan
- Trial: 100 mensajes gratis

### TikTok
- Video Upload: 100/día
- Account Info: 1000/día

---

## 🔐 Seguridad

⚠️ **NUNCA** compartir tokens públicamente

1. Guardar en `.env`
2. Usar variables de entorno
3. Cambiar tokens regularmente
4. Revocar acceso si es necesario

```python
# ✅ Correcto
import os
FACEBOOK_TOKEN = os.getenv('FACEBOOK_TOKEN')

# ❌ Incorrecto
FACEBOOK_TOKEN = "abc123...xyz"
```

---

## 📚 Recursos

- Facebook Developers: https://developers.facebook.com
- Twilio: https://www.twilio.com/docs
- TikTok API: https://developers.tiktok.com

---

**¡Tus APIs están conectadas! 🎉**
