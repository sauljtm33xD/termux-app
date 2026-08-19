# 🚀 Deployment Guide - URU Personal AI Middleware

## Production Build

El build de producción está en `dist/` y incluye:
- 480 KB JavaScript (Gemini API integrado)
- CSS y HTML optimizados
- Gzip comprimido a 110.7 KB

### Generar build localmente:

```bash
bun install
bun run build
```

Salida: `/dist/`

---

## 1️⃣ **Despliegue Local (Desarrollo)**

### Servir con Python:
```bash
cd dist
python -m http.server 8000
```
Accede: `http://localhost:8000`

### Desde red local (Realme 16 Pro+):
```
http://192.0.2.2:8000
```

---

## 2️⃣ **GitHub Pages (Automático)**

El workflow `.github/workflows/deploy-web.yml` se ejecuta automáticamente cuando haces push a `main`.

**Pasos:**
1. Asegúrate de habilitar GitHub Pages en Settings → Pages
2. Selecciona "Deploy from a branch"
3. Rama: `gh-pages` (creada automáticamente)

**URL pública:**
```
https://sauljtm33xD.github.io/termux-app/
```

---

## 3️⃣ **Netlify (Recomendado)**

### Setup rápido:
```bash
npm install -g netlify-cli
netlify init
```

### Configuración en netlify.toml:
```toml
[build]
command = "bun install && bun run build"
publish = "dist"

[env]
  [env.production]
    VITE_GEMINI_API_KEY = "tu-api-key-aqui"
```

**URL:** `https://uru-middleware.netlify.app`

---

## 4️⃣ **Vercel (Alternativa)**

```bash
npm install -g vercel
vercel
```

**Configuración automática:** Detecta Vite + React

---

## 🔐 **Variables de Entorno**

### Para CI/CD (GitHub Actions):

1. Ve a: Settings → Secrets and variables → Actions
2. Crea secret: `GEMINI_API_KEY`
3. Valor: Tu API key de Gemini

**En tu proyecto local:**
```env
VITE_GEMINI_API_KEY=tu-gemini-api-key-aqui
VITE_APP_URL=http://localhost:5173
```

⚠️ **IMPORTANTE:** Nunca commitees `.env`

---

## 📱 **Mobile Testing**

### Desde Realme 16 Pro+:

**Opción 1: Dev server**
```bash
bun run dev
# Accede: http://192.0.2.2:5173
```

**Opción 2: Production build**
```bash
cd dist
python -m http.server 8000
# Accede: http://192.0.2.2:8000
```

---

## ✅ **Workflow de Deployment**

```
1. Edita código en rama feature
   ↓
2. Push a branch (ej: feature/gemini-integration)
   ↓
3. Crea Pull Request
   ↓
4. GitHub Actions ejecuta CI:
      - Instala dependencias
      - Compila build
      - Verifica output
      - Comenta en PR: ✅ Build Successful
   ↓
5. Merge a `main`
   ↓
6. GitHub Actions ejecuta Deploy:
      - Compila build de producción
      - Sube a GitHub Pages
      - Crea release con artifacts
      - URL pública disponible
```

---

## 🔍 **Verificación**

### Build local funciona:
```bash
bun run build
ls -lh dist/
# dist/index.html               0.47 KB
# dist/assets/index.js          480 KB (gzip: 110.7 KB)
```

### GitHub Actions funciona:
1. Ve a: Actions tab
2. Selecciona "CI - Build & Test" o "Deploy URU Web App"
3. Verifica status (✅ verde)

### App responde:
```bash
curl http://localhost:8000/
# Debe retornar HTML con <title>URU Personal AI Middleware</title>
```

---

## 🆘 **Troubleshooting**

### Error: "VITE_GEMINI_API_KEY not configured"
**Solución:** Crea `.env` localmente con tu API key

### GitHub Pages no actualiza
1. Verifica que el workflow completó exitosamente (Actions tab)
2. Espera 2-3 minutos para propagación
3. Limpia caché: Ctrl+Shift+Delete (Firefox) o Cmd+Shift+Delete (Chrome)

### Mobile no se conecta a dev server
1. Verifica que estén en la misma red
2. Usa IP del servidor: `ipconfig` (Windows) o `ifconfig` (Linux)
3. Abre puerto 5173: `sudo ufw allow 5173`

---

## 📊 **Performance**

- Total build: 480.95 KB (gzip: 110.7 KB)
- Gzip compression: **77% reducción**
- Modules: 1377
- Build time: ~2.8 segundos

---

**Creado:** 2026-08-19  
**Última actualización:** 2026-08-19  
**Status:** ✅ Production Ready
