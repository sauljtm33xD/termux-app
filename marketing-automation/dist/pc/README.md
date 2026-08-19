# 💻 Marketing Automation - Versión PC

Versión compilada lista para ejecutar en tu computadora.

## 🚀 Inicio Rápido

### Linux/Mac
```bash
chmod +x launch-pc.sh
./launch-pc.sh
```

### Windows
```bash
launch-pc.bat
```

## 📱 Acceso

- **Web Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🔑 Credenciales Test

```
Email: test@email.com
Password: 123456
```

## 📁 Estructura

```
dist/pc/
├── backend/           # Python Flask API
│   ├── app.py
│   └── marketing.db   # Base de datos SQLite
├── web/               # React compilado (archivos estáticos)
├── launch-pc.sh       # Script Linux/Mac
├── launch-pc.bat      # Script Windows
└── README.md          # Este archivo
```

## ⚙️ Requisitos

- Python 3.8+
- (Automáticamente usado por los scripts)

## 📊 Funcionalidades

✅ Crear campañas
✅ Gestionar contactos
✅ Ver analytics en tiempo real
✅ Múltiples plataformas (Facebook, WhatsApp, TikTok, Instagram)
✅ Segmentación de contactos
✅ Gráficos interactivos

## 🆘 Troubleshooting

### "Python no encontrado"
- Instala Python desde https://www.python.org
- En Windows, asegúrate de agregar Python al PATH

### "Puerto 3000 o 5001 en uso"
- Cierra otras aplicaciones usando esos puertos
- O edita los scripts para usar puertos diferentes

### "Base de datos bloqueada"
- Elimina `backend/marketing.db`
- Se recreará automáticamente en el siguiente inicio

## 🔐 Seguridad

- Base de datos local (no en la nube)
- Autenticación JWT
- Datos aislados por usuario
- Contraseñas hasheadas

## 📦 Distribución

Para compartir esta versión:
```bash
cd ..
zip -r marketing-automation-pc.zip pc/
```

Archivo: `marketing-automation-pc.zip` (~150MB)

---

**¡Listo para usar! 🎉**
