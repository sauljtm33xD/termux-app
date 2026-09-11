# FastDL PRO - High-Speed PC Downloader

A powerful, multi-feature downloader for Windows, macOS, and Linux with support for individual URLs, batch downloads, torrents, and web search.

## 🚀 Features

### ⚡ Individual Downloads
- Single URL downloads with parallel connections
- 8+ simultaneous connections for maximum WiFi bandwidth
- Resume/pause/cancel functionality
- Real-time speed and ETA tracking

### 📦 Batch Downloads
- Download multiple URLs at once
- Load URLs from text files (one per line)
- Configurable parallel downloads (1-16 simultaneous)
- Duplicate detection
- Progress tracking for entire batch

### 🌐 Torrent Support
- Download .torrent files and magnet links
- qBittorrent integration
- Pause/resume/cancel operations
- Fallback to system default torrent client

### 🔍 Web Search & Discovery
- Search Internet Archive for files
- General web search (DuckDuckGo, Google)
- File repository search
- Verify URL accessibility
- Get file information (size, type, etc.)

### 💻 Modern UI
- PyQt6-based graphical interface
- Clean tabbed design
- Real-time progress bars and statistics
- Cross-platform (Windows, macOS, Linux)

## 📋 Requirements

- Python 3.10+
- 500 MB disk space
- 2 GB RAM (recommended 4 GB+)
- Internet connection

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/sauljtm33xD/termux-app.git
cd termux-app
```

### 2. Install Dependencies
```bash
# Windows
pip install -r requirements.txt

# macOS/Linux
pip3 install -r requirements.txt
```

### 3. Run Application
```bash
# Windows
python src/main.py

# macOS/Linux
python3 src/main.py
```

## 🎯 Quick Start

### Single URL Download
1. Open FastDL PRO
2. Go to "Descarga Individual" tab
3. Enter URL
4. Click "Agregar Descarga"
5. Click "Iniciar"

### Batch Download
1. Go to "Descargas por Lotes" tab
2. Paste URLs (one per line) or load from file
3. Configure parallel downloads
4. Click "Descargar Lote"

### Torrent Download
1. Go to "Torrent" tab
2. Enter torrent file path or magnet link
3. Click "Agregar Torrent"
4. Click "Iniciar Descarga"

### Web Search
1. Go to "Búsqueda Web" tab
2. Enter search query
3. Select search type (General, Archivos, Videos, etc.)
4. Click "Buscar"
5. Select result and download or open in browser

## 🔧 Configuration

### Settings Tab
- **Conexiones Paralelas**: Number of simultaneous connections (1-32)
- **Reanudar Descargas**: Resume partial downloads
- **Carpeta de Descargas**: Set download folder
- **Carpeta Torrents**: Set torrent download folder

## 📁 Directory Structure

```
fastdl-pro/
├── src/
│   ├── main.py                 # Application entry point
│   ├── config.py               # Configuration
│   ├── download_engine.py       # Core download engine
│   ├── batch_downloader.py      # Batch URL handler
│   ├── torrent_downloader.py    # Torrent handler
│   ├── web_search.py            # Web search module
│   └── ui/
│       ├── __init__.py
│       └── main_window.py       # PyQt6 interface
├── requirements.txt             # Python dependencies
├── FASTDL_README.md             # This file
└── QUICKSTART.md                # Quick reference
```

## 🎮 Usage Examples

### Downloading Multiple Files
Create a file `downloads.txt`:
```
https://example.com/file1.zip
https://example.com/file2.pdf
https://example.com/file3.iso
```

Load in FastDL PRO:
1. Descargas por Lotes → Cargar desde Archivo
2. Select `downloads.txt`
3. Set parallel downloads to 4-8
4. Click "Descargar Lote"

### Downloading Torrent
```
1. Go to Torrent tab
2. Enter: magnet:?xt=urn:btih:...
3. Or browse to .torrent file
4. Click "Iniciar Descarga"
```

### Searching for Files
```
1. Go to Búsqueda Web
2. Search: "ubuntu 24.04 iso"
3. Select search type: "Archivos"
4. Browse results and download
```

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'PyQt6'"
```bash
pip install -r requirements.txt
```

### Slow Downloads
- Increase parallel connections in Settings (8-16 recommended)
- Check internet connection
- Try different mirror/source

### Torrent Not Starting
- Install qBittorrent: `https://www.qbittorrent.org/`
- Or use magnet links which open in default client

### Web Search Not Working
- Check internet connection
- Try different search provider
- Verify firewall allows outbound HTTPS

## 🚀 Performance Tips

1. **Maximize Bandwidth**
   - Set parallel connections to 16
   - Disable other bandwidth-heavy apps
   - Use WiFi 5GHz if available

2. **Batch Downloads**
   - Use 4-8 parallel downloads for stability
   - Higher numbers may reduce individual speeds

3. **Organize Files**
   - Enable "Organize by Type" to auto-sort downloads
   - Create separate folders for different content types

## 🔐 Security Notes

- FastDL PRO does NOT collect personal data
- All downloads are direct from source URLs
- Web search uses public APIs
- .torrent files are standard Torrent format

## 📝 Log Files

Download logs are saved to:
- Windows: `%USERPROFILE%\AppData\Local\FastDL\logs`
- macOS: `~/Library/Application Support/FastDL/logs`
- Linux: `~/.local/share/fastdl/logs`

## 🤝 Contributing

To report issues or suggest features:
1. Open an issue on GitHub
2. Include error messages and steps to reproduce
3. Mention your OS and Python version

## 📜 License

GNU General Public License v3.0 - See LICENSE file

## 🆘 Support

For help:
1. Check QUICKSTART.md
2. Review troubleshooting section
3. Check existing GitHub issues
4. Open new issue with details

---

**Version**: 1.0  
**Last Updated**: September 2026  
**Status**: ✅ Production Ready
