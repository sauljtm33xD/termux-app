# ⚡ GUÍA COMPLETA: VS Code + MAYORDOMO Swiss Knife
## Desarrollo Rápido, Eficiente y Sin Errores

---

## 📋 TABLA DE CONTENIDOS
1. [Instalación](#instalación)
2. [Configuración VS Code](#configuración-vs-code)
3. [Extensions Recomendadas](#extensions-recomendadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Workflow de Desarrollo](#workflow-de-desarrollo)
6. [Comandos Útiles](#comandos-útiles)
7. [Tips para Evitar Errores](#tips-para-evitar-errores)
8. [Debugging](#debugging)
9. [Git Workflow](#git-workflow)
10. [Deployment](#deployment)

---

## 🛠️ INSTALACIÓN

### **Paso 1: Instalar Requisitos**

#### **Windows:**
```bash
# 1. Instala Node.js LTS
# Descarga: https://nodejs.org/
# Ejecuta el instalador

# 2. Verifica instalación
node --version
npm --version

# 3. Instala Git
# Descarga: https://git-scm.com/download/win

# 4. Instala VS Code
# Descarga: https://code.visualstudio.com/

# 5. Instala Claude Code CLI
npm install -g @anthropic-ai/claude-code
```

#### **Mac:**
```bash
# Usa Homebrew
brew install node
brew install git
brew install --cask visual-studio-code

# Claude Code
npm install -g @anthropic-ai/claude-code
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install nodejs npm git curl

# VS Code
sudo snap install --classic code

# Claude Code
npm install -g @anthropic-ai/claude-code
```

### **Paso 2: Verificar Instalación**

```bash
# En terminal, ejecuta:
node --version      # v16+ (mínimo)
npm --version       # 7+
git --version       # 2.30+
code --version      # 1.80+
claude code --version  # Debe mostrar versión
```

---

## ⚙️ CONFIGURACIÓN VS CODE

### **Paso 1: Abrir VS Code**

```bash
cd /home/user/termux-app
code .
```

### **Paso 2: Settings.json (Configuración Optimal)**

**Ruta:** `File` → `Preferences` → `Settings` → Busca `settings.json` → Abre

Pega esto:

```json
{
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.theme": "One Dark Pro",
    "workbench.colorTheme": "One Dark Pro",
    "workbench.iconTheme": "vscode-icons",
    
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000,
    
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    
    "terminal.integrated.fontSize": 12,
    "terminal.integrated.defaultProfile.windows": "PowerShell",
    "terminal.integrated.defaultProfile.osx": "bash",
    "terminal.integrated.defaultProfile.linux": "bash",
    
    "git.autofetch": true,
    "git.confirmSync": false,
    
    "[html]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[css]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[json]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
}
```

---

## 📦 EXTENSIONS RECOMENDADAS

### **Instalar (Ctrl+Shift+X en VS Code):**

#### **Esenciales:**
1. **Prettier** - Code formatter
   ```
   esbenp.prettier-vscode
   ```
2. **ESLint** - Detecta errores JavaScript
   ```
   dbaeumer.vscode-eslint
   ```
3. **Live Server** - Servidor local
   ```
   ritwickdey.LiveServer
   ```

#### **Para productividad:**
4. **GitLens** - Git integrado
   ```
   eamodio.gitlens
   ```
5. **Thunder Client** - Prueba APIs
   ```
   rangav.vscode-thunder-client
   ```
6. **REST Client** - Request HTTP
   ```
   humao.rest-client
   ```

#### **Para diseño:**
7. **Peacock** - Colores en workspaces
   ```
   johnpapa.vscode-peacock
   ```
8. **Bracket Pair Colorizer**
   ```
   coenraads.bracket-pair-colorizer
   ```

#### **Para Python (si lo necesitas):**
9. **Python**
   ```
   ms-python.python
   ```
10. **Pylance**
    ```
    ms-python.vscode-pylance
    ```

### **Instalación automática:**

```bash
# En terminal de VS Code:
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ritwickdey.LiveServer
code --install-extension eamodio.gitlens
code --install-extension rangav.vscode-thunder-client
```

---

## 📁 ESTRUCTURA DEL PROYECTO

### **Tu proyecto debe verse así:**

```
termux-app/
├── index.html              # Página principal
├── style.css               # Estilos
├── script.js               # Lógica principal
├── app.js                  # Módulos
├── .gitignore              # Archivos a ignorar
├── package.json            # Dependencias (si las hay)
├── README_MAYORDOMO.md     # Documentación
├── ACODE_PROMPT.md         # Guía Acode
├── CONFIGURACION_DESARROLLO.md  # Este archivo
└── .git/                   # Control de versiones
```

### **Para crear .gitignore:**

```bash
# En terminal VS Code (Ctrl+`):
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore
echo ".env" >> .gitignore
```

---

## 🚀 WORKFLOW DE DESARROLLO

### **FLUJO DIARIO:**

#### **1. Mañana - Abrir proyecto**

```bash
# En terminal:
cd /home/user/termux-app
code .
```

#### **2. Iniciar Live Server**

```bash
# En VS Code:
# Click derecho en index.html → "Open with Live Server"
# O: Ctrl+Shift+P → "Live Server: Open with Live Server"

# Abre automáticamente en: http://localhost:5500
```

#### **3. Abrir Console del navegador**

```bash
# En navegador abierto por Live Server:
F12 → Console
```

#### **4. Hacer cambios**

```bash
# Edita archivos (se guardan automáticamente con autoSave)
# El navegador recarga automáticamente (Live Server)
# Ve cambios en tiempo real
```

#### **5. Verificar errores**

```bash
# En Console (F12):
# - Busca errores rojo
# - Warnings amarillo
# - Si hay error, busca línea en código
```

#### **6. Commit cambios**

```bash
# Cuando termines feature:
git add .
git commit -m "feature: descripción clara"
git push -u origin claude/mayordomo-swiss-install-48lre8
```

---

## ⌨️ COMANDOS ÚTILES

### **Atajos VS Code**

| Atajo | Qué hace |
|-------|----------|
| `Ctrl+L` | Nueva pregunta (Claude Code) |
| `Ctrl+K` | Guardar sugerencia (Claude Code) |
| `Ctrl+P` | Buscar archivo |
| `Ctrl+F` | Buscar en archivo |
| `Ctrl+H` | Reemplazar |
| `Ctrl+/` | Comentar línea |
| `Ctrl+Shift+F` | Buscar en proyecto |
| `Ctrl+`` | Abrir Terminal |
| `F12` | DevTools del navegador |
| `Ctrl+S` | Guardar |
| `Ctrl+Z` | Deshacer |
| `Ctrl+Shift+Z` | Rehacer |

### **Terminal Commands**

```bash
# Git
git status                    # Ver cambios
git add .                     # Agregar archivos
git commit -m "mensaje"       # Hacer commit
git push                      # Subir a GitHub
git pull                      # Descargar cambios

# Live Server (alternativa a UI)
python3 -m http.server 8000   # Servidor Python

# Node.js
npm install                   # Instalar dependencias
npm start                     # Iniciar proyecto
npm run dev                   # Desarrollo con watch

# Archivos
ls -la                        # Listar archivos
cd carpeta/                   # Cambiar carpeta
mkdir nueva-carpeta           # Crear carpeta
rm archivo.txt                # Eliminar archivo
```

---

## 🛡️ TIPS PARA EVITAR ERRORES

### **✅ ANTES DE EMPEZAR**

- [ ] Verifica que Live Server esté abierto
- [ ] Abre F12 (DevTools) para ver errores
- [ ] Lee los comentarios en el código
- [ ] Revisa README_MAYORDOMO.md

### **✅ MIENTRAS EDITAS**

```javascript
// ❌ MALO - Sin verificación
let resultado = JSON.parse(data);

// ✅ BIEN - Con try-catch
try {
    let resultado = JSON.parse(data);
} catch(e) {
    console.error('Error al parsear JSON:', e);
}
```

### **✅ JAVASCRIPT - Errores Comunes**

```javascript
// ❌ Olvidar 'const'/'let'
resultado = 5;  // Variable global (malo)

// ✅ Declarar correctamente
const resultado = 5;

// ❌ No verificar null
elemento.innerHTML = data;  // Si data es null → error

// ✅ Verificar primero
if (data) {
    elemento.innerHTML = data;
}

// ❌ Async sin esperar
const datos = fetch(url);  // No espera respuesta

// ✅ Usar await/then
const datos = await fetch(url).then(r => r.json());
```

### **✅ HTML - Errores Comunes**

```html
<!-- ❌ MALO - Sin id/class único -->
<div>Contenido 1</div>
<div>Contenido 2</div>

<!-- ✅ BIEN - Con identificadores únicos -->
<div id="contenido-1">Contenido 1</div>
<div id="contenido-2">Contenido 2</div>

<!-- ❌ MALO - Scripts al final sin atributos -->
<script>
    document.getElementById('elemento').innerHTML = 'test';
</script>

<!-- ✅ BIEN - Verificar que exista -->
<script>
    const elem = document.getElementById('elemento');
    if (elem) {
        elem.innerHTML = 'test';
    }
</script>
```

### **✅ CSS - Errores Comunes**

```css
/* ❌ MALO - Color inválido */
color: blueee;  /* No existe */

/* ✅ BIEN - Color válido */
color: blue;
color: #0000ff;
color: rgb(0, 0, 255);

/* ❌ MALO - Selector muy específico */
#contenedor > div > p > span.texto { }

/* ✅ BIEN - Selectores simples */
.texto { }

/* ❌ MALO - Unidades faltantes */
width: 100;

/* ✅ BIEN - Unidades correctas */
width: 100px;
width: 100%;
```

### **✅ BUENAS PRÁCTICAS**

```bash
# 1. Limpiar cache navegador
Ctrl+Shift+Delete en navegador

# 2. Reiniciar Live Server
Ctrl+Shift+P → "Live Server: Stop Live Server"
Ctrl+Shift+P → "Live Server: Open with Live Server"

# 3. Verificar console
F12 → Console (revisa errores)

# 4. Usar DevTools
F12 → Elements (inspecciona HTML)
F12 → Network (revisa requests)

# 5. Hacer commits pequeños
Mejor: 10 commits pequeños
Peor: 1 commit gigante
```

---

## 🐛 DEBUGGING

### **Paso 1: Abrir DevTools**

```bash
# En navegador: F12 o Ctrl+Shift+I
```

### **Paso 2: Tipos de errores**

| Color | Tipo | Acción |
|-------|------|--------|
| 🔴 Rojo | Error | **FIX INMEDIATO** |
| 🟡 Amarillo | Warning | Revisar (no crítico) |
| ⚪ Blanco | Info | Solo información |

### **Paso 3: Encontrar error**

```javascript
// Agregar logs para debug
console.log('Variable:', miVariable);
console.warn('Advertencia:', algo);
console.error('Error:', problema);

// Usar debugger
debugger;  // Pausa la ejecución aquí
```

### **Paso 4: En DevTools**

1. **Console** → Busca errores rojo
2. **Sources** → Busca archivo en error
3. **Network** → Revisa requests (APIs)
4. **Application** → Revisa localStorage/cookies
5. **Elements** → Inspecciona HTML

---

## 🔄 GIT WORKFLOW

### **Flujo básico:**

```bash
# 1. Ver estado
git status

# 2. Agregar cambios
git add .
# O específico:
git add index.html

# 3. Commit
git commit -m "feat: agregar módulo IA"

# 4. Push
git push -u origin claude/mayordomo-swiss-install-48lre8

# 5. Ver historial
git log --oneline
```

### **Mensajes de commit (IMPORTANTE):**

```bash
# ✅ BIEN
git commit -m "feat: agregar módulo clima"
git commit -m "fix: error en calculadora"
git commit -m "docs: actualizar README"
git commit -m "refactor: limpiar código"
git commit -m "test: agregar tests"

# ❌ MALO
git commit -m "cambios"
git commit -m "fix bug"
git commit -m "actualizaciones varias"
```

### **Tipos de commit:**
- `feat:` Nueva característica
- `fix:` Arreglar bug
- `docs:` Documentación
- `style:` Formato (sin cambio funcional)
- `refactor:` Reorganizar código
- `test:` Agregar tests
- `chore:` Tareas mantenimiento

---

## 🚀 DEPLOYMENT

### **Opción 1: GitHub Pages (Recomendado)**

```bash
# 1. En GitHub, ve a Settings
# 2. GitHub Pages → Source → main (o master)
# 3. URL: https://tu-usuario.github.io/termux-app

# Listo, tu app está en línea
```

### **Opción 2: Netlify (Gratis y fácil)**

```bash
# 1. Ve a netlify.com
# 2. Conecta tu GitHub
# 3. Selecciona repositorio
# 4. Deploy automático en cada push

# URL: https://mayordomo-swiss.netlify.app
```

### **Opción 3: Servidor Personal**

```bash
# En tu servidor:
git clone https://github.com/tu-usuario/termux-app
cd termux-app
python3 -m http.server 8000

# Accede en: http://tu-servidor:8000
```

---

## 📋 CHECKLIST DIARIO

### **Antes de empezar:**
- [ ] `cd /home/user/termux-app`
- [ ] `code .`
- [ ] Abre Live Server (Click derecho index.html)
- [ ] Abre DevTools (F12)
- [ ] Revisa git status

### **Mientras trabajas:**
- [ ] Guarda archivos (Ctrl+S)
- [ ] Verifica errores en Console (F12)
- [ ] Prueba en navegador
- [ ] Haz commits pequeños

### **Al terminar:**
- [ ] `git status`
- [ ] `git add .`
- [ ] `git commit -m "descripción clara"`
- [ ] `git push`
- [ ] Verifica PR en GitHub

---

## 🚨 ERRORES MÁS COMUNES Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|----------|
| "Cannot read property X" | Variable undefined | Verifica que existe antes |
| "Unexpected token" | Sintaxis incorrecta | Revisa llaves, paréntesis |
| "404 not found" | Archivo no existe | Verifica ruta en HTML |
| "CORS error" | API bloqueada | Usa proxy o API con CORS |
| "Port 5500 in use" | Puerto ocupado | `code --list-extensions` |

---

## 📚 RECURSOS ÚTILES

- **MDN Web Docs:** https://developer.mozilla.org/
- **JavaScript.info:** https://javascript.info/
- **CSS Tricks:** https://css-tricks.com/
- **Stack Overflow:** https://stackoverflow.com/
- **GitHub Docs:** https://docs.github.com/

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Configura VS Code con esta guía
2. ✅ Instala todas las extensions
3. ✅ Abre el proyecto en VS Code
4. ✅ Inicia Live Server
5. ✅ Comienza a desarrollar
6. ✅ Haz commits frecuentes
7. ✅ Push a GitHub

---

**¡Listo para desarrollar MAYORDOMO sin errores!** 🚀

Cualquier duda: `F12` → `Console` → Lee el error → Busca en Google → Pide ayuda

---

*Última actualización: 2026-07-23*
*Hecho con ❤️ para desarrollo rápido y eficiente*