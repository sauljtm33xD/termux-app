# ⚡ FastDL - Guía Rápida

## 🚀 Inicio en 3 Pasos

### 1️⃣ Instalar
```bash
pip install -r requirements.txt
```

### 2️⃣ Ejecutar
```bash
python src/main.py
```

### 3️⃣ Descargar
- Pega una URL
- Click en "Agregar Descarga"
- Click en "Iniciar"
- ¡Disfruta de descargas ultrarrápidas!

---

## 🖥️ Atajos de Lanzamiento

**Linux/macOS:**
```bash
./run.sh
```

**Windows:**
```cmd
run.bat
```

**Acceso directo en escritorio:**
- Haz doble clic en `FastDL.desktop` (Linux)
- O ejecuta `FastDL.lnk` (Windows)

---

## 📊 Características Principales

| Característica | Detalles |
|---|---|
| **Descargas Paralelas** | Hasta 8 conexiones simultáneas |
| **Velocidad** | Máximo ancho de banda disponible |
| **Reanudación** | Automática en caso de interrupción |
| **Monitoreo** | Real-time: velocidad, progreso, ETA |
| **Multiplataforma** | Windows, Linux, macOS |
| **UI Moderna** | PyQt6 con tema claro/oscuro |

---

## ⚙️ Configuración

En la pestaña **"Configuración"**:
- Ajusta **conexiones paralelas** (1-32)
- Habilita/deshabilita **reanudación**
- Cambia **carpeta de descargas**

---

## 🔧 Instalación Alternativa (pip)

```bash
pip install -e .
fastdl  # Ejecuta desde cualquier lugar
```

---

## 📈 Rendimiento Esperado

- **CPU:** 2-5%
- **RAM:** 50-100 MB
- **Velocidad:** Limitada solo por tu ISP/WiFi

---

## 🐛 Solución de Problemas

### Error: "No module named 'PyQt6'"
```bash
pip install --upgrade -r requirements.txt
```

### Error: "Permission denied"
```bash
chmod +x run.sh
./run.sh
```

### No abre en Windows
- Asegúrate de tener Python en PATH
- Ejecuta `python src/main.py` directamente

---

## 📚 Documentación Completa

- **[README.md](README.md)** - Descripción general del proyecto
- **[INSTALL.md](INSTALL.md)** - Instalación detallada por SO
- **[LICENSE](LICENSE)** - Licencia MIT

---

## 🚀 Próximas Versiones

Está planeado agregar:
- Soporte para torrents
- Descarga de playlists
- Descarga programada
- Conversión de formatos
- CLI remoto
- Historial persistente

---

**¡FastDL: Descarga más rápido, usa menos recursos!** ⚡

Para reportar bugs o sugerencias, abre un issue en GitHub.
