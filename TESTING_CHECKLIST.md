# FastDL PRO - Testing Checklist

Complete checklist for testing and validating FastDL PRO functionality.

## 🚀 Pre-Testing Setup

- [ ] Python 3.10+ installed
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Application starts without errors: `python3 src/main.py`
- [ ] All UI tabs load correctly
- [ ] No console errors or warnings

## 📥 Individual Download Tests

### Basic Download
- [ ] Enter single URL in "Descarga Individual" tab
- [ ] Click "Agregar Descarga"
- [ ] Verify file appears in table with "Pendiente" status
- [ ] Click "Iniciar"
- [ ] Download starts and shows progress
- [ ] Progress bar updates smoothly
- [ ] Download completes to correct folder
- [ ] File is valid and readable

### Download with Pause/Resume
- [ ] Start a large file download
- [ ] Click "Pausar" within 5 seconds
- [ ] Verify status changes to "Paused"
- [ ] Click "Reanudar"
- [ ] Verify download resumes from same position
- [ ] Complete download successfully

### Download Cancellation
- [ ] Start a download
- [ ] Click cancel (or remove from list)
- [ ] Verify download stops
- [ ] Temporary file (.tmp) is removed
- [ ] No partial file left behind

### Speed and Performance
- [ ] Monitor download speed
- [ ] Verify speed >1 MB/s on good connection
- [ ] Check CPU usage (should be <5%)
- [ ] Check RAM usage (should be <200MB)
- [ ] Verify WiFi bandwidth is well utilized

### Folder Management
- [ ] Click "Cambiar Carpeta" in settings
- [ ] Select new download folder
- [ ] Verify folder label updates
- [ ] Download file to new location
- [ ] Verify file in correct folder
- [ ] Click "Abrir Carpeta"
- [ ] Verify file manager opens to correct folder

## 📦 Batch Download Tests

