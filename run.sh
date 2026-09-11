#!/bin/bash
# FastDL PRO - Linux/macOS Launcher

cd "$(dirname "$0")"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found!"
    echo "Please install Python 3.10 or later"
    exit 1
fi

# Check dependencies
python3 -c "import PyQt6" 2>/dev/null || {
    echo "ERROR: Dependencies not installed"
    echo "Run: pip3 install -r requirements.txt"
    exit 1
}

# Start application
python3 src/main.py
