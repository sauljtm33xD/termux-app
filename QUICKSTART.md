# Inicio Rápido - Termux Manager

## Instalación en 3 pasos

### Paso 1: Descargar el script

```bash
cd $HOME
git clone https://github.com/termux/termux-app.git
cd termux-app
```

O descarga solo el script:

```bash
curl -O https://raw.githubusercontent.com/termux/termux-app/master/termux-manager
chmod +x termux-manager
```

### Paso 2: Ejecutar el script

```bash
./termux-manager
```

### Paso 3: Seleccionar opciones del menú

Elige las herramientas que desees instalar.

---

## Comandos rápidos

Instalar lo esencial en 1 comando:

```bash
./termux-manager install-basic
```

Ver estado del sistema:

```bash
./termux-manager system-info
```

Instalar herramientas de seguridad:

```bash
./termux-manager install-community
# Selecciona 4, 5, 6 para hashcat, hydra, metasploit
```

Optimizar Termux (limpiar, actualizar):

```bash
./termux-manager optimize
```

---

## Primeras herramientas recomendadas

Para la mayoría de usuarios:

```bash
./termux-manager
# 1. Instalar herramientas básicas
# 2. Instalar herramientas de la comunidad
#    - 2 (netcat)
#    - 10 (tmux)
#    - 11 (htop)
```

---

## Obtener acceso root

Ver opciones disponibles:

```bash
./termux-manager root-info
```

Esto mostrará:
- Cómo instalar Magisk
- Alternativas sin Magisk
- Herramientas de escalada (proot, fakeroot)

---

## Solución rápida de problemas

| Problema | Solución |
|----------|----------|
| No hay internet | Verifica tu conexión WiFi/datos |
| Error de permisos | Reinicia Termux y vuelve a intentar |
| Falta espacio | Ejecuta: `./termux-manager optimize` |
| Paquete no encontrado | No está disponible para tu arquitectura |

---

## Siguiente paso

Después de instalar lo básico:

```bash
# Actualizar paquetes
apt update && apt upgrade

# Instalar más herramientas específicas
apt install <nombre-paquete>

# Ver todos los paquetes disponibles
apt search | less
```

---

## Más ayuda

Ver documentación completa:

```bash
cat TERMUX_MANAGER_README.md
```

Visita:
- [Wiki de Termux](https://wiki.termux.com)
- [GitHub](https://github.com/termux/termux-app)
- [Discord](https://discord.gg/HXpF69X)

---

¡Listo! Ya tienes Termux configurado. 🚀
