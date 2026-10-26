# Termux Power Pack

Instalador de un solo comando con 7 herramientas listas para usar en Termux.

## Instalación
```bash
bash install.sh
```
Cierra y abre Termux, luego escribe `tp-help`.

## Incluye
| Comando | Qué hace |
|---|---|
| `tp-sysinfo` | Batería, memoria, disco y red |
| `tp-ip` | IP local y pública |
| `tp-serve [dir]` | Comparte una carpeta por Wi-Fi con código QR |
| `tp-backup` | Respalda `$HOME` a `/sdcard/termux-backups` |
| `tp-clean` | Libera caché y temporales |
| `tp-note` | Notas rápidas con fecha |
| `tp-help` | Lista de comandos |

Además: prompt a color, alias útiles (`ll`, `gs`, `gl`, `update`) y configuración de tmux con mouse.

Probado con `bash -n`; los scripts que usan la red o `/sdcard` requieren correr en Termux real.
