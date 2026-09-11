# FastDL PRO - Developer Guide

Complete guide for developers extending FastDL PRO with new features.

## 📚 Architecture Overview

FastDL PRO follows a modular architecture:

```
UI Layer (PyQt6)
    ↓
Business Logic (Download Engine, Torrent, Search)
    ↓
Data/Utilities (Config, Models)
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `download_engine.py` | Core async download with aiohttp |
| `batch_downloader.py` | Bulk URL downloads |
| `torrent_downloader.py` | Torrent/magnet handling |
| `web_search.py` | Web search and discovery |
| `ui/main_window.py` | PyQt6 interface |
| `config.py` | Configuration management |

## 🔧 Core Components

### DownloadEngine

The heart of FastDL PRO - handles individual file downloads.

```python
from download_engine import DownloadEngine, DownloadConfig

config = DownloadConfig(
    max_parallel_connections=8,
    chunk_size=1024 * 256,
    timeout=30,
    resume_downloads=True
)

engine = DownloadEngine(config)

# Add a download
task = await engine.add_download("https://example.com/file.zip")

# Start downloads
await engine.start_downloads()

# Pause/Resume/Cancel
engine.pause_download(task)
engine.resume_download(task)
engine.cancel_download(task)

# Track progress
def on_progress(progress):
    print(f"{progress.file_name}: {progress.progress_percent}%")

engine.progress_callback = on_progress
```

### DownloadTask

Represents a single download.

```python
@dataclass
class DownloadTask:
    url: str                                    # Download URL
    filename: str                               # Target filename
    output_path: Path                          # Full path to save
    max_connections: int = 4                   # Parallel connections
    
    # Runtime properties
    status: DownloadStatus                     # PENDING/DOWNLOADING/etc
    downloaded: int = 0                        # Bytes downloaded
    total_size: int = 0                        # Total file size
    speed: float = 0.0                         # Current speed (bytes/s)
    remaining_time: float = 0                  # ETA in seconds
    paused: bool = False
    cancelled: bool = False
```

### BatchDownloader

Handle multiple URLs with batching.

```python
from batch_downloader import BatchDownloader, BatchDownloadConfig

config = BatchDownloadConfig(
    max_parallel_downloads=4,
    skip_duplicates=True,
    organize_by_type=True
)

batch = BatchDownloader(engine, config)

# Add URLs
batch.add_urls_from_list([
    "https://example.com/file1.zip",
    "https://example.com/file2.pdf"
])

# Or from file
await batch.add_urls_from_file(Path("urls.txt"))

# Download all
await batch.download_batch(output_folder=Path("/downloads"))
```

### TorrentDownloader

Manage torrent downloads.

```python
from torrent_downloader import TorrentDownloader

torrent = TorrentDownloader(output_folder=Path("/downloads/torrents"))

# Add torrent or magnet
torrent_id = torrent.add_torrent("path/to/file.torrent")
# Or: torrent.add_torrent("magnet:?xt=urn:btih:...")

# Download
await torrent.download_torrent("path/to/file.torrent")

# Control
torrent.pause_torrent(torrent_id)
torrent.resume_torrent(torrent_id)
torrent.cancel_torrent(torrent_id)

# Get status
torrents = torrent.get_torrents()
```

### WebSearchEngine

Search and discover files on the web.

```python
from web_search import WebSearchEngine

search = WebSearchEngine()

# General search
results = await search.search("ubuntu iso", provider="duckduckgo")

# File repositories
results = await search.search_file_repositories("large.zip")

# Internet Archive
results = await search.search_archive("project files")

# Verify URL
is_valid = await search.verify_url("https://example.com/file.zip")

# Get file info
info = await search.get_file_info("https://example.com/file.zip")
# Returns: {size, type, modified, accessible}
```

## 🎨 Extending the UI

Add new features to the PyQt6 interface:

### Creating a New Tab

```python
def create_my_feature_tab(self):
    widget = QWidget()
    layout = QVBoxLayout()
    
    # Add widgets
    label = QLabel("My Feature")
    button = QPushButton("Do Something")
    button.clicked.connect(self.on_button_clicked)
    
    layout.addWidget(label)
    layout.addWidget(button)
    layout.addStretch()
    
    widget.setLayout(layout)
    return widget

# In init_ui():
tabs.addTab(self.create_my_feature_tab(), "My Feature")
```

### Handling Async Operations

```python
def on_button_clicked(self):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(self.async_operation())
        QMessageBox.information(self, "Success", result)
    except Exception as e:
        QMessageBox.critical(self, "Error", str(e))
    finally:
        loop.close()

async def async_operation(self):
    # Do async work
    return "Done"
```

## 🔌 Plugin Architecture

Create plugin modules that extend FastDL PRO:

### Custom Download Handler

```python
# src/plugins/custom_handler.py

class CustomDownloadHandler:
    def __init__(self, engine):
        self.engine = engine
    
    async def download_custom(self, source: str):
        """Download from custom source"""
        urls = await self.parse_source(source)
        for url in urls:
            await self.engine.add_download(url)
    
    async def parse_source(self, source: str):
        # Custom parsing logic
        pass
