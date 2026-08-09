# 🔧 MAYORDOMO Swiss Knife — Guía de Acode

## ¿Qué es esto?

Una aplicación full-stack desarrollada en Acode que funciona 100% en tu Android. Herramientas para:
- **RED**: Escaneo de puertos, análisis de DNS, geolocalización
- **SISTEMA**: Info de dispositivo, storage, procesos, batería
- **IA**: Chat integrado con Claude, análisis de texto
- **OSINT**: Búsqueda de información pública, verificación de datos
- **TOOLS**: Conversores, generadores, utilidades

## Instalación en Acode

### Opción 1: Desde cero en Acode
```
1. Abre Acode
2. Crear proyecto → "Web Project" (HTML/CSS/JS)
3. Copiar el contenido de:
   - index.html
   - style.css
   - script.js
   - app.js
4. Guardar archivos
5. Presionar "Run" (Play) para ver en vivo
```

### Opción 2: Abrir archivos del repo
```
1. Acode → Abrir carpeta
2. Seleccionar /home/user/termux-app
3. Editar los archivos .html, .css, .js
4. Guardar (Ctrl+S)
5. Run en vivo
```

## Estructura de archivos

```
mayordomo-swiss/
├── index.html          # Estructura HTML
├── style.css           # Diseño responsive
├── script.js           # Lógica principal
├── app.js              # Módulos (RED, SISTEMA, etc)
└── README.md           # Documentación
```

## Cómo usar cada módulo

### RED
- Input: IP o dominio
- Output: Puertos abiertos, DNS, geolocalización
- Nota: Requiere APIs (ipapi.co, publicapis.io)

### SISTEMA
- Muestra: RAM, storage, versión Android, batería
- Actualiza en tiempo real
- No requiere permisos especiales

### OSINT
- Búsqueda de info pública
- Verificación de emails/usuarios
- Análisis de redes sociales (mediante APIs)

### IA
- Integración con Claude API (requiere key)
- Chat en vivo
- Análisis de textos

### TOOLS
- Conversores: Base64, JSON, Hex, RGB
- Generadores: QR, hash, UUID
- Calculadora científica

## Desarrollo en Acode

### Guardar cambios
- Presionar **Ctrl+S** después de editar
- El archivo se guarda automáticamente en el proyecto

### Ver cambios en tiempo real
- Presionar **"Run"** (botón Play)
- El navegador interno de Acode recarga la página

### Debug
- Abrir Developer Console: Menú → DevTools (o Ctrl+Shift+I)
- Ver errores de JavaScript
- Inspeccionar elementos HTML

### Probar con datos reales
- Para RED: Usa IPs públicas (8.8.8.8, 1.1.1.1)
- Para OSINT: Prueba con emails reales
- Para TOOLS: Convierte datos de ejemplo

## Notas importantes

⚠️ **APIs necesarias:**
- OpenWeather (clima)
- IPApi (geolocalización)
- RandomUser (generador de datos)
- Claude API (si quieres IA)

✅ **Funciona sin conexión:** Algunos módulos (TOOLS, SISTEMA) funcionan offline

🔒 **Privacidad:** Los datos NO se envían a servidores externos (excepto APIs)

## Commits y seguimiento

Después de cambios significativos:
```bash
git add .
git commit -m "Feature: descripción"
git push -u origin claude/mayordomo-swiss-install-48lre8
```

## ¡Listo para comenzar!

Los archivos están listos en el repo. Abre Acode y empieza a desarrollar. 🚀
