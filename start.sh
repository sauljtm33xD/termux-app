#!/bin/bash
pip3 install -q flask flask-cors 2>/dev/null || pip3 install flask flask-cors
echo "APK Builder - http://localhost:5000"
python3 web_ui.py
