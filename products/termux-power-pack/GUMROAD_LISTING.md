# Texto listo para publicar en Gumroad / Ko-fi

Copia y pega cada sección en el campo correspondiente del formulario
de producto.

---

## Nombre del producto

Termux Power Pack — 8 scripts de automatización

## Precio sugerido

$5.00 USD (precio mínimo recomendado; puedes activar "paga lo que
quieras" con $5 como mínimo)

## Descripción corta (para la tarjeta del producto)

8 scripts listos para usar que resuelven lo que de verdad te hace
perder tiempo en Termux: backups, limpieza de espacio, SSH en un
paso, diagnóstico de red y más. Instalación en 30 segundos.

## Descripción larga

**¿Usas Termux a diario y te cansaste de reescribir los mismos
comandos?**

Termux Power Pack junta 8 scripts bash pulidos, comentados y con
modos seguros por defecto, para las tareas que todo usuario de
Termux termina necesitando:

- 📦 **Backup y restauración completos** de tu entorno, con
  manifiesto de paquetes instalados — así nunca pierdes tu setup.
- 🧹 **Limpieza de espacio sin sorpresas**: primero te muestra qué se
  borraría, solo borra de verdad si confirmas con `--apply`.
- 🌐 **Diagnóstico de red en 5 pasos** cuando "no hay internet" y no
  sabes si es el WiFi, el DNS o el operador.
- 🔐 **Servidor SSH funcionando en un comando**, con clave generada
  automáticamente y los datos de conexión en pantalla.
- 🔄 **Actualiza pkg, pip, npm y gem a la vez**, con modo de
  simulación para ver qué cambiaría antes de aplicar nada.
- 🗂️ **Organiza tus descargas** automáticamente por tipo y mes.
- 📊 **Panel de estado** de batería, almacenamiento, memoria y red en
  una sola pantalla.

Cada script tiene menos de 80 líneas, está comentado en español y
pensado para que lo leas y entiendas antes de ejecutarlo — nada de
cajas negras.

**Incluye:**
- Los 8 scripts (`.sh`)
- Instalador automático (`install.sh`)
- Guía de uso (`README.md`)
- Licencia de uso de un solo usuario

**Requisitos:** Termux (de F-Droid o GitHub). Nada más.

## Etiquetas / tags

termux, android, bash, automatizacion, linux, terminal, scripts,
productividad, backup, ssh, sysadmin

## Categoría

Software > Herramientas de desarrollo / Productividad

## FAQ sugerida para la página del producto

**¿Funciona sin rootear el teléfono?**
Sí, todos los scripts usan solo lo que Termux trae por defecto o
paquetes instalables con `pkg install`. No requieren root.

**¿Es seguro ejecutar los scripts que borran archivos?**
`storage-cleaner.sh` y `restore-termux.sh` muestran primero qué harían
y piden confirmación o un flag explícito (`--apply`) antes de borrar
o sobrescribir nada.

**¿Puedo modificarlos?**
Sí, para tu uso personal. Lo único que no puedes hacer es
redistribuir o revender el pack (ver la licencia incluida).