```

### Custom Search Provider

```python
# src/plugins/custom_search.py

class CustomSearchProvider:
    async def search(self, query: str):
        """Search in custom database"""
        # Custom search logic
        return []
```

## 📝 Logging

Add logging for debugging:

```python
import logging

logger = logging.getLogger(__name__)

# In your code:
logger.info("Download started")
logger.warning("Slow connection detected")
logger.error("Download failed", exc_info=True)
```

Configure logging:

```python
import logging.config

logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'fastdl.log',
            'formatter': 'standard',
        },
    },
    'loggers': {
        '': {
            'handlers': ['default'],
            'level': 'INFO',
        }
    }
})
```

## 🧪 Testing

### Unit Tests

```python
import asyncio
import pytest
from download_engine import DownloadEngine, DownloadConfig

@pytest.mark.asyncio
async def test_download_task():
    config = DownloadConfig()
    engine = DownloadEngine(config)
    
    task = await engine.add_download("https://example.com/file.zip")
    assert task is not None
    assert task.filename == "file.zip"

@pytest.mark.asyncio
async def test_batch_download():
    from batch_downloader import BatchDownloader
    
    config = DownloadConfig()
    engine = DownloadEngine(config)
    batch = BatchDownloader(engine)
    
    batch.add_urls_from_list(["https://example.com/file1.zip"])
    assert batch.get_url_count() == 1
```

### Integration Tests

```python
@pytest.mark.asyncio
async def test_full_download_flow(tmp_path):
    config = DownloadConfig(download_folder=tmp_path)
    engine = DownloadEngine(config)
    
    # Simulate progress tracking
    progress_data = []
    engine.progress_callback = lambda p: progress_data.append(p)
    
    # Add and download
    task = await engine.add_download("https://httpbin.org/bytes/1024")
    await engine.download_file(task)
    
    assert task.status == DownloadStatus.COMPLETED
    assert (tmp_path / task.filename).exists()
```

## 🚀 Performance Optimization

### Connection Pooling

FastDL PRO uses aiohttp's TCP connector pooling:

```python
connector = aiohttp.TCPConnector(
    limit_per_host=8,              # Max connections per host
    force_close=False,             # Reuse connections
    enable_cleanup_closed=True     # Auto cleanup
)

async with aiohttp.ClientSession(connector=connector) as session:
    # Downloads here benefit from pooling
    pass
```

### Bandwidth Throttling

Implement bandwidth limits:

```python
async def download_with_rate_limit(self, task, max_bandwidth_kbps):
    """Download with bandwidth limit"""
    chunk_size = 1024 * 256  # 256 KB
    delay_per_chunk = chunk_size / (max_bandwidth_kbps * 1024)
    
    async with session.get(task.url) as resp:
        async for chunk in resp.content.iter_chunked(chunk_size):
            await f.write(chunk)
            await asyncio.sleep(delay_per_chunk)
```

### Async Pattern

Use proper async/await patterns:

```python
# Good: Concurrent downloads
downloads = [engine.download_file(task) for task in tasks]
await asyncio.gather(*downloads)

# Bad: Sequential downloads
for task in tasks:
    await engine.download_file(task)  # Much slower!
```

## 🐛 Debugging

### Enable Debug Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# More verbose output
aiohttp_logger = logging.getLogger('aiohttp')
aiohttp_logger.setLevel(logging.DEBUG)
```

### Interactive Debugging

```python
import pdb

# Add breakpoint
pdb.set_trace()

# Or use:
breakpoint()  # Python 3.7+
```

## 📦 Building & Distribution

### Create Executable (PyInstaller)

```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name FastDL --icon=icon.png src/main.py
```

### Create Installer (Windows)

```bash
pip install cx_Freeze
cxfreeze src/main.py --target-dir dist/FastDL --include-modules=PyQt6
```

## 🔗 External Resources

- [aiohttp Documentation](https://docs.aiohttp.org/)
- [PyQt6 Documentation](https://www.riverbankcomputing.com/static/Docs/PyQt6/)
- [Python asyncio](https://docs.python.org/3/library/asyncio.html)
- [qBittorrent API](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(v2.8.1))

## 📝 Contributing

When adding new features:

1. Follow module structure
2. Use async/await for I/O operations
3. Add logging
4. Write unit tests
5. Update documentation
6. Follow PEP 8 style guide

## 🆘 Common Issues

### Import Errors

```python
# Use absolute imports in main modules
from config import config
from download_engine import DownloadEngine

# Or use relative imports in submodules
from ..config import config
```

### Async Context Issues

```python
# Wrong: Creating loop in PyQt slot
loop = asyncio.new_event_loop()
result = loop.run_until_complete(async_func())

# Better: Use QThread for async operations
class AsyncWorker(QObject):
    def run(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(async_func())
```

---

**Version**: 1.0  
**Last Updated**: September 2026
