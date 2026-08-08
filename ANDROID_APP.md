# FastDL - App Android

Descargador ultrarrápido nativo para Android con interfaz moderna en Jetpack Compose.

## 🎯 Características

✅ **Descargas Paralelas**: Hasta 8 conexiones simultáneas  
✅ **Interfaz Moderna**: Jetpack Compose + Material Design 3  
✅ **Monitoreo en Tiempo Real**: Velocidad, progreso, tiempo restante  
✅ **Multitarea**: Descargas simultáneas  
✅ **Bajo Consumo**: CPU y RAM optimizados  
✅ **Pausa/Reanuda**: Control total de descargas  
✅ **Tema Automático**: Claro/oscuro según sistema  

## 🏗️ Arquitectura

- **UI**: Jetpack Compose con Material Design 3
- **Networking**: OkHttp con connection pooling
- **Async**: Kotlin Coroutines
- **State Management**: ViewModel + StateFlow
- **Storage**: Carpeta Downloads de Android

## 📊 Especificaciones Técnicas

**Mínimos:**
- Android 8.0 (API 26)
- ~50MB en memoria
- CPU: 2-5% en operación
- RAM: ~100MB en uso

**Óptimo:**
- Android 12+ (API 31+)
- Pantalla 5"+
- Conexión WiFi/4G

## 📦 Módulos

```
app/
├── src/main/
│   ├── kotlin/com/fastdl/app/
│   │   ├── MainActivity.kt           # Actividad principal
│   │   ├── data/DownloadViewModel.kt # Lógica de estado
│   │   ├── repository/DownloadRepository.kt # Gestor de descargas
│   │   ├── model/DownloadItem.kt    # Modelos de datos
│   │   └── ui/DownloadListScreen.kt # Interfaz Compose
│   ├── res/
│   │   ├── values/strings.xml       # Strings
│   │   └── values/themes.xml        # Temas
│   └── AndroidManifest.xml          # Configuración
└── build.gradle                     # Dependencias
```

## 🚀 Compilación

### Requisitos
- Android Studio Flamingo+
- SDK Android 34
- Kotlin 1.9+

### Pasos

1. **Abre en Android Studio**
   ```bash
   git clone -b app-android https://github.com/sauljtm33xD/termux-app.git
   ```

2. **Sincroniza Gradle**
   Android Studio descargará automáticamente las dependencias

3. **Compila**
   - Menú: Build → Build Bundle(s) / APK(s)
   - O: `./gradlew assembleDebug`

4. **Instala**
   - Android Studio: Run → Run 'app'
   - Línea de comandos: `adb install app/build/outputs/apk/debug/app-debug.apk`

## 📱 Uso

1. **Abre la app**
2. **Pega URL** en el campo de entrada
3. **Presiona "Agregar"** o Enter
4. **Presiona el botón "▶"** para descargar
5. **Monitorea** el progreso en tiempo real

### Opciones de Descarga

- **Pausar**: Pausa descarga temporal
- **Reanudar**: Continúa descarga pausada
- **Cancelar**: Cancela y elimina archivo
- **Múltiples**: Agrega varias URLs

## 🔧 Configuración Avanzada

Edita `DownloadRepository.kt`:

```kotlin
private val httpClient = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)  // Timeout
    .readTimeout(30, TimeUnit.SECONDS)
    .build()
```

## 🐛 Solución de Problemas

### "Permission denied" en Downloads
- Verifica permisos en Configuración → Aplicaciones → Permisos

### App se cierra
- Actualiza a versión reciente de Kotlin
- Limpia caché: Build → Clean Project

### Descarga lenta
- Verifica conexión WiFi/datos
- Prueba con otros servidores
- Reinicia la app

## 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| Tamaño APK | ~15MB |
| Permisos | 4 (Internet, Storage, Network) |
| Dependencias | 12 librerías |
| Líneas de código | ~600 |
| Tiempo compilación | 45-60 seg |

## 🔐 Privacidad & Seguridad

✅ No recopila datos personales  
✅ Descargas locales únicamente  
✅ HTTPS soporte completo  
✅ Sin publicidades  
✅ Sin analítica  

## 📝 Licencia

MIT License - Úsalo libremente

## 🤝 Contribuciones

Fork → Branch → Commit → Push → Pull Request

---

**FastDL Android**: Descarga rápido en tu móvil ⚡
