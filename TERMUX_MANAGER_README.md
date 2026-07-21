# Termux Manager - Gestor de Herramientas sin Root

Termux Manager es un script interactivo que facilita la instalación de herramientas y programas en Termux sin necesidad de permisos root. Proporciona acceso a cientos de paquetes de la comunidad Termux.

## Características

✅ **Sin requisitos de root** - Funciona completamente en Termux sin permisos elevados
✅ **Interfaz interactiva** - Menú fácil de usar con colores
✅ **Herramientas de la comunidad** - Acceso a nmap, hydra, metasploit, golang, rust, php, etc.
✅ **Información de escalada** - Guías sobre cómo obtener acceso root
✅ **Optimización** - Limpia y optimiza tu instalación de Termux
✅ **Información del sistema** - Muestra detalles de tu dispositivo

## Requisitos

- Termux instalado en Android
- Conexión a internet (para instalar paquetes)
- Bash
- `apt` (viene con Termux)

## Instalación

### Opción 1: Descarga directa

```bash
# Descarga el script
wget https://raw.githubusercontent.com/termux/termux-app/master/termux-manager -O termux-manager

# Hazlo ejecutable
chmod +x termux-manager

# Ejecútalo
./termux-manager
```

### Opción 2: Copia manual

1. Copia el contenido de `termux-manager`
2. Crea un archivo en tu dispositivo: `termux-manager`
3. Dale permisos: `chmod +x termux-manager`
4. Ejecuta: `./termux-manager`

### Opción 3: Instalar globalmente

```bash
# Copia a un directorio en el PATH
cp termux-manager $PREFIX/bin/termux-manager

# Ahora puedes ejecutar desde cualquier lugar
termux-manager
```

## Uso

### Menú interactivo

```bash
./termux-manager
```

Se abrirá un menú con las siguientes opciones:

```
1. Instalar herramientas básicas
2. Instalar herramientas de la comunidad
3. Configurar acceso root
4. Ver información del sistema
5. Optimizar Termux
6. Restaurar configuración por defecto
0. Salir
```

### Comandos de línea de comandos

También puedes ejecutar comandos específicos sin el menú interactivo:

```bash
# Instalar herramientas básicas
./termux-manager install-basic

# Instalar herramientas de la comunidad
./termux-manager install-community

# Ver información sobre acceso root
./termux-manager root-info

# Ver información del sistema
./termux-manager system-info

# Optimizar Termux
./termux-manager optimize

# Restaurar configuración por defecto
./termux-manager restore
```

## Opciones detalladas

### 1. Instalar herramientas básicas

Instala paquetes esenciales:
- `curl` - Cliente HTTP
- `wget` - Descargador de archivos
- `git` - Control de versiones
- `nano` / `vim` - Editores de texto
- `openssh` - Cliente SSH
- `python` - Intérprete Python
- `nodejs` - Runtime de JavaScript
- `build-essential` - Herramientas de compilación

### 2. Instalar herramientas de la comunidad

Acceso a categorías de herramientas:

#### Utilidades de Red
- **nmap** - Escaneo de puertos y redes
- **netcat** - Utilidad de red versátil
- **tcpdump** - Captura de paquetes

#### Herramientas de Seguridad
- **hashcat** - Cracking de contraseñas
- **hydra** - Ataque por fuerza bruta
- **metasploit** - Framework de penetración

#### Desarrollo
- **golang** - Lenguaje Go
- **rust** - Lenguaje Rust
- **php** - Intérprete PHP

#### Utilidades del Sistema
- **tmux** - Multiplexor de terminal
- **htop** - Monitor de procesos
- **ffmpeg** - Procesamiento multimedia

#### Bases de Datos
- **postgresql** - Base de datos PostgreSQL
- **mariadb** - Base de datos MariaDB
- **redis** - Cache en memoria

### 3. Configurar acceso root

El script proporciona información sobre:

- **Métodos para obtener root:**
  - Magisk + SuperUser
  - PhoenixOS o ROM customizada
  - KernelSU
  - Comando `su`

- **Herramientas de escalada:**
  - `proot` - Simula root sin permisos reales
  - `fakeroot` - Fake root para compilaciones

Puedes verificar tu estado actual de permisos y instalar herramientas de escalada.

### 4. Ver información del sistema

