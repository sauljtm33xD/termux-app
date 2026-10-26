# Termux Pro Kit — 10 scripts listos para usar

Convierte tu teléfono Android en un mini servidor y entorno de desarrollo en minutos.

## Requisitos
- Termux instalado desde F-Droid (no la versión vieja de Play Store).
- Para el script 10 y el 06 (batería): app Termux:API.

## Instalación
```bash
pkg install -y unzip
unzip termux-pro-kit.zip && cd termux-kit/scripts
chmod +x *.sh
./01-setup-inicial.sh
```

## Scripts
| # | Script | Qué hace |
|---|--------|----------|
| 01 | setup-inicial | Actualiza e instala git, python, node, ssh, jq y más |
| 02 | backup | Respalda tu HOME comprimido en el almacenamiento |
| 03 | ssh-servidor | Entra a tu teléfono desde la PC por SSH |
| 04 | entorno-python | Crea un proyecto Python con venv |
| 05 | git-config | Configura git y genera tu llave SSH |
| 06 | info-sistema | Memoria, disco, batería y red |
| 07 | limpieza | Libera caché de pkg, pip y npm |
| 08 | servidor-web | Comparte una carpeta por Wi‑Fi |
| 09 | alias-utiles | Atajos de terminal cómodos |
| 10 | recordatorio-bateria | Notificación de batería baja |

## Consejos
- Lee cada script antes de ejecutarlo: son cortos y están comentados.
- Los scripts no envían datos a ningún servidor.
- Hecho por Norxtec. Úsalo bajo tu propia responsabilidad.
