# 📱 APK Builder

**Compilador de APK local. Sin web, sin confusión.**

---

## 🚀 Uso

### Opción 1: Bash
```bash
chmod +x build.sh
./build.sh .
```

### Opción 2: Python
```bash
python3 apk_builder.py .
```

---

## 📋 3 Intervenciones del Usuario

1. **Ejecutar**: `./build.sh .`
2. **Confirmar**: Presiona Enter cuando pregunte
3. **Listo**: APK descargado como `app.apk`

---

## ✅ Eso es todo

Sin opciones.
Sin configuraciones.
Sin web.

Solo: **Compilar → Descargar**

---

## 📝 Ejemplo

```
$ ./build.sh

==========================================
📱 APK Builder
==========================================

📁 Ruta del proyecto: .

Compilando...

✓ APK encontrado: ./app/build/outputs/apk/debug/app-debug.apk
✓ Guardado como: app.apk

✅ Listo
```

---

## 🛠️ Requisitos

- Bash (para build.sh) o Python3 (para apk_builder.py)
- Android SDK
- Gradle (en tu proyecto)

---

**¡Simplemente compila tu APK!** 🚀
