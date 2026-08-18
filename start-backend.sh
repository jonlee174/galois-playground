#!/bin/bash

echo "Starting Galois Playground Backend..."
echo "Ultra-fast backend with direct SageMath import"
echo ""

# Detect conda or mamba automatically
if command -v conda &> /dev/null; then
    CONDA_CMD="conda"
elif command -v mamba &> /dev/null; then
    CONDA_CMD="mamba"
else
    echo "Error: Neither conda nor mamba found. Please install Conda/Miniconda/Miniforge."
    echo "Visit https://docs.conda.io/en/latest/miniconda.html for installation instructions."
    exit 1
fi

# Resolve the conda base directory directly from conda/mamba itself,
# rather than guessing common install paths (fixes non-standard bases
# such as /opt/miniconda3, and avoids relying on `conda activate`
# inside a non-interactive script shell, which requires `conda init`
# to have hooked *this* shell and is easily shadowed by an active venv).
CONDA_BASE="$($CONDA_CMD info --base 2>/dev/null)"
if [ -z "$CONDA_BASE" ]; then
    echo "Error: Could not determine conda base directory."
    exit 1
fi

SAGE_ENV_DIR="$CONDA_BASE/envs/sage"
SAGE_PYTHON="$SAGE_ENV_DIR/bin/python"

# Check if sage environment exists, if not create it
if [ ! -x "$SAGE_PYTHON" ]; then
    echo "Sage environment not found. Creating new environment..."
    $CONDA_CMD create -n sage -y -c conda-forge sage python=3.12
    "$SAGE_PYTHON" -m pip install fastapi uvicorn
    echo "Sage environment created and dependencies installed."
fi

# Always invoke the sage env's python by absolute path, so an active
# venv or misconfigured shell hook in the parent shell can't shadow it.
if [ ! -x "$SAGE_PYTHON" ]; then
    echo "Error: SageMath environment python not found at $SAGE_PYTHON."
    echo "Please ensure SageMath is installed correctly."
    echo "You can install it with: conda create -n sage -c conda-forge sage"
    exit 1
fi

# Check if required packages are installed
"$SAGE_PYTHON" -c "import fastapi, uvicorn" 2>/dev/null || {
    echo "Installing missing Python dependencies..."
    "$SAGE_PYTHON" -m pip install fastapi uvicorn
}

# Check if SageMath is available
"$SAGE_PYTHON" -c "import sage.all" 2>/dev/null || {
    echo "Error: SageMath not found in the sage environment's Python."
    echo "Please ensure SageMath is installed correctly."
    echo "You can install it with: conda create -n sage -c conda-forge sage"
    exit 1
}

echo "Environment ready. Starting backend server..."
echo ""

# Start the backend
"$SAGE_PYTHON" backend.py
