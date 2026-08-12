#!/usr/bin/env python3
"""
Marketing Automation - Windows Launcher
Inicia el backend Flask y abre la interfaz web en el navegador
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

class MarketingAutomationLauncher:
    def __init__(self):
        # Detectar ubicación del script
        if getattr(sys, 'frozen', False):
            # Si está compilado con PyInstaller
            self.script_dir = Path(sys.executable).parent
        else:
            # Si se ejecuta directamente
            self.script_dir = Path(__file__).parent

        self.project_dir = self.script_dir
        self.backend_dir = self.project_dir / 'backend'
        self.web_dir = self.project_dir / 'web'
        self.backend_port = 5001
        self.web_port = 3000

    def log(self, message):
        """Imprimir mensaje de log"""
        timestamp = time.strftime('%H:%M:%S')
        print(f'[{timestamp}] {message}')

    def check_backend_ready(self, max_retries=10):
        """Verificar que el backend está listo"""
        import socket

        for i in range(max_retries):
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('localhost', self.backend_port))
                sock.close()

                if result == 0:
                    self.log('✅ Backend listo')
                    return True
            except:
                pass

            time.sleep(1)

        return False

    def start_backend(self):
        """Iniciar servidor Flask"""
        self.log('Iniciando Backend...')

        if not self.backend_dir.exists():
            self.log('❌ Directorio backend no encontrado')
            return None

        app_py = self.backend_dir / 'app.py'
        if not app_py.exists():
            self.log(f'❌ Archivo {app_py} no encontrado')
            return None

        try:
            # Iniciar backend en proceso separado
            process = subprocess.Popen(
                [sys.executable, str(app_py)],
                cwd=str(self.backend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == 'win32' else 0
            )
            self.log(f'Backend iniciado (PID: {process.pid})')
            return process
        except Exception as e:
            self.log(f'❌ Error iniciando backend: {e}')
            return None

    def open_web_interface(self):
        """Abrir interfaz web en navegador"""
        self.log('Abriendo interfaz web...')

        url = f'http://localhost:{self.web_port}'

        try:
            # Abrir navegador
            webbrowser.open(url, new=2)
            self.log(f'✅ Navegador abierto: {url}')
        except Exception as e:
            self.log(f'❌ Error abriendo navegador: {e}')
            self.log(f'Abre manualmente: {url}')

    def check_web_static_files(self):
        """Verificar que los archivos estáticos existen"""
        build_dir = self.web_dir / 'build'

        if build_dir.exists():
            self.log('✅ Archivos web encontrados')
            return True

        self.log('⚠️  Archivos web no compilados')
        self.log('   Usando servidor de desarrollo')
        return False

    def start_web_server(self):
        """Iniciar servidor web (Python HTTP server)"""
        self.log('Iniciando servidor web...')

        build_dir = self.web_dir / 'build'

        if not build_dir.exists():
            self.log('❌ Directorio build no encontrado')
            return None

        try:
            import http.server
            import socketserver

            os.chdir(str(build_dir))

            handler = http.server.SimpleHTTPRequestHandler
            httpd = socketserver.TCPServer(("", self.web_port), handler)

            self.log(f'✅ Servidor web en puerto {self.web_port}')

            # Iniciar servidor en hilo
            import threading
            thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            thread.start()

            return httpd
        except Exception as e:
            self.log(f'❌ Error iniciando servidor web: {e}')
            return None

    def run(self):
        """Ejecutar la aplicación completa"""
        print('\n' + '='*60)
        print('🚀 Marketing Automation - Sistema Completo')
        print('='*60 + '\n')

        # Iniciar backend
        backend_process = self.start_backend()

        # Esperar a que el backend esté listo
        time.sleep(2)

        if not self.check_backend_ready():
            self.log('⚠️  Backend no respondió, continuando...')

        # Verificar archivos web
        has_static = self.check_web_static_files()

        if has_static:
            # Iniciar servidor web
            web_server = self.start_web_server()
            time.sleep(1)

        # Abrir navegador
        self.open_web_interface()

        print('\n' + '='*60)
        print('✅ Sistema iniciado')
        print('='*60)
        print('\n📱 Acceso:')
        print(f'   🌐 Web:   http://localhost:{self.web_port}')
        print(f'   🔧 API:   http://localhost:{self.backend_port}')
        print('\n🔐 Credenciales de prueba:')
        print('   Email: test@email.com')
        print('   Pass:  123456')
        print('\n💡 Para cerrar: Cierra todas las ventanas')
        print('='*60 + '\n')

        # Mantener el programa ejecutándose
        try:
            if backend_process:
                backend_process.wait()
        except KeyboardInterrupt:
            self.log('\n⏹️  Deteniendo...')
            if backend_process:
                backend_process.terminate()
                backend_process.wait(timeout=5)
            print('✅ Cerrado')

if __name__ == '__main__':
    launcher = MarketingAutomationLauncher()
    launcher.run()
