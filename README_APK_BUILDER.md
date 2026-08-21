# 📱 APK Builder

**Compilador de APK local. Sin web, sin confusión.**

---

## 🚀 Uso

### Opción 1: Bash (Más simple)
```bash
chmod +x build.sh
./build.sh
```

### Opción 2: Python
```bash
python3 apk_builder.py
```

---

## 📋 Pasos

1. Ejecuta el script
2. Introduce la ruta de tu proyecto Android
3. Espera a que compile
4. El APK se guarda como `app.apk`

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
