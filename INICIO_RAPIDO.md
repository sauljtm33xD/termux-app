# ⚡ INICIO RÁPIDO - 5 MINUTOS

## 🚀 **Para usuarios de Windows**

### **Paso 1: Descarga e instala Node.js**
- Ve a: https://nodejs.org/
- Descarga versión **LTS** (Long Term Support)
- Ejecuta el instalador (siguiente, siguiente, finalizar)
- Reinicia tu PC

### **Paso 2: Abre PowerShell**
- Haz clic derecho en la carpeta del proyecto
- Selecciona **"Open PowerShell here"**

### **Paso 3: Ejecuta el script de setup**
```powershell
.\setup-windows.bat
```

### **Paso 4: ¡Listo!**
- Se abre VS Code automáticamente
- Haz clic derecho en `index.html`
- Selecciona **"Open with Live Server"**
- ¡A desarrollar! 🎉

---

## 🍎 **Para usuarios de Mac**

### **Paso 1: Instala Homebrew** (si no lo tienes)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### **Paso 2: Abre Terminal**
```bash
cd ruta/de/tu/proyecto
```

### **Paso 3: Ejecuta el script**
```bash
chmod +x setup-linux-mac.sh
./setup-linux-mac.sh
```

### **Paso 4: ¡Listo!**
```bash
code .
```

---

## 🐧 **Para usuarios de Linux**

### **Paso 1: Abre Terminal**

### **Paso 2: Instala Node.js (si no lo tienes)**
```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

### **Paso 3: Navega a tu proyecto**
```bash
cd ruta/de/tu/proyecto
```

### **Paso 4: Ejecuta setup**
```bash
chmod +x setup-linux-mac.sh
./setup-linux-mac.sh
```

### **Paso 5: ¡Listo!**
```bash
code .
```

---

## 📝 **Lo que hace el setup automático**

✅ Verifica Node.js, Git, VS Code  
✅ Instala Claude Code CLI  
✅ Configura VS Code óptimamente  
✅ Instala 6 extensions recomendadas  
✅ Crea acceso directo en Escritorio  

---

## 🎮 **Después del setup - Workflow diario**

### **Opción A: Desde Escritorio (Windows)**
1. Doble clic en **"iniciar-mayordomo.bat"**
2. Se abre VS Code
3. Live Server inicia automáticamente
4. ¡A trabajar!

### **Opción B: Desde Terminal**
```bash
cd /ruta/del/proyecto
code .
```

### **Opción C: Desde VS Code**
1. Abre VS Code
2. File → Open Folder → Selecciona proyecto
3. Clic derecho en `index.html` → "Open with Live Server"

---

## ⌨️ **Atajos que necesitas**

| Atajo | Qué hace |
|-------|----------|
| `Ctrl+L` | Pregunta a Claude Code |
| `Ctrl+K` | Guarda sugerencia de Claude |
| `Ctrl+P` | Busca archivo |
| `Ctrl+F` | Busca en archivo |
| `F12` | Abre DevTools (ver errores) |
| `Ctrl+`` | Abre terminal en VS Code |

---

## 🛡️ **Si algo no funciona...**

### **"Node.js no está instalado"**
→ Descárgalo en https://nodejs.org/

### **"Port 5500 already in use"**
→ Cierra VS Code y abre de nuevo

### **"Setup.bat no se ejecuta"**
→ Abre PowerShell como Administrador
→ Ejecuta: `Set-ExecutionPolicy RemoteSigned`
→ Luego: `.\setup-windows.bat`

### **"No veo cambios en el navegador"**
→ Presiona F5 en el navegador
→ O: Ctrl+Shift+Delete (limpia cache)

### **Error en Console (F12)**
→ Lee el error rojo
→ Busca en Google: "[tu-error]"
→ O pregunta a Claude Code: `Ctrl+L`

---

## 📚 **Documentación completa**

Si necesitas más detalles:
→ Lee: **CONFIGURACION_DESARROLLO.md**

Si tienes dudas de Acode:
→ Lee: **ACODE_PROMPT.md**

Funcionalidades de MAYORDOMO:
→ Lee: **README_MAYORDOMO.md**

---

## ✅ **Checklist de setup**

- [ ] Node.js instalado
- [ ] Proyecto descargado
- [ ] Setup ejecutado
- [ ] VS Code abierto
- [ ] Live Server iniciado
- [ ] DevTools visible (F12)
- [ ] Navegador en localhost:5500
- [ ] Listo para desarrollar

---

## 🎯 **Próximos pasos después del setup**

1. **Lee CONFIGURACION_DESARROLLO.md** (5 min)
2. **Abre el proyecto en VS Code**
3. **Inicia Live Server**
4. **Abre DevTools (F12)**
5. **Comienza a editar archivos**
6. **Los cambios aparecen en vivo**
7. **Haz commits con Git**
8. **Push a GitHub**

---

## 💡 **Tips de oro**

1. **DevTools es tu mejor amigo** → F12 siempre
2. **Guarda frecuentemente** → Ctrl+S
3. **Haz commits pequeños** → No commits gigantes
4. **Lee los errores** → Console te dice qué está mal
5. **Google es tu aliado** → "error en javascript" + tu error

---

## 🚀 **¡Listo!**

Ya tienes todo configurado. Ahora:

```bash
code .
# Clic derecho en index.html → Open with Live Server
# ¡A codear!
```

**¿Preguntas?** Lee CONFIGURACION_DESARROLLO.md o pregunta a Claude Code con `Ctrl+L`

---

*Setup simplificado para que empieces en 5 minutos* ⚡
