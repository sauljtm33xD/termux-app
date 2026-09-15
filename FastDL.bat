@echo off
REM FastDL PRO - High-Speed Downloader for Windows
REM Run from the repository directory

cd /d "%~dp0"

echo FastDL PRO - Starting...
python src/main.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start FastDL PRO
    echo.
    echo Make sure you have:
    echo 1. Python 3.10+ installed
    echo 2. Run: pip install -r requirements.txt
    echo 3. You are in the FastDL directory
    echo.
    pause
    exit /b 1
)
