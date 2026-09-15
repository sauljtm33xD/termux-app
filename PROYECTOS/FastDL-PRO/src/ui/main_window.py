import sys
import asyncio
from pathlib import Path
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLineEdit, QTableWidget, QTableWidgetItem, QFileDialog, QMessageBox,
    QProgressBar, QLabel, QSpinBox, QCheckBox, QTabWidget, QGroupBox,
    QFormLayout, QHeaderView, QTextEdit, QComboBox, QListWidget, QListWidgetItem,
    QDialog, QSplitter, QScrollArea
)
from PyQt6.QtCore import Qt, pyqtSignal, QThread, QObject, QTimer, QSize
from PyQt6.QtGui import QFont, QColor, QIcon
from datetime import timedelta
import os
import webbrowser

# Relative imports from parent package
sys.path.insert(0, str(Path(__file__).parent.parent))
from download_engine import DownloadEngine
from batch_downloader import BatchDownloader, BatchDownloadConfig
from torrent_downloader import TorrentDownloader
from web_search import WebSearchEngine


class DownloadWorker(QObject):
    progress_signal = pyqtSignal(dict)
    completed_signal = pyqtSignal(str)

    def __init__(self, engine):
        super().__init__()
        self.engine = engine
        self.loop = None

    def run_downloads(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.engine.progress_callback = self.on_progress
        self.engine.completed_callback = self.on_completed
        self.loop.run_until_complete(self.engine.start_downloads())

    def on_progress(self, progress):
        self.progress_signal.emit({
            'file_name': progress.file_name,
            'downloaded': progress.downloaded,
            'total_size': progress.total_size,
            'speed': progress.speed,
            'elapsed_time': progress.elapsed_time,
            'remaining_time': progress.remaining_time,
            'progress_percent': progress.progress_percent,
            'status': progress.status.value
        })

    def on_completed(self, task):
        self.completed_signal.emit(f"Completado: {task.filename}")


class MainWindow(QMainWindow):
    def __init__(self, engine):
        super().__init__()
        self.engine = engine
        self.batch_downloader = BatchDownloader(engine, BatchDownloadConfig(max_parallel_downloads=4))
        self.torrent_downloader = None
        self.web_search = WebSearchEngine()

        self.download_worker = None
        self.download_thread = None
        self.search_worker = None

        self.init_ui()
        self.setWindowTitle("FastDL PRO - Descargador Ultrarrápido")
        self.setGeometry(100, 100, 1200, 750)

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout()

        tabs = QTabWidget()
        layout.addWidget(tabs)

        # Tabs
        tabs.addTab(self.create_single_download_tab(), "Descarga Individual")
        tabs.addTab(self.create_batch_download_tab(), "Descargas por Lotes")
        tabs.addTab(self.create_torrent_tab(), "Torrent")
        tabs.addTab(self.create_search_tab(), "Búsqueda Web")
        tabs.addTab(self.create_settings_tab(), "Configuración")

        main_widget.setLayout(layout)

    # ============ SINGLE DOWNLOAD TAB ============
    def create_single_download_tab(self):
        widget = QWidget()
        layout = QVBoxLayout()

        url_layout = QHBoxLayout()
        url_label = QLabel("URL:")
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("Ingresa la URL del archivo a descargar...")
        url_layout.addWidget(url_label)
        url_layout.addWidget(self.url_input)
        layout.addLayout(url_layout)

        button_layout = QHBoxLayout()
        self.add_btn = QPushButton("Agregar Descarga")
        self.add_btn.clicked.connect(self.add_download)
        self.start_btn = QPushButton("Iniciar")
        self.start_btn.clicked.connect(self.start_downloads)
        self.start_btn.setEnabled(False)
        self.pause_btn = QPushButton("Pausar")
        self.pause_btn.setEnabled(False)
        self.pause_btn.clicked.connect(self.pause_downloads)
        self.folder_btn = QPushButton("Abrir Carpeta")
        self.folder_btn.clicked.connect(self.open_folder)

        button_layout.addWidget(self.add_btn)
        button_layout.addWidget(self.start_btn)
        button_layout.addWidget(self.pause_btn)
        button_layout.addWidget(self.folder_btn)
        button_layout.addStretch()
        layout.addLayout(button_layout)

        self.download_table = QTableWidget()
        self.download_table.setColumnCount(6)
        self.download_table.setHorizontalHeaderLabels([
            "Archivo", "Progreso", "Descargado", "Velocidad", "Tiempo Restante", "Estado"
        ])
        self.download_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.download_table)

        stats_layout = QHBoxLayout()
        self.total_speed_label = QLabel("Velocidad Total: 0 MB/s")
        self.total_speed_label.setFont(QFont("Arial", 10, QFont.Weight.Bold))
        self.total_time_label = QLabel("Tiempo Total: -")
        stats_layout.addWidget(self.total_speed_label)
        stats_layout.addWidget(self.total_time_label)
        stats_layout.addStretch()
        layout.addLayout(stats_layout)

        widget.setLayout(layout)
        return widget

    # ============ BATCH DOWNLOAD TAB ============
    def create_batch_download_tab(self):
        widget = QWidget()
        layout = QVBoxLayout()

        # URL input area
        input_group = QGroupBox("URLs para Descargar")
        input_layout = QVBoxLayout()

        input_buttons = QHBoxLayout()
        self.load_file_btn = QPushButton("Cargar desde Archivo")
        self.load_file_btn.clicked.connect(self.load_urls_from_file)
        self.paste_btn = QPushButton("Pegar URLs")
        self.paste_btn.clicked.connect(self.paste_urls)
        self.clear_urls_btn = QPushButton("Limpiar Lista")
        self.clear_urls_btn.clicked.connect(self.clear_batch_urls)

        input_buttons.addWidget(self.load_file_btn)
        input_buttons.addWidget(self.paste_btn)
        input_buttons.addWidget(self.clear_urls_btn)
        input_layout.addLayout(input_buttons)

        self.batch_urls_text = QTextEdit()
        self.batch_urls_text.setPlaceholderText("Ingresa URLs (una por línea) o carga desde un archivo...")
        self.batch_urls_text.setMaximumHeight(120)
        input_layout.addWidget(self.batch_urls_text)

        input_group.setLayout(input_layout)
        layout.addWidget(input_group)

        # Batch settings
        settings_group = QGroupBox("Configuración de Lote")
        settings_layout = QHBoxLayout()

        settings_layout.addWidget(QLabel("Descargas Paralelas:"))
        self.batch_parallel_spin = QSpinBox()
        self.batch_parallel_spin.setValue(4)
        self.batch_parallel_spin.setRange(1, 16)
        settings_layout.addWidget(self.batch_parallel_spin)

        self.skip_duplicates_check = QCheckBox("Saltar Duplicados")
        self.skip_duplicates_check.setChecked(True)
        settings_layout.addWidget(self.skip_duplicates_check)

        settings_layout.addStretch()
        settings_group.setLayout(settings_layout)
        layout.addWidget(settings_group)

        # Download button
        download_layout = QHBoxLayout()
        self.batch_download_btn = QPushButton("Descargar Lote")
        self.batch_download_btn.clicked.connect(self.start_batch_download)
        self.batch_status_label = QLabel("Esperando URLs...")
        download_layout.addWidget(self.batch_download_btn)
        download_layout.addWidget(self.batch_status_label)
        layout.addLayout(download_layout)

        # Progress
        self.batch_progress_table = QTableWidget()
        self.batch_progress_table.setColumnCount(5)
        self.batch_progress_table.setHorizontalHeaderLabels([
            "Archivo", "Progreso", "Descargado", "Velocidad", "Estado"
        ])
        layout.addWidget(self.batch_progress_table)

        widget.setLayout(layout)
        return widget

    # ============ TORRENT TAB ============
    def create_torrent_tab(self):
        widget = QWidget()
        layout = QVBoxLayout()

        # Torrent file/magnet input
        torrent_input_layout = QHBoxLayout()
        torrent_label = QLabel("Torrent/Magnet:")
        self.torrent_input = QLineEdit()
        self.torrent_input.setPlaceholderText("Ruta del archivo .torrent o enlace magnet...")
        self.browse_torrent_btn = QPushButton("Examinar")
        self.browse_torrent_btn.clicked.connect(self.browse_torrent)

        torrent_input_layout.addWidget(torrent_label)
        torrent_input_layout.addWidget(self.torrent_input)
        torrent_input_layout.addWidget(self.browse_torrent_btn)
        layout.addLayout(torrent_input_layout)

        # Torrent buttons
        torrent_button_layout = QHBoxLayout()
        self.add_torrent_btn = QPushButton("Agregar Torrent")
        self.add_torrent_btn.clicked.connect(self.add_torrent)
        self.start_torrent_btn = QPushButton("Iniciar Descarga")
        self.start_torrent_btn.setEnabled(False)
        self.start_torrent_btn.clicked.connect(self.start_torrent_download)
        self.pause_torrent_btn = QPushButton("Pausar")
        self.pause_torrent_btn.setEnabled(False)
        self.pause_torrent_btn.clicked.connect(self.pause_torrent)

        torrent_button_layout.addWidget(self.add_torrent_btn)
        torrent_button_layout.addWidget(self.start_torrent_btn)
        torrent_button_layout.addWidget(self.pause_torrent_btn)
        torrent_button_layout.addStretch()
        layout.addLayout(torrent_button_layout)

        # Torrent list
        self.torrent_table = QTableWidget()
        self.torrent_table.setColumnCount(6)
        self.torrent_table.setHorizontalHeaderLabels([
            "Nombre", "Progreso", "Descargado", "Velocidad", "Semillas", "Estado"
        ])
        layout.addWidget(self.torrent_table)

        widget.setLayout(layout)
        return widget

    # ============ WEB SEARCH TAB ============
    def create_search_tab(self):
        widget = QWidget()
        layout = QVBoxLayout()

        # Search input
        search_layout = QHBoxLayout()
        search_label = QLabel("Buscar:")
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Busca archivos, información o recursos en la web...")
        self.search_type_combo = QComboBox()
        self.search_type_combo.addItems(["General", "Archivos", "Imágenes", "Videos", "Repositorios"])

        search_btn = QPushButton("Buscar")
        search_btn.clicked.connect(self.perform_search)

        search_layout.addWidget(search_label)
        search_layout.addWidget(self.search_input)
        search_layout.addWidget(self.search_type_combo)
        search_layout.addWidget(search_btn)
        layout.addLayout(search_layout)

        # Results
        self.search_results_table = QTableWidget()
        self.search_results_table.setColumnCount(4)
        self.search_results_table.setHorizontalHeaderLabels([
            "Título", "Descripción", "Fuente", "URL"
        ])
        self.search_results_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        self.search_results_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.search_results_table.itemClicked.connect(self.on_search_result_selected)

        layout.addWidget(self.search_results_table)

        # Download from search result
        download_layout = QHBoxLayout()
        self.download_from_search_btn = QPushButton("Descargar Seleccionado")
        self.download_from_search_btn.clicked.connect(self.download_search_result)
        self.open_in_browser_btn = QPushButton("Abrir en Navegador")
        self.open_in_browser_btn.clicked.connect(self.open_search_result_browser)

        download_layout.addWidget(self.download_from_search_btn)
        download_layout.addWidget(self.open_in_browser_btn)
        download_layout.addStretch()
        layout.addLayout(download_layout)

        widget.setLayout(layout)
        return widget

    # ============ SETTINGS TAB ============
    def create_settings_tab(self):
        widget = QWidget()
        layout = QFormLayout()

        self.connections_spin = QSpinBox()
        self.connections_spin.setValue(self.engine.config.max_parallel_connections)
        self.connections_spin.setRange(1, 32)
        self.connections_spin.valueChanged.connect(self._update_connections)
        layout.addRow("Conexiones Paralelas:", self.connections_spin)

        self.resume_check = QCheckBox()
        self.resume_check.setChecked(self.engine.config.resume_downloads)
        self.resume_check.toggled.connect(self._update_resume)
        layout.addRow("Reanudar Descargas:", self.resume_check)

        self.folder_label = QLabel(str(self.engine.config.download_folder))
        change_folder_btn = QPushButton("Cambiar Carpeta")
        change_folder_btn.clicked.connect(self.change_download_folder)
        layout.addRow("Carpeta de Descargas:", self.folder_label)
        layout.addRow("", change_folder_btn)

        # Torrent configuration
        torrent_folder_label = QLabel(str(self.engine.config.download_folder / "Torrents"))
        change_torrent_folder_btn = QPushButton("Cambiar Carpeta Torrents")
        change_torrent_folder_btn.clicked.connect(self.change_torrent_folder)
        layout.addRow("Carpeta Torrents:", torrent_folder_label)
        layout.addRow("", change_torrent_folder_btn)

        widget.setLayout(layout)
        return widget

    # ============ SINGLE DOWNLOAD METHODS ============
    def add_download(self):
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "Error", "Por favor ingresa una URL válida")
            return

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            task = loop.run_until_complete(self.engine.add_download(url))
            self.add_table_row(task)
            self.url_input.clear()
            self.start_btn.setEnabled(True)
            QMessageBox.information(self, "Éxito", f"Descarga agregada: {task.filename}")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error al agregar descarga: {e}")
        finally:
            loop.close()

    def add_table_row(self, task):
        row = self.download_table.rowCount()
        self.download_table.insertRow(row)

        self.download_table.setItem(row, 0, QTableWidgetItem(task.filename))

        progress_bar = QProgressBar()
        progress_bar.setValue(0)
        self.download_table.setCellWidget(row, 1, progress_bar)

        self.download_table.setItem(row, 2, QTableWidgetItem("0 B / 0 B"))
        self.download_table.setItem(row, 3, QTableWidgetItem("0 MB/s"))
        self.download_table.setItem(row, 4, QTableWidgetItem("-"))
        self.download_table.setItem(row, 5, QTableWidgetItem("Pendiente"))

    def start_downloads(self):
        self.start_btn.setEnabled(False)
        self.pause_btn.setEnabled(True)
        self.add_btn.setEnabled(False)

        self.download_worker = DownloadWorker(self.engine)
        self.download_worker.progress_signal.connect(self.update_progress)
        self.download_worker.completed_signal.connect(self.on_download_completed)

        self.download_thread = QThread()
        self.download_worker.moveToThread(self.download_thread)
        self.download_thread.started.connect(self.download_worker.run_downloads)
        self.download_thread.start()

    def pause_downloads(self):
        if self.engine.tasks:
            for task in self.engine.tasks:
                if task.status.value == 'downloading':
                    self.engine.pause_download(task)
            self.pause_btn.setText("Reanudar")
            self.pause_btn.clicked.disconnect()
            self.pause_btn.clicked.connect(self.resume_downloads)

    def resume_downloads(self):
        if self.engine.tasks:
            for task in self.engine.tasks:
                if task.status.value == 'paused':
                    self.engine.resume_download(task)
            self.pause_btn.setText("Pausar")
            self.pause_btn.clicked.disconnect()
            self.pause_btn.clicked.connect(self.pause_downloads)

    def update_progress(self, progress_data):
        for row in range(self.download_table.rowCount()):
            if self.download_table.item(row, 0).text() == progress_data['file_name']:
                progress_bar = self.download_table.cellWidget(row, 1)
                progress_bar.setValue(int(progress_data['progress_percent']))

                downloaded = self._format_size(progress_data['downloaded'])
                total = self._format_size(progress_data['total_size'])
                self.download_table.setItem(row, 2, QTableWidgetItem(f"{downloaded} / {total}"))

                speed = self._format_speed(progress_data['speed'])
                self.download_table.setItem(row, 3, QTableWidgetItem(speed))

                remaining = self._format_time(progress_data['remaining_time'])
                self.download_table.setItem(row, 4, QTableWidgetItem(remaining))

                self.download_table.setItem(row, 5, QTableWidgetItem(progress_data['status'].upper()))

                self.total_speed_label.setText(f"Velocidad Total: {speed}")
                break

    def on_download_completed(self, message):
        QMessageBox.information(self, "Descarga Completada", message)

    # ============ BATCH DOWNLOAD METHODS ============
    def load_urls_from_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Selecciona archivo de URLs", "", "Archivos de Texto (*.txt);;Todos (*)")
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    self.batch_urls_text.setText(f.read())
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Error al leer archivo: {e}")

    def paste_urls(self):
        clipboard = sys.clipboard if hasattr(sys, 'clipboard') else None
        if clipboard:
            self.batch_urls_text.setText(clipboard)
        else:
            QMessageBox.info(self, "Información", "Pega las URLs en el área de texto")

    def clear_batch_urls(self):
        self.batch_urls_text.clear()
        self.batch_downloader.clear_urls()

    def start_batch_download(self):
        urls_text = self.batch_urls_text.toPlainText()
        if not urls_text.strip():
            QMessageBox.warning(self, "Error", "Por favor ingresa al menos una URL")
            return

        urls = [line.strip() for line in urls_text.split('\n') if line.strip() and not line.startswith('#')]
        self.batch_downloader.config.max_parallel_downloads = self.batch_parallel_spin.value()
        self.batch_downloader.config.skip_duplicates = self.skip_duplicates_check.isChecked()
        self.batch_downloader.add_urls_from_list(urls)

        self.batch_status_label.setText(f"Descargando {len(urls)} archivos...")
        self.batch_download_btn.setEnabled(False)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self.batch_downloader.download_batch())
            QMessageBox.information(self, "Éxito", "Descarga por lotes completada")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error en descarga por lotes: {e}")
        finally:
            loop.close()
            self.batch_download_btn.setEnabled(True)
            self.batch_status_label.setText(f"Descargados {len(urls)} archivos")

    # ============ TORRENT METHODS ============
    def browse_torrent(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Selecciona archivo .torrent", "", "Archivos Torrent (*.torrent)")
        if file_path:
            self.torrent_input.setText(file_path)

    def add_torrent(self):
        torrent_path = self.torrent_input.text().strip()
        if not torrent_path:
            QMessageBox.warning(self, "Error", "Por favor ingresa una ruta o enlace magnet")
            return

        if not self.torrent_downloader:
            try:
                self.torrent_downloader = TorrentDownloader(self.engine.config.download_folder / "Torrents")
            except ImportError:
                QMessageBox.critical(self, "Error", "libtorrent no está instalado. Instala con: pip install python-libtorrent")
                return

        try:
            torrent_id = self.torrent_downloader.add_torrent(torrent_path)
            self.start_torrent_btn.setEnabled(True)
            self.torrent_input.clear()
            QMessageBox.information(self, "Éxito", "Torrent agregado correctamente")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error al agregar torrent: {e}")

    def start_torrent_download(self):
        if not self.torrent_downloader or not self.torrent_downloader.handles:
            QMessageBox.warning(self, "Error", "No hay torrents agregados")
            return

        self.start_torrent_btn.setEnabled(False)
        self.pause_torrent_btn.setEnabled(True)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            for torrent_id, handle in self.torrent_downloader.handles.items():
                loop.run_until_complete(self.torrent_downloader.download_torrent(str(handle)))
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error en descarga de torrent: {e}")
        finally:
            loop.close()

    def pause_torrent(self):
        if self.torrent_downloader:
            for torrent_id in self.torrent_downloader.handles.keys():
                self.torrent_downloader.pause_torrent(torrent_id)

    # ============ WEB SEARCH METHODS ============
    def perform_search(self):
        query = self.search_input.text().strip()
        if not query:
            QMessageBox.warning(self, "Error", "Por favor ingresa una búsqueda")
            return

        search_type = self.search_type_combo.currentText()
        self.search_results_table.setRowCount(0)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            if search_type == "Archivos":
                results = loop.run_until_complete(self.web_search.search_file_repositories(query))
            elif search_type == "Repositorios":
                results = loop.run_until_complete(self.web_search.search_archive(query))
            else:
                results = loop.run_until_complete(self.web_search.search(query))

            self.search_results = results
            for result in results:
                row = self.search_results_table.rowCount()
                self.search_results_table.insertRow(row)
                self.search_results_table.setItem(row, 0, QTableWidgetItem(result.title))
                self.search_results_table.setItem(row, 1, QTableWidgetItem(result.description))
                self.search_results_table.setItem(row, 2, QTableWidgetItem(result.source))
                self.search_results_table.setItem(row, 3, QTableWidgetItem(result.url))

        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error en búsqueda: {e}")
        finally:
            loop.close()

    def on_search_result_selected(self, item):
        self.selected_search_result = item.row()

    def download_search_result(self):
        if not hasattr(self, 'selected_search_result'):
            QMessageBox.warning(self, "Error", "Por favor selecciona un resultado")
            return

        result = self.search_results[self.selected_search_result]
        self.url_input.setText(result.url)
        self.add_download()

    def open_search_result_browser(self):
        if not hasattr(self, 'selected_search_result'):
            QMessageBox.warning(self, "Error", "Por favor selecciona un resultado")
            return

        result = self.search_results[self.selected_search_result]
        webbrowser.open(result.url)

    # ============ UTILITY METHODS ============
    @staticmethod
    def _format_size(bytes_size):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024
        return f"{bytes_size:.1f} TB"

    @staticmethod
    def _format_speed(bytes_per_sec):
        return MainWindow._format_size(bytes_per_sec) + "/s"

    @staticmethod
    def _format_time(seconds):
        if seconds <= 0:
            return "-"
        return str(timedelta(seconds=int(seconds)))

    def change_download_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Selecciona carpeta de descargas")
        if folder:
            self.engine.config.download_folder = Path(folder)
            self.folder_label.setText(folder)

    def change_torrent_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Selecciona carpeta para torrents")
        if folder and self.torrent_downloader:
            self.torrent_downloader.output_folder = Path(folder)

    def open_folder(self):
        folder = self.engine.config.download_folder
        if sys.platform == 'win32':
            os.startfile(folder)
        elif sys.platform == 'darwin':
            os.system(f'open "{folder}"')
        else:
            os.system(f'xdg-open "{folder}"')

    def _update_connections(self, value):
        self.engine.config.max_parallel_connections = value

    def _update_resume(self, checked):
        self.engine.config.resume_downloads = checked
