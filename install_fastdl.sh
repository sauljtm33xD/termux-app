#!/bin/bash
# FastDL PRO Installation Script

set -e

echo "========================================="
echo "FastDL PRO - Installation Script"
echo "========================================="
echo

# Detect OS
OS_TYPE="Unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS_TYPE="Windows"
fi

echo "Detected OS: $OS_TYPE"
echo

# Check Python
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found!"
    echo "Please install Python 3.10 or later from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✓ Python $PYTHON_VERSION found"
echo

# Install pip
echo "Checking pip installation..."
if ! python3 -m pip --version &> /dev/null; then
    echo "Installing pip..."
    python3 -m ensurepip --upgrade
fi
echo "✓ pip is available"
echo

# Install dependencies
echo "Installing dependencies from requirements.txt..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo

# Create desktop shortcut/launcher
echo "Creating application launcher..."

if [ "$OS_TYPE" = "Linux" ]; then
    DESKTOP_DIR="$HOME/.local/share/applications"
    mkdir -p "$DESKTOP_DIR"

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    sed "s|/path/to/fastdl|$SCRIPT_DIR|g" FastDL.desktop > "$DESKTOP_DIR/fastdl.desktop"
    chmod +x "$DESKTOP_DIR/fastdl.desktop"
    echo "✓ Desktop launcher created at: $DESKTOP_DIR/fastdl.desktop"

elif [ "$OS_TYPE" = "macOS" ]; then
    APPS_DIR="$HOME/Applications"
    mkdir -p "$APPS_DIR"

    cat > "$APPS_DIR/FastDL.app/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>FastDL</string>
    <key>CFBundleName</key>
    <string>FastDL PRO</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
</dict>
</plist>
EOF
    echo "✓ macOS launcher created at: $APPS_DIR/FastDL.app"
fi

echo
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo
echo "To start FastDL PRO:"
echo
if [ "$OS_TYPE" = "Linux" ] || [ "$OS_TYPE" = "macOS" ]; then
    echo "  python3 src/main.py"
    echo
    echo "Or run the shell script:"
    echo "  ./run.sh"
else
    echo "  python src/main.py"
fi
echo
echo "For more information, see FASTDL_README.md"
echo
