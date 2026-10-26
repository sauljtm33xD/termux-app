# Cheatsheet: Termux + Linux + Git (español)

## Termux básico
| Qué quieres | Comando |
|---|---|
| Actualizar todo | `pkg update -y && pkg upgrade -y` |
| Instalar / quitar | `pkg install nombre` / `pkg uninstall nombre` |
| Buscar paquete | `pkg search palabra` |
| Acceso a /sdcard | `termux-setup-storage` |
| Mantener despierto | `termux-wake-lock` |
| Portapapeles | `termux-clipboard-get` / `termux-clipboard-set "texto"` |
| Notificación | `termux-notification -t "Título" -c "texto"` |
| Batería | `termux-battery-status` |
| Abrir archivo/URL | `termux-open archivo` / `termux-open-url https://...` |
Nota: los comandos `termux-*` (menos setup-storage) requieren la app Termux:API instalada.

## Navegación y archivos
`pwd` ubicación · `ls -lah` listar · `cd -` carpeta anterior · `mkdir -p a/b/c` crear árbol
`cp -r a b` copiar · `mv a b` mover/renombrar · `rm -r carpeta` borrar (¡sin papelera!)
`find . -name "*.txt"` buscar nombre · `grep -rn "texto" .` buscar contenido
`du -sh *` peso por carpeta · `df -h` disco · `tar -czf a.tar.gz carpeta` · `tar -xzf a.tar.gz`
`chmod +x script.sh` hacer ejecutable · `ln -s destino enlace` enlace simbólico

## Texto y tuberías
`cat f` · `less f` (q salir) · `head -n 20 f` · `tail -f log` seguir log
`cmd | grep x` filtrar · `cmd > f` sobrescribir · `cmd >> f` agregar · `cmd 2>&1` unir errores
`sort | uniq -c | sort -nr` conteo de repetidos · `wc -l f` contar líneas
`sed 's/viejo/nuevo/g' f` reemplazar · `awk '{print $1}' f` primera columna

## Procesos y red
`ps aux | grep x` · `kill PID` · `kill -9 PID` forzar · `htop` monitor
`ip a` interfaces · `curl -I url` solo cabeceras · `curl -O url` descargar
`ssh usuario@host -p 8022` · `scp archivo usuario@host:ruta` · `python -m http.server 8080`

## SSH desde la PC a Termux
1. En Termux: `pkg install openssh && passwd && sshd` (puerto 8022)
2. Usuario: `whoami` · IP: `ip a`
3. En la PC: `ssh usuario@IP -p 8022`

## Git del día a día
| Acción | Comando |
|---|---|
| Clonar | `git clone url` |
| Estado | `git status -sb` |
| Preparar todo | `git add -A` |
| Confirmar | `git commit -m "mensaje"` |
| Subir / bajar | `git push` / `git pull` |
| Rama nueva | `git switch -c nombre` |
| Cambiar rama | `git switch nombre` |
| Historial | `git log --oneline --graph -15` |
| Ver cambios | `git diff` (sin preparar) · `git diff --staged` |
| Deshacer archivo | `git restore archivo` |
| Quitar del staging | `git restore --staged archivo` |
| Corregir último commit | `git commit --amend` (solo si no lo subiste) |
| Guardar a medias | `git stash` / `git stash pop` |
| Traer una rama | `git merge rama` |
| Revertir commit ya subido | `git revert HASH` |

Configuración inicial: `git config --global user.name "Tu Nombre"` y `git config --global user.email tu@correo`.
Token en vez de contraseña: GitHub → Settings → Developer settings → Personal access tokens.

## tmux (multitarea en una terminal)
Prefijo `Ctrl+b`, luego: `c` nueva ventana · `n`/`p` siguiente/anterior · `%` dividir vertical · `"` dividir horizontal · `d` salir sin cerrar · `tmux attach` volver.

## Errores comunes
- *Permission denied*: falta `chmod +x` o `termux-setup-storage`.
- *command not found*: `pkg install` del paquete o revisa el `PATH`.
- *Could not resolve host*: sin internet o falla el DNS; prueba `ping 8.8.8.8`.
- Se cierra Termux en segundo plano: `termux-wake-lock` y desactiva la optimización de batería para la app.
