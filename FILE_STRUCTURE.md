# FastDL PRO - Complete File Structure

## Project Root Directory

```
termux-app/
│
├── 📄 README Files (User Documentation)
│   ├── FASTDL_README.md                  # Complete user guide (1,200+ lines)
│   ├── QUICKSTART.md                     # 5-minute quick reference
│   ├── PROJECT_SUMMARY.md                # Implementation overview
│   ├── DEVELOPER_GUIDE.md                # Developer documentation (500+ lines)
│   ├── TESTING_CHECKLIST.md              # QA testing guide (400+ lines)
│   ├── FILE_STRUCTURE.md                 # This file
│   └── INSTALL.md                        # Installation guide
│
├── 📁 Source Code (src/)
│   ├── main.py                           # Application entry point
│   ├── config.py                         # Configuration management
│   ├── download_engine.py                # Core download engine (180 lines)
│   │   ├── DownloadStatus                # Enum: PENDING, DOWNLOADING, etc.
│   │   ├── DownloadProgress              # Progress tracking dataclass
│   │   ├── DownloadTask                  # Individual download state
│   │   └── DownloadEngine                # Main orchestrator
│   ├── batch_downloader.py               # Batch URL handler (80 lines)
│   │   ├── BatchDownloadConfig           # Configuration dataclass
│   │   └── BatchDownloader               # Batch management
│   ├── torrent_downloader.py             # Torrent support (130 lines)
│   │   ├── TorrentProgress               # Torrent progress tracking
│   │   └── TorrentDownloader             # Torrent operations
│   ├── web_search.py                     # Web search integration (140 lines)
│   │   ├── SearchResult                  # Search result dataclass
│   │   └── WebSearchEngine               # Multi-source search
│   │
│   └── 📁 UI Package (ui/)
│       ├── __init__.py                   # Package initialization
│       └── main_window.py                # PyQt6 interface (750 lines)
│           ├── DownloadWorker            # Async worker thread
│           ├── MainWindow                # Main application window
│           ├── Tab Methods:
│           │   ├── create_single_download_tab()    # Individual downloads
│           │   ├── create_batch_download_tab()     # Batch downloads
│           │   ├── create_torrent_tab()            # Torrent management
│           │   ├── create_search_tab()             # Web search
│           │   └── create_settings_tab()           # Configuration
│           ├── Event Handlers:
│           │   ├── add_download()
│           │   ├── start_downloads()
│           │   ├── pause_downloads()
│           │   ├── load_urls_from_file()
│           │   ├── perform_search()
│           │   └── ... (50+ methods)
│           └── Utilities:
│               ├── _format_size()
│               ├── _format_speed()
│               └── _format_time()
│
├── 📝 Configuration & Installation
│   ├── requirements.txt                  # Python dependencies (8 packages)
│   │   ├── PyQt6==6.6.1
│   │   ├── aiohttp==3.9.1
│   │   ├── aiofiles==23.2.1
│   │   ├── pydantic==2.5.0
│   │   ├── python-dotenv==1.0.0
│   │   ├── requests>=2.31.0
│   │   ├── beautifulsoup4>=4.12.0
│   │   └── PyQt6-sip==13.6.0
│   ├── setup.py                          # Package setup configuration
│   ├── .gitignore                        # Git ignore rules
│   ├── jitpack.yml                       # JitPack configuration
│   └── settings.gradle                   # Gradle settings (for Android)
│
├── 🚀 Launcher Scripts
│   ├── run.sh                            # Linux/macOS launcher
│   ├── run.bat                           # Windows launcher
│   ├── FastDL.bat                        # Windows batch file
│   ├── FastDL.desktop                    # Linux desktop entry
│   ├── install_fastdl.sh                 # Automated installer
│   └── termux_install.sh                 # Termux CLI installer
│
├── 🔗 Other Directories
│   ├── navaja-mexx/                      # Related project
│   ├── terminal-emulator/                # Terminal component
│   ├── terminal-view/                    # Terminal UI
│   ├── termux-shared/                    # Shared utilities
│   └── site/                             # Documentation site
│
└── 📋 Other Files
    ├── LICENSE                           # GNU GPL v3.0
    ├── LICENSE.md                        # License information
    ├── SECURITY.md                       # Security policy
    └── README.md                         # Repository README

```

