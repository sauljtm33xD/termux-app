#!/usr/bin/env python3
import asyncio
import sys
import os
from pathlib import Path
from download_engine import DownloadEngine
from config import config

class CLIProgressBar:
    def __init__(self, total, width=50):
        self.total = total
        self.width = width
        self.current = 0

    def update(self, current):
        self.current = current
        percent = current / self.total if self.total > 0 else 0
        filled = int(self.width * percent)
        bar = '█' * filled + '░' * (self.width - filled)
        sys.stdout.write(f'\r[{bar}] {percent*100:.1f}%')
        sys.stdout.flush()

async def main():
    if len(sys.argv) < 2:
        print("FastDL CLI - Descargador Ultrarrápido")
        print("\nUso: python -m src.cli <URL> [opciones]")
        print("\nEjemplos:")
        print("  python -m src.cli https://ejemplo.com/archivo.zip")
        print("  python -m src.cli https://ejemplo.com/archivo.zip -o ~/Descargas")
        print("  python -m src.cli https://ejemplo.com/archivo.zip -c 4")
        print("\nOpciones:")
        print("  -o, --output    Carpeta de descargas (default: ~/Downloads)")
        print("  -c, --connections  Conexiones paralelas (default: 8)")
        print("  -h, --help      Mostrar esta ayuda")
        return

    url = sys.argv[1]

    output_dir = config.download_folder
    connections = config.max_parallel_connections

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] in ['-o', '--output']:
            output_dir = Path(sys.argv[i+1]).expanduser()
            i += 2
        elif sys.argv[i] in ['-c', '--connections']:
            connections = int(sys.argv[i+1])
            i += 2
        elif sys.argv[i] in ['-h', '--help']:
            print("FastDL CLI")
            print("Uso: python -m src.cli <URL> [opciones]")
            return
        else:
            i += 1

    engine = DownloadEngine(config)
    engine.config.max_parallel_connections = connections
    engine.config.download_folder = output_dir

    print(f"📥 FastDL CLI - Descargador Ultrarrápido")
    print(f"🔗 URL: {url}")
    print(f"📁 Carpeta: {output_dir}")
    print(f"⚡ Conexiones: {connections}")
    print()

    try:
        task = await engine.add_download(url)
        print(f"📄 Archivo: {task.filename}")
        print(f"📊 Tamaño: {task.total_size / (1024*1024):.2f} MB\n")

        progress_bar = CLIProgressBar(task.total_size)

        def on_progress(progress):
            progress_bar.update(progress.downloaded)

        engine.progress_callback = on_progress

        await engine.download_file(task)

        print(f"\n\n✅ ¡Descarga completada!")
        print(f"💾 Guardado en: {task.output_path}")

    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
