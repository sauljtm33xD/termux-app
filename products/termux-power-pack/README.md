# Termux Power Pack

Ocho scripts de automatización para Termux, escritos para resolver
problemas reales todos los días: backups, limpieza de espacio, SSH,
diagnóstico de red, actualizaciones y organización de archivos.

Sin dependencias raras, sin telemetría, sin nada que no puedas leer en
dos minutos. Cada script tiene un modo seguro por defecto cuando borra
o sobrescribe algo.

## Contenido

| Script | Qué hace |
|---|---|
| `backup-termux.sh` | Backup completo de `$HOME` + manifiesto de paquetes instalados (pkg/pip/npm/gem) |
| `restore-termux.sh` | Restaura un backup generado por el script anterior |
| `net-doctor.sh` | Diagnóstico de red en 5 pasos: conectividad, DNS, IP pública, latencia, ruta |
| `update-all.sh` | Actualiza pkg, pip, npm y gem en un solo comando (con `--dry-run`) |
| `storage-cleaner.sh` | Encuentra cachés y archivos grandes que puedes borrar (modo seguro por defecto, `--apply` para borrar) |
| `ssh-quick.sh` | Deja un servidor SSH funcionando en Termux con clave generada automáticamente |
| `media-organizer.sh` | Ordena una carpeta de descargas en subcarpetas por tipo y mes |
| `system-info.sh` | Panel de batería, almacenamiento, memoria y red en una sola pantalla |

## Instalación

```bash
cd termux-power-pack
chmod +x install.sh
./install.sh
```

Esto copia todos los scripts a `~/bin` y los deja ejecutables. Si
`~/bin` no está en tu `PATH`, el instalador te dice exactamente qué
línea añadir a tu `~/.bashrc`.

## Uso

```bash
system-info.sh                 # panel de estado
net-doctor.sh                  # diagnóstico de red
backup-termux.sh               # backup a ~/storage/shared/TermuxBackups
update-all.sh --dry-run        # ver qué se actualizaría sin tocar nada
storage-cleaner.sh             # ver qué se podría borrar (no borra nada)
storage-cleaner.sh --apply     # borrar de verdad lo anterior
media-organizer.sh ~/downloads # ordenar descargas por tipo y mes
ssh-quick.sh                   # servidor SSH listo en segundos
```

Cada script acepta `-h`/sin argumentos de forma segura y explica su
uso en la cabecera del archivo — ábrelo con `cat` o cualquier editor
si quieres ver exactamente qué hace antes de ejecutarlo. Esa
transparencia es intencional.

## Requisitos

- Termux (de F-Droid o GitHub Releases; evita builds viejas de Play
  Store).
- `termux-setup-storage` ejecutado una vez si vas a usar
  `backup-termux.sh` o `media-organizer.sh` sobre `~/storage/shared`.
- Opcional: `termux-api` (paquete) + la app Termux:API para que
  `system-info.sh` muestre el estado de la batería.

## Licencia de uso

Ver `LICENSE-COMMERCIAL.txt`. En resumen: licencia de un solo usuario,
puedes usar y modificar los scripts libremente para ti, no puedes
redistribuir ni revender el pack tal cual.

## Soporte

Si algo no funciona en tu dispositivo o versión de Termux, abre el
script correspondiente — son menos de 80 líneas cada uno — y ajusta lo
que necesites. Están escritos para ser legibles y modificables, no
como una caja negra.
