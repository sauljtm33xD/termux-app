#!/usr/bin/env python3
"""
APK Builder Pro - Interfaz Web Ultrasiimple
Solo: 1) Subir proyecto 2) Compilar 3) Descargar APK
"""

from flask import Flask, render_template_string, jsonify, request, send_file
from flask_cors import CORS
import subprocess
import os
import shutil
import threading
import time
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Estado
state = {
    "status": "ready",  # ready, building, success, error
    "progress": 0,
    "message": "",
    "logs": [],
    "apk_path": None,
    "error": None
}

# Rutas
PROJECTS_DIR = Path("/tmp/apk_builder_projects")
PROJECTS_DIR.mkdir(exist_ok=True)

# ============================================================================
# HTML - INTERFAZ MINIMALISTA
# ============================================================================

HTML = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APK Builder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }

        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 10px;
            font-size: 2em;
        }

        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
            font-size: 1em;
        }

        .step {
            margin-bottom: 30px;
        }

        .step-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            font-size: 1.1em;
        }

        .upload-area {
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8f9ff;
        }

        .upload-area:hover {
            background: #f0f2ff;
            border-color: #764ba2;
        }

        .upload-area.dragging {
            background: #e8ebff;
            border-color: #764ba2;
        }

        #fileInput {
            display: none;
        }

        .upload-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .upload-text {
            color: #667;
            font-size: 0.95em;
        }

        .file-info {
            background: #f0f2ff;
            border-left: 4px solid #667eea;
            padding: 12px;
            border-radius: 4px;
            margin-top: 12px;
            display: none;
        }

        .file-info.show {
            display: block;
        }

        .file-name {
            color: #333;
            font-weight: 500;
            font-size: 0.95em;
        }

        .file-size {
            color: #666;
            font-size: 0.85em;
            margin-top: 4px;
        }

        .btn {
            display: block;
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-secondary {
            background: #f0f2ff;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .btn-secondary:hover:not(:disabled) {
            background: #667eea;
            color: white;
        }

        .status-box {
            background: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }

        .status-box.show {
            display: block;
        }

        .status-box.success {
            background: #f0fdf4;
            border-left-color: #22c55e;
        }

        .status-box.error {
            background: #fef2f2;
            border-left-color: #ef4444;
        }

        .status-label {
            font-weight: 600;
            margin-bottom: 8px;
        }

        .status-box.success .status-label {
            color: #15803d;
        }

        .status-box.error .status-label {
            color: #991b1b;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s ease;
        }

        .status-text {
            font-size: 0.9em;
            margin-top: 8px;
            color: #666;
        }

        .logs {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 12px;
            display: none;
            line-height: 1.4;
        }

        .logs.show {
            display: block;
        }

        .log-line {
            margin: 2px 0;
        }

        .log-success { color: #4ec9b0; }
        .log-error { color: #f48771; }
        .log-info { color: #9cdcfe; }
        .log-warning { color: #dcdcaa; }

        .buttons-group {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }

        .buttons-group .btn {
            flex: 1;
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 1.5em;
            }

            .buttons-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 APK Builder</h1>
        <p class="subtitle">Compila tu proyecto Android fácilmente</p>

        <!-- PASO 1: Subir proyecto -->
        <div class="step">
            <div class="step-title">1️⃣ Subir Proyecto</div>
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📦</div>
                <div class="upload-text">
                    Haz clic aquí o arrastra tu proyecto (ZIP o carpeta)
                </div>
            </div>
            <div class="file-info" id="fileInfo">
                <div class="file-name" id="fileName"></div>
                <div class="file-size" id="fileSize"></div>
            </div>
            <input type="file" id="fileInput" accept=".zip">
        </div>

        <!-- PASO 2: Compilar -->
        <div class="step">
            <div class="step-title">2️⃣ Compilar</div>
            <button class="btn btn-primary" id="buildBtn" disabled>
                ▶️ Iniciar Compilación
            </button>
        </div>

        <!-- Estado -->
        <div class="status-box" id="statusBox">
            <div class="status-label" id="statusLabel">Compilando...</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="status-text" id="statusText"></div>
            <div class="logs" id="logs"></div>
        </div>

        <!-- PASO 3: Descargar -->
        <div class="step" style="margin-top: 30px;">
            <div class="step-title">3️⃣ Descargar APK</div>
            <button class="btn btn-secondary" id="downloadBtn" disabled>
                ⬇️ Descargar APK
            </button>
        </div>
    </div>

    <script>
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const buildBtn = document.getElementById('buildBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const statusBox = document.getElementById('statusBox');
        const statusLabel = document.getElementById('statusLabel');
        const statusText = document.getElementById('statusText');
        const progressFill = document.getElementById('progressFill');
        const logs = document.getElementById('logs');

        let uploadedFile = null;

        // Upload
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragging');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragging');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragging');
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });

        function handleFile(file) {
            uploadedFile = file;
            fileName.textContent = file.name;
            fileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
            fileInfo.classList.add('show');
            buildBtn.disabled = false;
        }

        // Build
        buildBtn.addEventListener('click', () => {
            if (!uploadedFile) return;

            const formData = new FormData();
            formData.append('file', uploadedFile);

            statusBox.classList.add('show');
            statusLabel.textContent = 'Compilando...';
            statusBox.className = 'status-box show';
            buildBtn.disabled = true;
            downloadBtn.disabled = true;
            logs.classList.add('show');
            logs.innerHTML = '';

            fetch('/api/build', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(data => {
                updateStatus(data);
                pollStatus();
            })
            .catch(err => {
                statusLabel.textContent = '❌ Error';
                statusBox.className = 'status-box show error';
                addLog('❌ Error al iniciar compilación: ' + err, 'error');
                buildBtn.disabled = false;
            });
        });

        function pollStatus() {
            fetch('/api/status')
            .then(r => r.json())
            .then(data => {
                updateStatus(data);

                if (data.status === 'building' || data.status === 'ready') {
                    setTimeout(pollStatus, 500);
                }
            });
        }

        function updateStatus(data) {
            progressFill.style.width = data.progress + '%';
            statusText.textContent = data.message;

            if (data.status === 'success') {
                statusLabel.textContent = '✅ Compilación Exitosa';
                statusBox.className = 'status-box show success';
                downloadBtn.disabled = false;
                buildBtn.disabled = false;
                addLog('✅ Compilación completada', 'success');
            } else if (data.status === 'error') {
                statusLabel.textContent = '❌ Error en Compilación';
                statusBox.className = 'status-box show error';
                buildBtn.disabled = false;
                if (data.error) addLog('Error: ' + data.error, 'error');
            } else if (data.status === 'building') {
                statusLabel.textContent = '⏳ Compilando...';
                statusBox.className = 'status-box show';
            }

            if (data.logs && data.logs.length > 0) {
                data.logs.forEach(log => {
                    if (!logs.innerHTML.includes(log)) {
                        addLog(log);
                    }
                });
            }
        }

        function addLog(text, type = 'info') {
            const line = document.createElement('div');
            line.className = 'log-line log-' + type;
            line.textContent = text;
            logs.appendChild(line);
            logs.scrollTop = logs.scrollHeight;
        }

        // Download
        downloadBtn.addEventListener('click', () => {
            fetch('/api/download')
            .then(r => r.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'app.apk';
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                alert('Error al descargar APK: ' + err);
            });
        });
    </script>
</body>
</html>
"""

# ============================================================================
# RUTAS API
# ============================================================================

@app.route('/')
def index():
    return render_template_string(HTML)

@app.route('/api/status')
def get_status():
    return jsonify(state)

@app.route('/api/build', methods=['POST'])
def build():
    """Subir proyecto y compilar"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file'}), 400

        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'No filename'}), 400

        # Limpiar proyectos anteriores
        for item in PROJECTS_DIR.iterdir():
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()

        # Guardar archivo
        file_path = PROJECTS_DIR / file.filename
        file.save(str(file_path))

        state['status'] = 'building'
        state['progress'] = 10
        state['message'] = 'Proyecto subido'
        state['logs'] = ['📦 Proyecto recibido']
        state['error'] = None

        # Compilar en background
        threading.Thread(target=compile_project, args=(file_path,), daemon=True).start()

        return jsonify({'status': 'building'})
    except Exception as e:
        state['status'] = 'error'
        state['error'] = str(e)
        return jsonify({'error': str(e)}), 400

def compile_project(file_path):
    """Compilar proyecto"""
    try:
        project_dir = PROJECTS_DIR / 'project'

        # Extraer si es ZIP
        if str(file_path).endswith('.zip'):
            state['logs'].append('📂 Extrayendo proyecto...')
            state['progress'] = 20

            import zipfile
            with zipfile.ZipFile(file_path, 'r') as z:
                z.extractall(project_dir)
            file_path.unlink()
        else:
            project_dir.mkdir(exist_ok=True)

        state['logs'].append('🔨 Iniciando compilación con Gradle...')
        state['progress'] = 30

        # Compilar
        result = subprocess.run(
            ['bash', '-c', 'cd {} && ./gradlew assembleDebug'.format(project_dir)],
            capture_output=True,
            text=True,
            timeout=600
        )

        state['progress'] = 70
        state['logs'].append('🔍 Buscando APK...')

        # Buscar APK
        apk_files = list(project_dir.glob('**/app-debug.apk'))

        if apk_files:
            state['apk_path'] = str(apk_files[0])
            state['progress'] = 100
            state['message'] = '✅ Listo para descargar'
            state['logs'].append('✅ APK generado exitosamente')
            state['status'] = 'success'
        else:
            raise Exception('APK no encontrado después de compilación')

    except Exception as e:
        state['status'] = 'error'
        state['error'] = str(e)
        state['logs'].append('❌ Error: ' + str(e))

@app.route('/api/download')
def download():
    """Descargar APK"""
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

# ============================================================================
# INICIO
# ============================================================================

if __name__ == '__main__':
    print("""
╔════════════════════════════════════════════╗
║   🎯 APK Builder - Interfaz Simplificada  ║
╚════════════════════════════════════════════╝

✅ Servidor en http://localhost:5000

Pasos simples:
  1️⃣  Subir proyecto (ZIP)
  2️⃣  Compilar
  3️⃣  Descargar APK

Ctrl+C para detener
    """)
    app.run(host='localhost', port=5000, debug=False)
