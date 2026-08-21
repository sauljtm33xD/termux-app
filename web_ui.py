#!/usr/bin/env python3
"""APK Builder - Interfaz Ultraminimalista"""

from flask import Flask, render_template_string, jsonify, request, send_file
from flask_cors import CORS
import subprocess
import os
import shutil
import threading
from pathlib import Path
import zipfile

app = Flask(__name__)
CORS(app)

# Estado global
state = {
    "building": False,
    "progress": 0,
    "message": "",
    "apk_path": None,
    "error": None
}

WORK_DIR = Path("/tmp/apk_builder")
WORK_DIR.mkdir(exist_ok=True)

HTML = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>APK Builder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 500px;
        }

        h1 {
            text-align: center;
            font-size: 1.5em;
            margin-bottom: 30px;
            color: #333;
        }

        .input-group {
            margin-bottom: 20px;
        }

        input[type="file"] {
            display: block;
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }

        button {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: none;
            border-radius: 4px;
            font-size: 1em;
            cursor: pointer;
            font-weight: bold;
        }

        .btn-build {
            background: #4CAF50;
            color: white;
        }

        .btn-build:hover {
            background: #45a049;
        }

        .btn-build:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .btn-download {
            background: #2196F3;
            color: white;
        }

        .btn-download:hover {
            background: #0b7dda;
        }

        .btn-download:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .status {
            background: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            display: none;
            text-align: center;
        }

        .status.show {
            display: block;
        }

        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            background: #4CAF50;
            width: 0%;
            transition: width 0.3s;
        }

        .message {
            margin: 10px 0;
            font-size: 0.9em;
            color: #666;
        }

        .error {
            color: #d32f2f;
            padding: 10px;
            background: #ffebee;
            border-radius: 4px;
            margin: 10px 0;
            display: none;
        }

        .error.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 APK Builder</h1>

        <div class="input-group">
            <input type="file" id="fileInput" accept=".zip">
        </div>

        <button class="btn-build" id="buildBtn" disabled>Compilar</button>
        <button class="btn-download" id="downloadBtn" disabled>Descargar APK</button>

        <div class="error" id="error"></div>

        <div class="status" id="status">
            <div class="message" id="message"></div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress"></div>
            </div>
        </div>
    </div>

    <script>
        const fileInput = document.getElementById('fileInput');
        const buildBtn = document.getElementById('buildBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const status = document.getElementById('status');
        const message = document.getElementById('message');
        const progress = document.getElementById('progress');
        const errorDiv = document.getElementById('error');

        let selectedFile = null;

        fileInput.addEventListener('change', (e) => {
            selectedFile = e.target.files[0];
            buildBtn.disabled = !selectedFile;
            errorDiv.classList.remove('show');
        });

        buildBtn.addEventListener('click', () => {
            if (!selectedFile) return;

            const formData = new FormData();
            formData.append('file', selectedFile);

            buildBtn.disabled = true;
            downloadBtn.disabled = true;
            errorDiv.classList.remove('show');
            status.classList.add('show');
            message.textContent = 'Compilando...';
            progress.style.width = '0%';

            fetch('/build', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => poll())
                .catch(err => {
                    errorDiv.textContent = 'Error: ' + err;
                    errorDiv.classList.add('show');
                    buildBtn.disabled = false;
                });
        });

        function poll() {
            fetch('/status')
                .then(r => r.json())
                .then(data => {
                    progress.style.width = data.progress + '%';
                    message.textContent = data.message;

                    if (data.error) {
                        errorDiv.textContent = 'Error: ' + data.error;
                        errorDiv.classList.add('show');
                        buildBtn.disabled = false;
                        status.classList.remove('show');
                    } else if (data.building) {
                        setTimeout(poll, 500);
                    } else if (data.progress === 100) {
                        message.textContent = 'Compilación completada ✓';
                        downloadBtn.disabled = false;
                        buildBtn.disabled = false;
                    }
                })
                .catch(() => buildBtn.disabled = false);
        }

        downloadBtn.addEventListener('click', () => {
            fetch('/download')
                .then(r => r.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'app.apk';
                    a.click();
                    URL.revokeObjectURL(url);
                })
                .catch(err => {
                    errorDiv.textContent = 'Error al descargar: ' + err;
                    errorDiv.classList.add('show');
                });
        });
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML)

@app.route('/status')
def get_status():
    return jsonify(state)

@app.route('/build', methods=['POST'])
def build():
    try:
        file = request.files['file']
        if not file:
            return jsonify({'error': 'Sin archivo'}), 400

        # Limpiar
        for item in WORK_DIR.iterdir():
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()

        # Guardar
        zip_path = WORK_DIR / file.filename
        file.save(str(zip_path))

        state['building'] = True
        state['progress'] = 10
        state['message'] = 'Extrayendo...'
        state['error'] = None

        # Compilar en background
        threading.Thread(target=do_build, args=(zip_path,), daemon=True).start()

        return jsonify({'ok': True})
    except Exception as e:
        state['error'] = str(e)
        return jsonify({'error': str(e)}), 400

def do_build(zip_path):
    try:
        project_dir = WORK_DIR / 'project'
        project_dir.mkdir(exist_ok=True)

        # Extraer
        state['progress'] = 20
        state['message'] = 'Extrayendo...'
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(project_dir)

        # Compilar
        state['progress'] = 30
        state['message'] = 'Compilando...'

        result = subprocess.run(
            ['bash', '-c', f'cd {project_dir} && ./gradlew assembleDebug 2>&1'],
            capture_output=True,
            text=True,
            timeout=600
        )

        if result.returncode != 0:
            raise Exception('Compilación fallida')

        # Buscar APK
        state['progress'] = 80
        state['message'] = 'Buscando APK...'

        apk_files = list(project_dir.glob('**/app-debug.apk'))
        if not apk_files:
            raise Exception('APK no encontrado')

        state['apk_path'] = str(apk_files[0])
        state['progress'] = 100
        state['message'] = 'Listo ✓'
        state['building'] = False

    except Exception as e:
        state['error'] = str(e)
        state['building'] = False
        state['message'] = 'Error'

@app.route('/download')
def download():
    try:
        if not state['apk_path'] or not Path(state['apk_path']).exists():
            return jsonify({'error': 'APK no disponible'}), 400

        return send_file(
            state['apk_path'],
            as_attachment=True,
            download_name='app.apk',
            mimetype='application/vnd.android.package-archive'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("APK Builder - http://localhost:5000")
    app.run(host='localhost', port=5000, debug=False)
