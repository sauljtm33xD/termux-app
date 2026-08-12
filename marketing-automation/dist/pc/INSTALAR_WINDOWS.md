# 💻 Marketing Automation - Instalación en Windows

## Versión: 1.0.0
## Fecha: 2026-08-12

---

## 🚀 Opción 1: Instalador EXE (RECOMENDADO)

### Paso 1: Descargar
- Descarga: `Marketing-Automation-Setup-v1.0.0.exe`

### Paso 2: Ejecutar instalador
1. Haz doble clic en `Marketing-Automation-Setup-v1.0.0.exe`
2. Sigue los pasos del asistente
3. Selecciona la carpeta de instalación (por defecto: `C:\Program Files\MarketingAutomation`)
4. El instalador creará:
   - Acceso directo en menú Inicio
   - Acceso directo en Escritorio
   - Entrada en Panel de Control

### Paso 3: Ejecutar
- Desde el menú Inicio: `Marketing Automation` > `Marketing Automation`
- O desde el escritorio: Doble clic en el icono
- O desde Ejecutar: `C:\Program Files\MarketingAutomation\Marketing-Automation-v1.0.0.exe`

---

## 🖥️ Opción 2: Ejecución Directa (SIN INSTALACIÓN)

### Paso 1: Descargar archivo ZIP
```
marketing-automation-portable-v1.0.0.zip
```

### Paso 2: Extraer
```
Haz clic derecho > Extraer aquí
O usa 7-Zip / WinRAR / cualquier gestor de archivos
```

### Paso 3: Ejecutar
```
Doble clic en: Marketing-Automation-v1.0.0.exe
```

**Ventaja:** Sin instalación, sin permisos de administrador

---

## ⚙️ Requisitos del Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **Windows** | XP SP3 | 7 SP1 o superior |
| **Procesador** | Pentium 4 | Core i5 o superior |
| **RAM** | 512 MB | 2 GB o superior |
| **Disco** | 200 MB libre | 500 MB libre |
| **Puertos** | 5001, 3000 | No en uso |

---

## 🔐 Credenciales de Prueba

```
Email:    test@email.com
Password: 123456
```

---

## ✨ Características

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de campañas
- ✅ Gestión de contactos
- ✅ Analytics con gráficos
- ✅ Autenticación JWT segura
- ✅ Interfaz web moderna
- ✅ API REST completa

---

## 🎯 Acceso Rápido

### Después de instalar:

1. **Interfaz Web**
   - URL: `http://localhost:3000`
   - Automáticamente se abre en el navegador

2. **API Backend**
   - URL: `http://localhost:5001/api`
   - Documentación: `http://localhost:5001/docs`

3. **Puertos utilizados**
   - Backend: `5001`
   - Web: `3000`

---

## 🔄 Desinstalar

### Opción 1: Panel de Control (Recomendado)
1. Abre `Panel de Control`
2. Busca `Marketing Automation`
3. Haz clic en `Desinstalar`
4. Confirma la desinstalación

### Opción 2: Carpeta de instalación
1. Abre la carpeta: `C:\Program Files\MarketingAutomation`
2. Ejecuta: `uninstall.exe`
3. Confirma la desinstalación

---

## 🔧 Solución de Problemas

### Problema: "No se abre el navegador"
```
Solución:
1. Espera 5 segundos después de ejecutar
2. Abre manualmente: http://localhost:3000
3. Si no carga, verifica que no hay otro proceso en puerto 3000
```

### Problema: "Puerto 5001 ya está en uso"
```
Solución:
1. Abre Símbolo del sistema (cmd.exe)
2. Ejecuta: netstat -ano | findstr :5001
3. Encontrar el PID
4. Ejecuta: taskkill /PID [PID] /F
5. Reinicia la aplicación
```

### Problema: "Windows muestra aviso de seguridad"
```
Solución:
1. Haz clic en "Más información"
2. Haz clic en "Ejecutar de todas formas"

Nota: El aviso aparece porque el EXE está sin firmar digitalmente.
Para firmar: Requiere certificado de seguridad (opcional)
```