## Key Files Reference

### Source Code Statistics

| File | Lines | Purpose |
|------|-------|---------|
| `src/main.py` | 25 | Entry point |
| `src/config.py` | 20 | Configuration |
| `src/download_engine.py` | 180 | Core downloads |
| `src/batch_downloader.py` | 80 | Batch URLs |
| `src/torrent_downloader.py` | 130 | Torrents |
| `src/web_search.py` | 140 | Web search |
| `src/ui/main_window.py` | 750 | PyQt6 UI |
| **Total** | **1,325** | **Core Application** |

### Documentation Files

| File | Lines | Purpose |
|------|-------|---------|
| FASTDL_README.md | 1,200+ | User guide |
| DEVELOPER_GUIDE.md | 500+ | Developer docs |
| TESTING_CHECKLIST.md | 400+ | QA guide |
| PROJECT_SUMMARY.md | 375+ | Project overview |
| QUICKSTART.md | 100+ | Quick reference |
| **Total** | **2,500+** | **Documentation** |

## Code Organization

### By Feature
- **Download**: main.py, config.py, download_engine.py
- **Batch**: batch_downloader.py
- **Torrent**: torrent_downloader.py
- **Search**: web_search.py
- **UI**: ui/main_window.py

### By Concerns
- **Async I/O**: download_engine.py, batch_downloader.py, web_search.py
- **Configuration**: config.py
- **User Interface**: ui/main_window.py
- **External Integration**: torrent_downloader.py, web_search.py

## Development Workflow

### Adding New Features

1. **Core Logic**: Add to src/ modules
2. **UI**: Update ui/main_window.py with new tab/widgets
3. **Config**: Add settings to config.py if needed
4. **Tests**: Add to TESTING_CHECKLIST.md
5. **Docs**: Update DEVELOPER_GUIDE.md

### Example: Adding a New Download Source

```
1. Create src/new_source.py with:
   - Source handler class
   - Async methods for discovery/download
   
2. Update src/main.py:
   - Import new_source
   - Integrate with UI
   
3. Update ui/main_window.py:
   - Add new tab or buttons
   - Connect signals to handlers
   
4. Update documentation:
   - FASTDL_README.md with usage
   - DEVELOPER_GUIDE.md with API
   - TESTING_CHECKLIST.md with test cases
```

## Configuration Hierarchy

```
System Defaults (config.py)
    ↓
User Settings (Settings Tab)
    ↓
Runtime Overrides (API calls)
    ↓
Per-Download Config (Task-specific)
```

## File Dependencies

```
main.py
  ├── config.py
  ├── download_engine.py
  └── ui/main_window.py
      ├── download_engine.py
      ├── batch_downloader.py
      ├── torrent_downloader.py
      └── web_search.py

batch_downloader.py
  └── download_engine.py

torrent_downloader.py
  └── (No internal dependencies)

web_search.py
  └── (No internal dependencies)
```

## Important Directories

### For Users
- `src/` - Source code
- `requirements.txt` - Dependencies
- `FASTDL_README.md` - User guide
- `run.sh` / `run.bat` - Launch scripts
- `install_fastdl.sh` - Installer

### For Developers
- `src/` - All source code organized by feature
- `DEVELOPER_GUIDE.md` - API documentation
- `TESTING_CHECKLIST.md` - Testing guide
- `requirements.txt` - Build dependencies

### For Documentation
- `.md` files - All Markdown documentation
- `PROJECT_SUMMARY.md` - Project overview
- `FILE_STRUCTURE.md` - This file

## Version Information

**Python**: 3.10+ (recommended 3.11)  
**PyQt6**: 6.6.1  
**aiohttp**: 3.9.1  

## Git Information

**Repository**: https://github.com/sauljtm33xD/termux-app  
**Branch**: `claude/fast-pc-downloader-m18nab`  
**Pull Request**: #10  

---

**Last Updated**: September 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
