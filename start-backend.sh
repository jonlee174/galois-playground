#!/bin/bash
set -e

echo "Starting Galois Playground Backend..."
echo "Ultra-fast backend with direct SageMath import"
echo ""

# Find a usable Python 3 interpreter (passagemath-standard currently
# publishes wheels for Python 3.11-3.14).
PYTHON_BIN=""
for candidate in python3.14 python3.13 python3.12 python3.11 python3; do
    if command -v "$candidate" &> /dev/null; then
        PYTHON_BIN="$candidate"
        break
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo "Error: Python 3 not found. Please install Python 3.11-3.14."
    echo "Visit https://www.python.org/downloads/ for installation instructions."
    exit 1
fi

VENV_DIR=".venv"
VENV_PYTHON="$VENV_DIR/bin/python"

# Create the virtual environment if it doesn't exist yet.
if [ ! -x "$VENV_PYTHON" ]; then
    echo "Creating virtual environment in $VENV_DIR..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# Install/upgrade dependencies (passagemath-standard, fastapi, uvicorn) if
# SageMath isn't importable yet in the venv. passagemath ships prebuilt
# wheels, so this is a download+unpack, not a from-source build - but it is
# a large download (several GB) and can take a while on the first run.
"$VENV_PYTHON" -c "import sage.all, fastapi, uvicorn" 2>/dev/null || {
    echo "Installing Python dependencies (this can take a while the first time)..."
    "$VENV_PYTHON" -m pip install --upgrade pip
    "$VENV_PYTHON" -m pip install -r requirements.txt
}

echo "Environment ready. Starting backend server..."
echo ""

# Start the backend
"$VENV_PYTHON" backend.py