### Problema: "Error de permisos"
```
Solución:
1. Ejecuta como administrador
2. Haz clic derecho en el EXE
3. Selecciona "Ejecutar como administrador"
```

### Problema: "Base de datos vacía"
```
Solución:
1. Los datos se almacenan en: backend/marketing.db
2. Para resetear: Elimina el archivo database
3. Reinicia la aplicación

Se creará una nueva base de datos vacía.
```

---

## 📊 Estructura de Instalación

```
C:\Program Files\MarketingAutomation\
├── Marketing-Automation-v1.0.0.exe     ← Aplicación principal
├── launch-pc.bat                        ← Script de inicio alternativo
├── uninstall.exe                        ← Desinstalador
│
├── backend/
│   ├── app.py                           ← API Flask (Puerto 5001)
│   ├── requirements.txt
│   └── marketing.db                     ← Base de datos SQLite
│
└── web/
    ├── build/
    │   ├── index.html
    │   ├── static/
    │   │   ├── css/
    │   │   └── js/
    │   └── favicon.ico
    └── package.json
```

---

## 🚀 Uso Típico

1. **Inicia la aplicación**
   ```
   Doble clic en: Marketing-Automation-v1.0.0.exe
   ```

2. **El navegador se abre automáticamente**
   ```
   http://localhost:3000
   ```

3. **Login**
   ```
   Email: test@email.com
   Password: 123456
   ```

4. **Comienza a usar**
   - Dashboard: Ver estadísticas
   - Campaigns: Crear/editar campañas
   - Contacts: Gestionar contactos
   - Analytics: Ver gráficos

5. **Cierra la aplicación**
   ```
   Cierra la ventana de navegador
   O presiona Ctrl+C en la consola
   ```

---

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas (bcrypt)
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Base de datos local (SQLite)
- ✅ Sin conexión a servidores externos

---

## 📝 Notas Importantes

1. **Primera ejecución**
   - Puede tardar 5-10 segundos en iniciarse
   - Espera a que se abra la ventana del navegador

2. **Cierre correcto**
   - Cierra primero el navegador
   - Luego cierra la consola (si está visible)

3. **Puertos**
   - Si los puertos 5001 o 3000 están ocupados, cierra el programa que los usa
   - O edita los puertos en `backend/app.py` y `web/build/index.html`

4. **Base de datos**
   - Primera ejecución crea `backend/marketing.db`
   - No requiere instalación de SQL Server ni PostgreSQL
   - SQLite está incluido

5. **Actualizaciones**
   - Desinstala la versión anterior
   - Instala la nueva versión
   - Los datos se conservan en `backend/marketing.db`

---

## 💻 Línea de Comandos

### Ejecutar desde CMD/PowerShell

```bash
# Ir a la carpeta de instalación
cd C:\Program Files\MarketingAutomation

# Ejecutar el EXE
.\Marketing-Automation-v1.0.0.exe

# O usar el script batch
.\launch-pc.bat
```

---

## 📊 Requisitos de Puertos

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| **3000** | Web | Interfaz web (navegador) |
| **5001** | API | Backend Flask |

**Nota:** Ambos puertos deben estar libres. Si están ocupados, la aplicación no funcionará.

---

## 🆘 Soporte Técnico

**Si tienes problemas:**

1. Verifica que tienes Windows XP SP3 o superior
2. Asegúrate de tener permiso de administrador
3. Comprueba que los puertos 3000 y 5001 están libres
4. Revisa los logs en la consola
5. Intenta reinstalar la aplicación

---

## 📚 Documentación Adicional

- `../apk/README.md` - Versión Android
- `../../PLAN_DESARROLLO.md` - Roadmap de features
- `../../ACODE_PROMPT.md` - Desarrollo en Acode
- `../../README.md` - Overview general

---

**✅ Marketing Automation para Windows - v1.0.0**
**Listo para instalar en Windows 7 SP1 o superior**

Fecha: 2026-08-12
Tamaño: ~7.4 MB (EXE) / ~200 MB (Instalador completo)
