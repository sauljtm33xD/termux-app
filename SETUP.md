# FastDL PRO - Guía de Instalación Automática

Elige tu sistema operativo para una instalación fácil y automática:

## 🪟 Windows

### Instalación Automática (Recomendado)
1. **Abre símbolo de sistema** (`cmd.exe` o PowerShell)
2. **Ve al directorio de FastDL**:
   ```cmd
   cd C:\ruta\a\fastdl
   ```
3. **Ejecuta el instalador**:
   ```cmd
   auto_install.bat
   ```
4. **Sigue las instrucciones** en pantalla

### Ejecución Automática
Una vez instalado, usa:
```cmd
auto_run.bat
```

### Acceso Directo
- Se crea automáticamente en tu **Escritorio** con el nombre "FastDL PRO"
- O ejecuta desde el menú Inicio

---

## 🐧 Linux

### Instalación Automática (Recomendado)
1. **Abre terminal**
2. **Ve al directorio de FastDL**:
   ```bash
   cd /ruta/a/fastdl
   ```
3. **Haz el script ejecutable**:
   ```bash
   chmod +x auto_install.sh
   ```
4. **Ejecuta el instalador**:
   ```bash
   ./auto_install.sh
   ```
5. **Sigue las instrucciones** en pantalla

### Ejecución Automática
Una vez instalado, usa:
```bash
./auto_run.sh
```

### Acceso Directo
- Se crea automáticamente en tu menú de aplicaciones
- Busca "FastDL PRO" en tu menú de aplicaciones
- O ejecuta desde terminal: `python3 src/main.py`

---

## 🍎 macOS

### Instalación Automática (Recomendado)
1. **Abre Terminal** (Cmd+Space, escribe "Terminal")
2. **Ve al directorio de FastDL**:
   ```bash
   cd /ruta/a/fastdl
   ```
3. **Haz el script ejecutable**:
   ```bash
   chmod +x auto_install.sh
   ```
4. **Ejecuta el instalador**:
   ```bash
   ./auto_install.sh
   ```
5. **Sigue las instrucciones** en pantalla

### Ejecución Automática
Una vez instalado, usa:
```bash
./auto_run.sh
```

### Acceso Directo
- Se crea automáticamente en ~/Applications/FastDL.app
- O ejecuta desde terminal: `python3 src/main.py`

---

## 🚀 Opciones de Ejecución

### Opción 1: Script Automático (Recomendado)
**Windows**: `auto_run.bat`
**Linux/macOS**: `./auto_run.sh`

### Opción 2: Acceso Directo
**Windows**: Haz clic en FastDL PRO en tu Escritorio
**Linux**: Busca "FastDL PRO" en menú de aplicaciones
**macOS**: Abre FastDL.app desde Applications

### Opción 3: Línea de Comandos
```bash
python3 src/main.py
```

### Opción 4: Script de Lanzamiento
```bash
./launch_fastdl.sh    # Linux/macOS
run_fastdl.bat        # Windows
```

---

## ✅ Verificar Instalación

Para verificar que todo está correctamente instalado:

**Windows**:
```cmd
auto_run.bat
```
Selecciona opción 2: "Verificar instalación"

**Linux/macOS**:
```bash
./auto_run.sh
```
Selecciona opción 2: "Verificar instalación"

---

## 🔧 Solución de Problemas

### Python no encontrado
- **Windows**: Descarga Python desde https://www.python.org/
  - Durante la instalación, marca ✓ "Add Python to PATH"
  - Reinicia tu computadora después

- **Linux**: Ejecuta:
  ```bash
  sudo apt install python3 python3-pip
  ```

- **macOS**: Ejecuta:
  ```bash
  brew install python3
  ```

### Permisos insuficientes (Linux/macOS)
```bash
chmod +x auto_install.sh
chmod +x auto_run.sh
chmod +x launch_fastdl.sh
```

### Problemas de conectividad
- Verifica tu conexión a internet
- Intenta reinstalar dependencias:
  ```bash
  auto_run.bat     # Windows - opción 3
  ./auto_run.sh    # Linux/macOS - opción 3
  ```

### Conflictos de puerto (si FastDL se ejecuta como servidor)
- Asegúrate de que no haya otra instancia corriendo
- Intenta ejecutar en una terminal nueva

---

## 📦 ¿Qué Hace el Instalador?

1. **Detecta tu sistema operativo** (Windows, Linux, macOS)
2. **Verifica Python 3.10+** está instalado
3. **Crea directorios necesarios** (~/.fastdl, ~/Downloads/FastDL)
4. **Instala dependencias Python** (PyQt6, aiohttp, etc.)
5. **Crea accesos directos** en menú de aplicaciones
6. **Inicializa configuración** por defecto
7. **Genera scripts ejecutables** para lanzamiento fácil

---

## 🎯 Después de Instalar

1. **Abre FastDL PRO** usando cualquier método anterior
2. **Configura tu carpeta de descargas** (si lo deseas)
3. **¡Comienza a descargar!**

---

## 📚 Documentación Completa

- **FASTDL_README.md** - Guía completa del usuario
- **QUICKSTART.md** - Inicio rápido en 5 minutos
- **DEVELOPER_GUIDE.md** - Para desarrolladores
- **TESTING_CHECKLIST.md** - Para QA y testing

---

## 💬 ¿Necesitas Ayuda?

1. **Instalación**: Revisa la sección "Solución de Problemas" arriba
2. **Uso**: Consulta FASTDL_README.md
3. **Desarrollo**: Lee DEVELOPER_GUIDE.md
4. **Pruebas**: Sigue TESTING_CHECKLIST.md

---

**¡Disfruta FastDL PRO!**

Versión: 1.0  
Última actualización: Septiembre 2026