### Load URLs from File
- [ ] Create text file with 5+ URLs (one per line)
- [ ] Include comments (lines starting with #)
- [ ] Click "Cargar desde Archivo"
- [ ] Select file
- [ ] Verify URLs appear in text area
- [ ] Verify comment lines are ignored

### Manual URL Entry
- [ ] Paste multiple URLs in text area
- [ ] Include duplicates and comments
- [ ] Set "Saltar Duplicados" checkbox
- [ ] Click "Descargar Lote"
- [ ] Verify duplicates not re-downloaded
- [ ] Monitor parallel progress
- [ ] All files download successfully

### Batch Configuration
- [ ] Set parallel downloads to 1
- [ ] Verify downloads happen sequentially
- [ ] Set parallel downloads to 8
- [ ] Verify multiple downloads in progress simultaneously
- [ ] Set parallel downloads to 16
- [ ] Verify stable operation

### Large Batch Testing
- [ ] Create batch with 20+ URLs
- [ ] Start download
- [ ] Monitor memory usage (should stay <500MB)
- [ ] Verify all files eventually download
- [ ] Check completion time is reasonable

## 🌐 Torrent Tests

### Add Torrent File
- [ ] Download a small .torrent file
- [ ] Go to "Torrent" tab
- [ ] Click "Examinar"
- [ ] Select .torrent file
- [ ] Click "Agregar Torrent"
- [ ] Verify success message
- [ ] "Iniciar Descarga" button becomes enabled

### Add Magnet Link
- [ ] Copy magnet link (from torrent site)
- [ ] Paste in torrent input field
- [ ] Click "Agregar Torrent"
- [ ] Verify magnet link accepted
- [ ] "Iniciar Descarga" button enabled

### Download Torrent (if qBittorrent available)
- [ ] Click "Iniciar Descarga"
- [ ] Verify torrent appears in client
- [ ] Monitor download progress
- [ ] Verify seeds/peers show in table
- [ ] Download completes successfully

### Fallback Behavior (without qBittorrent)
- [ ] Close qBittorrent (if running)
- [ ] Add torrent
- [ ] Click "Iniciar Descarga"
- [ ] Verify default torrent client opens
- [ ] Download starts in external client

### Torrent Pause/Resume
- [ ] Start torrent download
- [ ] Click "Pausar"
- [ ] Verify torrent paused in client
- [ ] Click to resume (if button appears)
- [ ] Verify download resumes

## 🔍 Web Search Tests

### General Web Search
- [ ] Go to "Búsqueda Web" tab
- [ ] Enter: "ubuntu 24.04"
- [ ] Select "General"
- [ ] Click "Buscar"
- [ ] Verify results appear in table
- [ ] Results have titles and descriptions

### File Search
- [ ] Search: "large.iso"
- [ ] Select "Archivos"
- [ ] Click "Buscar"
- [ ] Verify file-focused results
- [ ] Download button works

### Archive Search
- [ ] Search: "open source software"
- [ ] Select "Repositorios"
- [ ] Click "Buscar"
- [ ] Verify Internet Archive results
- [ ] Can access archive.org links

### Download from Search Result
- [ ] Perform a search
- [ ] Click a result row
- [ ] Click "Descargar Seleccionado"
- [ ] Verify URL appears in single download tab
- [ ] Can proceed with download

### Open in Browser
- [ ] Perform a search
- [ ] Select a result
- [ ] Click "Abrir en Navegador"
- [ ] Verify browser opens with correct URL

## ⚙️ Settings Tests

### Parallel Connections
- [ ] Set to 1: Downloads sequential
- [ ] Set to 4: Normal speed
- [ ] Set to 8: Good bandwidth usage
- [ ] Set to 16: Max connections
- [ ] Set to 32: Application stable

### Resume Downloads
- [ ] Enable "Reanudar Descargas"
- [ ] Start download and stop midway
- [ ] Restart application
- [ ] Manually resume: Should continue from same point
- [ ] Disable and test: Should restart from beginning

### Download Folder
- [ ] Change download folder
- [ ] Verify new downloads go to new folder
- [ ] Create folders with special characters
- [ ] Verify handling of spaces in folder names
- [ ] Test with long folder paths

## 🔄 Multi-Tab Workflow Tests

### Tab Switching
- [ ] Switch between all 5 tabs
- [ ] Verify content loads correctly
- [ ] No data loss when switching
- [ ] Multiple downloads in progress while switching tabs

### Simultaneous Operations
- [ ] Start individual download
- [ ] Switch to batch, add URLs
- [ ] Switch to search, perform search
- [ ] All operations continue independently
- [ ] Progress updates in background

### State Persistence
- [ ] Add URLs to batch
- [ ] Switch tabs multiple times
- [ ] Return to batch tab
- [ ] Verify URLs still present
- [ ] Settings changes persist

## 🖥️ Cross-Platform Tests

### Windows
- [ ] Run from command prompt
- [ ] Run FastDL.bat
- [ ] Test all features
- [ ] Verify paths with backslashes work
- [ ] Test with network locations

### macOS
- [ ] Run from Terminal
- [ ] Run ./run.sh
- [ ] Test all features
- [ ] Verify DMG/pkg paths work
- [ ] Test with Finder

### Linux
- [ ] Run from Terminal
- [ ] Run ./run.sh
- [ ] Test all features
- [ ] Verify /home paths work
- [ ] Desktop integration

## 🔒 Security Tests

### URL Validation
- [ ] Invalid URLs show error
- [ ] Malformed URLs rejected
- [ ] Local file:// URLs handled correctly
- [ ] Special characters in URLs work

### File Integrity
- [ ] Downloaded files not corrupted
- [ ] Temp files cleaned up properly
- [ ] No arbitrary file execution
- [ ] File permissions preserved

## 📊 Performance Tests

### Memory Usage
- [ ] Base application: <150 MB
- [ ] Single download: <300 MB
- [ ] Batch (10 items): <400 MB
- [ ] Batch (50 items): <600 MB
- [ ] No memory leaks over time

### CPU Usage
- [ ] Idle: <1%
- [ ] Downloading: <5%
- [ ] Batch downloading: <10%
- [ ] UI responsive during downloads

### Bandwidth Utilization
- [ ] Single connection: 50-80% available bandwidth
- [ ] 4 connections: 80-95% utilization
- [ ] 8 connections: 95%+ utilization

## 🐛 Error Handling Tests

### Invalid URLs
- [ ] Enter non-existent URL
- [ ] Verify error logged
- [ ] Other downloads continue
- [ ] Application remains stable

### Network Interruption
- [ ] Disable network mid-download
- [ ] Verify download pauses
- [ ] Re-enable network
- [ ] Verify resume works
- [ ] No data corruption

### Insufficient Disk Space
- [ ] Fill disk space
- [ ] Start download
- [ ] Verify error message
- [ ] Temp file cleaned up
- [ ] Application stable

### File Permission Issues
- [ ] Try to download to read-only folder
- [ ] Verify permission error
- [ ] Suggest alternative folder
- [ ] Application remains stable

## 📝 Log and Data Tests

### Log Files
- [ ] Logs created in correct location
- [ ] Logs contain useful debug info
- [ ] Old logs rotated/archived
- [ ] No sensitive data in logs

### Download History
- [ ] Completed downloads tracked
- [ ] Failed downloads noted
- [ ] History can be cleared
- [ ] History persists across sessions

## ✅ Final Checklist

- [ ] All 10 feature areas tested
- [ ] No crashes or hangs
- [ ] No error messages in production run
- [ ] Performance acceptable
- [ ] Cross-platform compatibility verified
- [ ] Documentation accurate
- [ ] Application ready for release

## 📋 Test Results Summary

| Category | Status | Notes |
|----------|--------|-------|
| Individual Downloads | ✅/❌ | |
| Batch Downloads | ✅/❌ | |
| Torrent Support | ✅/❌ | |
| Web Search | ✅/❌ | |
| Settings | ✅/❌ | |
| Performance | ✅/❌ | |
| Cross-Platform | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Overall | ✅/❌ | |

## 🚀 Sign-Off

- Tested by: _________________
- Date: _________________
- Platform: _________________
- Issues Found: _________________
- Ready for Release: ✅ / ❌

---

**Version**: 1.0  
**Last Updated**: September 2026
