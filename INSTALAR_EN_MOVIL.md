# 📱 GUÍA DE INSTALACIÓN EN MÓVIL

## Opción 1: Instalación Automática (RECOMENDADO) ⭐

### Paso 1: Descargar Termux

Si aún no tienes Termux instalado:

1. Abre **Google Play Store**
2. Busca: **"Termux"**
3. Instala la aplicación oficial (by Fredrik Fornwall)
4. Abre Termux

### Paso 2: Descargar el instalador

En tu móvil, dentro de Termux, ejecuta:

```bash
wget https://github.com/sauljtm33xD/termux-app/releases/download/termux-manager-v1.0/termux-manager-installer.tar.gz
```

O si wget no funciona:

```bash
curl -L https://github.com/sauljtm33xD/termux-app/releases/download/termux-manager-v1.0/termux-manager-installer.tar.gz -o termux-manager-installer.tar.gz
```

### Paso 3: Extraer el instalador

```bash
tar -xzf termux-manager-installer.tar.gz
```

### Paso 4: Ejecutar la instalación

```bash
bash install-termux-manager.sh
```

**¡Eso es todo!** El instalador:
- ✅ Descargará los archivos necesarios
- ✅ Configurará los permisos
- ✅ Instalará en el PATH
- ✅ Creará alias en bash

### Paso 5: Usar Termux Manager

Ahora solo escribe en Termux:

```bash
termux-manager
```

---

## Opción 2: Instalación Manual

### Si el instalador automático no funciona:

#### 1. Crear carpeta de instalación
```bash
mkdir -p ~/.termux-manager
cd ~/.termux-manager
```

#### 2. Descargar los archivos

```bash
# Descargar el script principal
curl -L https://raw.githubusercontent.com/termux/termux-app/master/termux-manager -o termux-manager
chmod +x termux-manager

# Descargar la documentación (opcional)
curl -L https://raw.githubusercontent.com/termux/termux-app/master/TERMUX_MANAGER_README.md -o README.md
```

#### 3. Crear enlace ejecutable

```bash
ln -s ~/.termux-manager/termux-manager $PREFIX/bin/termux-manager
```

#### 4. Ejecutar

```bash
termux-manager
```

---

## Opción 3: Instalación Directa desde GitHub

```bash
# En una línea
curl -L https://raw.githubusercontent.com/termux/termux-app/master/termux-manager -o termux-manager && chmod +x termux-manager && ./termux-manager
```

---

## Uso desde el móvil

### Menú interactivo
```bash
termux-manager
```
Se abrirá un menú con opciones.

### Comandos rápidos

```bash
# Ver información del sistema
termux-manager system-info

# Instalar lo básico (curl, git, python, nodejs, etc)
termux-manager install-basic

# Ver herramientas disponibles
termux-manager install-community

# Información sobre acceso root
termux-manager root-info

# Optimizar Termux (limpiar, actualizar)
termux-manager optimize

# Restaurar configuración
termux-manager restore
```

---

## Primera ejecución - Recomendado

### Para principiantes:

```bash
# 1. Ejecutar
termux-manager

# 2. Seleccionar opción: 1
# Instala: curl, wget, git, nano, vim, openssh, python, nodejs

# 3. Luego seleccionar opción: 5
# Optimiza Termux (actualiza, limpia)

# 4. Finalmente opción: 4
# Ver información del sistema
```

### Para usuarios avanzados:

```bash
# Instalar herramientas de seguridad
termux-manager install-community
# Seleccionar: 4 (hashcat), 5 (hydra), 6 (metasploit)
```

---

## Solución de problemas

### ❌ Problema: "wget: not found"

**Solución:**
```bash
apt update
apt install wget
```

Luego vuelve a intentar descargar.

### ❌ Problema: "No hay espacio disponible"

**Solución:**
```bash
termux-manager optimize
```

O manualmente:
```bash
apt clean
apt autoclean
```

### ❌ Problema: "Permiso denegado"

**Solución:**
```bash
chmod +x termux-manager
chmod +x install-termux-manager.sh
```

### ❌ Problema: "Comando no encontrado"

**Solución:**
```bash
# Asegúrate que está en el PATH
which termux-manager

# Si no muestra nada:
ln -s ~/.termux-manager/termux-manager $PREFIX/bin/termux-manager

# O ejecuta desde la carpeta:
~/.termux-manager/termux-manager
```

### ❌ Problema: "No hay conexión a internet"

Verifica:
- ✅ WiFi o datos están activados
- ✅ Ping funciona: `ping 8.8.8.8`
- ✅ DNS funciona: `nslookup google.com`

---

## Instalar herramientas específicas

Después de instalar lo básico, puedes instalar herramientas individuales:

```bash
# Editor de texto avanzado
apt install vim

# Cliente de red
apt install netcat-traditional

# Base de datos
apt install mariadb

# Lenguaje de programación
apt install golang

# Más herramientas
apt search | grep <nombre>
```

---

## Desinstalar Termux Manager

Si alguna vez necesitas desinstalarlo:

```bash
rm -rf ~/.termux-manager
rm $PREFIX/bin/termux-manager
```

Luego reinicia Termux:
```bash
exit
```

---

## Hacer que inicie automáticamente

### Crear acceso directo en pantalla de inicio

1. En Termux, instala Termux:Widget
2. Abre **Termux:Widget**
3. Crea un widget ejecutando: `termux-manager`

### O crear script de inicio automático

Crea archivo `~/.termux/shell`:
```bash
#!/bin/bash
termux-manager
```

---

## Actualizar Termux Manager

```bash
# Descargar la última versión
curl -L https://raw.githubusercontent.com/termux/termux-app/master/termux-manager -o ~/.termux-manager/termux-manager

# Aplicar permisos
chmod +x ~/.termux-manager/termux-manager

# Listo!
termux-manager
```

---

## Siguiente paso: Obtener Root

Después de instalar herramientas, quizás desees acceso root. Ver:

```bash
termux-manager root-info
```

Esto te mostrará opciones seguras:
- Magisk
- PhoenixOS
- KernelSU
- proot (simula root)

---

## Documentación completa

Para documentación completa y más información:

```bash
cat ~/.termux-manager/README.md | less
```

O visita:
- [Termux Wiki](https://wiki.termux.com)
- [GitHub](https://github.com/termux/termux-app)
- [Discord](https://discord.gg/HXpF69X)

---

## 📋 Resumen de instalación

| Paso | Comando |
|------|---------|
| 1 | Descargar: `wget termux-manager-installer.tar.gz` |
| 2 | Extraer: `tar -xzf termux-manager-installer.tar.gz` |
| 3 | Instalar: `bash install-termux-manager.sh` |
| 4 | Usar: `termux-manager` |

---

## Requisitos mínimos

- ✅ Android 7 o superior
- ✅ 100 MB de espacio libre
- ✅ Conexión a internet
- ✅ Termux instalado

---

¡Listo! Ya tienes Termux Manager instalado en tu móvil. 🚀

**Para ayuda:**
```bash
termux-manager
# Opción 4: Ver información del sistema
# Opción 3: Configurar acceso root
```