Muestra detalles como:
- Versión de Android
- Arquitectura del dispositivo
- Espacio disponible
- Versión de Bash
- Número de paquetes instalados
- Memoria disponible

### 5. Optimizar Termux

Realiza mantenimiento:
- Actualiza repositorios
- Actualiza paquetes existentes
- Limpia caché
- Elimina paquetes no utilizados

### 6. Restaurar configuración por defecto

Restaura los archivos de configuración a sus valores por defecto (crea backup del original).

## Ejemplos de uso

### Instalación básica completa

```bash
# Abrir el menú
./termux-manager

# Seleccionar opción 1 para instalar herramientas básicas
# Seleccionar opción 2 para instalar herramientas de la comunidad
```

### Instalar herramientas específicas de seguridad

```bash
./termux-manager
# Seleccionar opción 2
# Luego seleccionar:
# 4 para hashcat
# 5 para hydra
# 6 para metasploit
```

### Configurar root y herramientas de escalada

```bash
./termux-manager root-info
# Muestra información sobre cómo obtener root
# Ofrece instalar proot y fakeroot
```

### Usando proot para simular root

Después de instalar `proot`:

```bash
# Ejecutar un comando con permisos "simulados" de root
proot -r $PREFIX -w /root
```

## Solución de problemas

### No se puede conectar a internet

```bash
ping 8.8.8.8
```

Si no hay conexión, la herramienta te lo informará.

### Error: No se detectó Termux

El script solo funciona dentro de Termux. Verifica que estés usando Termux correctamente.

### Errores durante la instalación

Algunos paquetes pueden no estar disponibles para tu arquitectura (ARM, ARM64, etc.). El script intentará instalarlos de todas formas.

### Espacio insuficiente

Si se queda sin espacio:

```bash
# Limpiar caché
apt clean
apt autoclean

# Ver qué está usando espacio
du -sh $PREFIX/*
```

## Obtener acceso root sin Magisk

### Método 1: PhoenixOS

PhoenixOS proporciona acceso root nativo:

```bash
# Una vez instalado PhoenixOS
su -
```

### Método 2: KernelSU

KernelSU es una alternativa moderna:

1. Descarga KernelSU desde GitHub
2. Flashea a través de TWRP/recovery
3. Ejecuta comandos como root

### Método 3: Usar proot

`proot` simula permisos root sin necesitar acceso real:

```bash
# Instalar proot
apt install proot

# Ejecutar con pseudo-root
proot -r $PREFIX -w /root -u 0:0
```

## Configuración avanzada

### Variables de entorno

```bash
# Cambiar el directorio de caché
export TERMUX_CACHE=~/.mi-cache

# Cambiar el prefix de Termux (si es necesario)
export PREFIX=/data/data/com.termux/files/usr
```

### Personalizar herramientas

Edita el script para añadir o modificar herramientas:

```bash
nano termux-manager

# Busca la sección "install_community_tool()"
# Añade nuevas opciones
```

## Seguridad

⚠️ **Advertencias importantes:**

1. **No ejecutes código no verificado** - Solo instala paquetes de repositorios oficiales
2. **Ten cuidado con herramientas de penetración** - Úsalas solo con autorización
3. **Respeta la privacidad** - No uses estas herramientas para acceder a sistemas ajenos
4. **Mantén actualizado** - Ejecuta regularmente: `./termux-manager optimize`

## Contribuciones

Para reportar bugs o sugerir mejoras:

1. Abre un issue en GitHub
2. Proporciona detalles del error
3. Incluye la versión de Termux y Android

## Licencia

Este script está disponible bajo la licencia MIT. Úsalo libremente en tus proyectos.

## Recursos adicionales

- [Sitio oficial de Termux](https://termux.com)
- [Wiki de Termux](https://wiki.termux.com)
- [Repositorio de paquetes](https://github.com/termux/termux-packages)
- [Comunidad Termux en Reddit](https://reddit.com/r/termux)
- [Discord de Termux](https://discord.gg/HXpF69X)

## Changelog

### v1.0.0 (2024)
- Versión inicial
- Menú interactivo completo
- Instalación de herramientas básicas
- Herramientas de la comunidad
- Información sobre acceso root
- Optimización del sistema
- Restauración de configuración

---

¡Disfruta de Termux sin root! 🎉

Para más ayuda, ejecuta:
```bash
./termux-manager --help
```
