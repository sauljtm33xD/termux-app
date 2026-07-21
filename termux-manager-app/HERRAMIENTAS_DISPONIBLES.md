# 📚 Termux Manager - Guía Completa de 100+ Herramientas

**Versión:** 2.0  
**Herramientas:** 100+  
**Categorías:** 10

---

## 📋 Tabla de Contenidos

1. [Utilidades de Red](#utilidades-de-red)
2. [Herramientas de Seguridad](#herramientas-de-seguridad)
3. [Desarrollo de Software](#desarrollo-de-software)
4. [Multimedia](#multimedia)
5. [Base de Datos](#base-de-datos)
6. [Utilidades del Sistema](#utilidades-del-sistema)
7. [Servidores Web](#servidores-web)
8. [Herramientas Móviles](#herramientas-móviles)
9. [Machine Learning / IA](#machine-learning--ia)
10. [Otras Herramientas](#otras-herramientas)

---

## 🌐 Utilidades de Red

| Herramienta | Descripción | Uso |
|---|---|---|
| **nmap** | Escaneo de puertos y mapeo de redes | `nmap 192.168.1.0/24` |
| **netcat** | Swiss army knife de la red | `nc -l -p 1234` |
| **tcpdump** | Captura de paquetes de red | `tcpdump -i eth0` |
| **openssh** | Cliente y servidor SSH | `ssh user@host` |
| **curl** | Cliente HTTP/HTTPS versátil | `curl https://example.com` |
| **wget** | Descargador de archivos | `wget https://file.tar.gz` |
| **whois** | Información de dominios | `whois example.com` |
| **dig/nslookup** | Consultas DNS | `dig example.com` |
| **telnet** | Conexiones telnet | `telnet 192.168.1.1 23` |
| **socat** | Herramienta de red versátil | `socat - TCP:example.com:80` |
| **iptables** | Firewall Linux | `iptables -A INPUT -p tcp --dport 22 -j ACCEPT` |
| **aircrack-ng** | Cracking de redes WiFi | `aircrack-ng -w dict.txt wifi.cap` |

---

## 🔒 Herramientas de Seguridad

| Herramienta | Descripción | Uso |
|---|---|---|
| **hashcat** | Cracking de hashes | `hashcat -m 0 hashes.txt wordlist.txt` |
| **hydra** | Ataque por fuerza bruta | `hydra -l user -P pass.txt ssh://target` |
| **john** | Cracking de contraseñas | `john --wordlist=words.txt hashes.txt` |
| **sqlmap** | Detección de SQL injection | `sqlmap -u "url" --dbs` |
| **metasploit** | Framework de penetración | `msfconsole` |
| **burpsuite** | Proxy de testing web | `burpsuite` |
| **nikto** | Scanner de servidores web | `nikto -h target.com` |
| **w3af** | Framework de ataque web | `w3af` |
| **ettercap** | Sniffer y MITM | `ettercap -G` |
| **kismet** | Detector de redes WiFi | `kismet` |
| **wireshark** | Análisis de paquetes | `wireshark` |
| **openssl** | Herramientas criptográficas | `openssl genrsa -out key.pem 2048` |
| **gpg** | Encriptación GPG | `gpg --encrypt file.txt` |
| **tor** | Red de anonimato | `tor` |
| **privoxy** | Proxy de privacidad | `privoxy` |

---

## 💻 Desarrollo de Software

### Lenguajes de Programación

| Lenguaje | Descripción | Comando |
|---|---|---|
| **golang** | Lenguaje Go compilado | `go run main.go` |
| **rust** | Lenguaje Rust seguro | `rustc main.rs` |
| **python** | Lenguaje Python | `python script.py` |
| **php** | Lenguaje PHP | `php -S localhost:8000` |
| **nodejs** | Runtime JavaScript | `node script.js` |
| **ruby** | Lenguaje Ruby dinámico | `ruby script.rb` |
| **lua** | Lenguaje Lua ligero | `lua script.lua` |
| **perl** | Lenguaje Perl versátil | `perl script.pl` |
| **java** | Lenguaje Java | `java -jar app.jar` |
| **clang** | Compilador C/C++ | `clang main.c -o app` |

### Herramientas de Desarrollo

| Herramienta | Descripción | Uso |
|---|---|---|
| **git** | Control de versiones | `git clone repository` |
| **svn** | Sistema de versiones | `svn checkout url` |
| **mercurial** | Control de versiones | `hg clone url` |
| **cmake** | Sistema de construcción | `cmake .` |
| **make** | Automatización de compilación | `make` |
| **gradle** | Build automation | `gradle build` |
| **maven** | Build automation Java | `mvn clean install` |
| **npm** | Gestor de paquetes JS | `npm install` |
| **pip** | Gestor de paquetes Python | `pip install package` |
| **vim** | Editor de texto avanzado | `vim file.txt` |
| **nano** | Editor de texto simple | `nano file.txt` |

---

## 🎬 Multimedia

| Herramienta | Descripción | Uso |
|---|---|---|
| **ffmpeg** | Procesamiento multimedia | `ffmpeg -i input.mp4 output.mp3` |
| **imagemagick** | Edición de imágenes | `convert input.png -resize 800x600 output.png` |
| **graphicsmagick** | Manipulación de gráficos | `gm convert image.jpg output.png` |
| **sox** | Audio processing | `sox input.wav output.mp3` |
| **mpv** | Reproductor multimedia | `mpv video.mp4` |
| **vlc** | Reproductor multimedia VLC | `vlc video.mp4` |
| **exiftool** | Lectura de metadatos | `exiftool photo.jpg` |
| **mediainfo** | Información de media | `mediainfo video.mp4` |
| **youtube-dl** | Descargador de videos | `youtube-dl "https://youtube.com/..."` |
| **handbrake** | Conversor de video | `HandBrakeCLI -i input.mkv -o output.mp4` |

---

## 💾 Base de Datos

| Base de Datos | Descripción | Tipo | Puerto |
|---|---|---|---|
| **postgresql** | Base de datos SQL avanzada | SQL | 5432 |
| **mariadb** | Fork de MySQL | SQL | 3306 |
| **sqlite** | Base de datos embebida | SQL | - |
| **mongodb** | Base de datos NoSQL | NoSQL | 27017 |
| **redis** | Cache en memoria | NoSQL | 6379 |
| **couchdb** | Base de datos documental | NoSQL | 5984 |
| **influxdb** | Series temporales | Time-series | 8086 |
| **neo4j** | Base de datos de grafos | Graph | 7687 |

---

## 🛠️ Utilidades del Sistema

| Herramienta | Descripción | Uso |
|---|---|---|
| **tmux** | Multiplexor de terminal | `tmux new-session -s dev` |
| **htop** | Monitor de procesos mejorado | `htop` |
| **iotop** | Monitor de I/O | `iotop` |
| **nethogs** | Monitor de red por proceso | `nethogs` |
| **ncdu** | Analizador de disco | `ncdu /` |
| **tree** | Visualizador de árbol | `tree -L 2` |
| **midnight-commander** | Gestor de archivos TUI | `mc` |
| **ranger** | Explorador de archivos | `ranger` |
| **fzf** | Buscador fuzzy | `fzf` |
| **ripgrep** | Búsqueda rápida en archivos | `rg "pattern"` |
| **ag** | The Silver Searcher | `ag "pattern"` |
| **fd** | Alternativa moderna a find | `fd "pattern"` |
| **bat** | Lector de archivos mejorado | `bat file.txt` |
| **exa** | Alternativa moderna a ls | `exa -la` |
| **tldr** | Páginas de manual simplificadas | `tldr ls` |

---

## 🌍 Servidores Web

| Servidor | Descripción | Puerto |
|---|---|---|
| **nginx** | Servidor web de alto rendimiento | 80, 443 |
| **apache** | Servidor web Apache | 80, 443 |
| **nodejs** | Servidor Node.js | 3000 |
| **python-http** | Servidor HTTP Python | 8000 |
| **php-server** | Servidor PHP | 8000 |
| **caddy** | Servidor web moderno | 80, 443 |
| **lighttpd** | Servidor web ligero | 80 |
| **thttpd** | Servidor HTTP tiny | 80 |

---

## 📱 Herramientas Móviles

| Herramienta | Descripción | Uso |
|---|---|---|
| **adb** | Android Debug Bridge | `adb shell` |
| **scrcpy** | Espejo de pantalla Android | `scrcpy` |
| **apksigner** | Firmador de APK | `apksigner sign app.apk` |
| **aapt** | Herramienta de paquetes Android | `aapt dump badging app.apk` |
| **dex2jar** | Convertidor DEX a JAR | `d2j-dex2jar app.apk` |
| **apktool** | Descompilador de APK | `apktool d app.apk` |
| **frida** | Instrumentación dinámica | `frida -U app.name` |
| **androidsdk** | SDK de Android | `android` |

---

## 🤖 Machine Learning / IA

| Librería | Descripción | Tipo |
|---|---|---|
| **tensorflow** | Framework de Deep Learning | DL |
| **pytorch** | Framework de DL flexible | DL |
| **scikit-learn** | Machine Learning | ML |
| **pandas** | Análisis de datos | Data |
| **numpy** | Computación numérica | Math |

---

## 📚 Cómo Usar Termux Manager

### Instalación de herramientas individuales

```bash
# Abrir el menú principal
termux-manager

# Seleccionar categoría (ej: 2 para Seguridad)
# Luego seleccionar herramienta (ej: 2 para hydra)
```

### Instalar paquete recomendado (top 30)

```bash
termux-manager

# Seleccionar opción 99
```

### Instalar desde línea de comandos

```bash
# Para herramientas individuales
apt install <herramienta>

# Ej:
apt install golang
apt install rust
apt install postgresql
```

---

## 🎯 Recomendaciones por uso

### Para Programadores
1. git
2. nodejs
3. python
4. golang
5. rust
6. vim
7. tmux

### Para Pentesting
1. nmap
2. hydra
3. hashcat
4. sqlmap
5. burpsuite
6. metasploit
7. nikto

### Para DevOps
1. docker
2. kubernetes
3. terraform
4. ansible
5. jenkins
6. nginx
7. postgresql

### Para Multimedia
1. ffmpeg
2. imagemagick
3. youtube-dl
4. sox
5. exiftool

### Para Administración de Sistemas
1. htop
2. tmux
3. tree
4. ncdu
5. iotop
6. ranger

---

## 💡 Consejos

✅ **Instala lo básico primero:**
```bash
termux-manager
# Opción 1: Instalar herramientas básicas
```

✅ **Agrupa por proyecto:**
```bash
# Web development
apt install nodejs npm git vim

# Python development
apt install python pip git vim

# Database work
apt install postgresql redis sqlite
```

✅ **Crea alias útiles:**
```bash
echo 'alias tm="termux-manager"' >> ~/.bashrc
echo 'alias top="htop"' >> ~/.bashrc
source ~/.bashrc
```

✅ **Actualiza regularmente:**
```bash
apt update && apt upgrade -y
```

---

## 📊 Estadísticas

- **Total de herramientas:** 100+
- **Categorías:** 10
- **Lenguajes de programación:** 10
- **Herramientas de seguridad:** 15+
- **Bases de datos:** 8
- **Utilidades:** 50+

---

## 🔗 Recursos

- [Sitio oficial Termux](https://termux.com)
- [Paquetes disponibles](https://wiki.termux.com/wiki/Package_Management)
- [Documentación oficial](https://wiki.termux.com)

---

**Versión:** 2.0.0  
**Última actualización:** Julio 2024  
**Licencia:** MIT

¡Disfruta de Termux Manager! 🚀
