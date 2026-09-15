# FastDL para Termux (Android)

FastDL funciona en Termux con una interfaz **CLI (línea de comandos)** ultra simple.

## 🔧 Instalación Rápida

```bash
bash termux_install.sh
```

Esto instala automáticamente Python y todas las dependencias necesarias.

## 🚀 Uso

### Descarga Básica
```bash
python -m src.cli https://ejemplo.com/archivo.zip
```

### Con Opciones
```bash
# Cambiar carpeta de salida
python -m src.cli https://ejemplo.com/archivo.zip -o /sdcard/Download

# Usar solo 4 conexiones
python -m src.cli https://ejemplo.com/archivo.zip -c 4

# Ambas opciones
python -m src.cli https://ejemplo.com/archivo.zip -o /sdcard/Download -c 4
```

## 📊 Características

✅ Descargas paralelas (hasta 8 conexiones)  
✅ Interfaz CLI simple y rápida  
✅ Monitoreo de progreso en tiempo real  
✅ Bajo consumo de recursos  
✅ Reanudación automática  

## ⚙️ Opciones Disponibles

| Opción | Descripción |
|--------|-----------|
| `-o, --output` | Carpeta de descargas (default: ~/Downloads) |
| `-c, --connections` | Conexiones paralelas, 1-32 (default: 8) |
| `-h, --help` | Mostrar ayuda |

## 📁 Rutas en Termux

- **Storage interno**: `/sdcard/` o `/storage/emulated/0/`
- **Carpeta Downloads**: `/sdcard/Download/`
- **Home de Termux**: `~/` o `/data/data/com.termux/files/home/`

## 💡 Ejemplos

```bash
# Descargar a la carpeta de descargas de Android
python -m src.cli https://ejemplo.com/archivo.zip -o /sdcard/Download

# Descargar ISO de Linux
python -m src.cli https://ubuntu.com/ubuntu-22.04-desktop-amd64.iso

# Descargar desde un servidor con 6 conexiones
python -m src.cli https://servidor.com/archivo.tar.gz -c 6

# Ver ayuda
python -m src.cli --help
```

## ⚠️ Limitaciones

- ❌ **No hay GUI** (PyQt6 no funciona en Termux)
- ✅ **CLI rápida y eficiente** para línea de comandos
- ✅ Para **GUI completa**, usa la versión desktop en Windows/Linux/Mac

## 🔄 Para Usar la Versión GUI

Si tienes una PC con Windows, Linux o macOS:

1. Clona la rama completa:
```bash
git clone -b claude/fast-pc-downloader-m18nab \
  https://github.com/sauljtm33xD/termux-app.git
cd termux-app
```

2. Instala todas las dependencias:
```bash
pip install -r requirements.txt
```

3. Ejecuta con GUI:
```bash
python src/main.py
```

## 📞 Soporte

Para problemas o sugerencias:
- GitHub Issues: https://github.com/sauljtm33xD/termux-app/issues
- GitHub Discussions: https://github.com/sauljtm33xD/termux-app/discussions

---

**FastDL: Descarga rápido desde cualquier lugar** ⚡
