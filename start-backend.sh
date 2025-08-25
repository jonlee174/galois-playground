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

# Try to source conda from standard locations
if [ -f "$HOME/miniforge3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniforge3/etc/profile.d/conda.sh"
elif [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
elif [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/anaconda3/etc/profile.d/conda.sh"
elif [ -f "/opt/conda/etc/profile.d/conda.sh" ]; then
    source "/opt/conda/etc/profile.d/conda.sh"
else
    # Try to use conda/mamba directly if source failed
    echo "Could not source conda.sh file, trying to use $CONDA_CMD directly..."
fi

# Check if sage environment exists, if not create it
if ! $CONDA_CMD env list | grep -q "^sage "; then
    echo "Sage environment not found. Creating new environment..."
    $CONDA_CMD create -n sage -y python=3.12
    $CONDA_CMD activate sage
    $CONDA_CMD install -y -c conda-forge sagemath
    pip install fastapi uvicorn
    echo "Sage environment created and dependencies installed."
else
    $CONDA_CMD activate sage
fi

# Check if we're in the correct environment
if [[ "$CONDA_DEFAULT_ENV" != "sage" ]]; then
    echo "Warning: Could not activate sage environment with conda."
    echo "Attempting to continue, but this may fail if SageMath is not in your PATH."
fi

# Check if required packages are installed
python -c "import fastapi, uvicorn" 2>/dev/null || {
    echo "Installing missing Python dependencies..."
    pip install fastapi uvicorn
}

# Check if SageMath is available
python -c "import sage.all" 2>/dev/null || {
    echo "Error: SageMath not found in the current Python environment."
    echo "Please ensure SageMath is installed correctly."
    echo "You can install it with: conda install -c conda-forge sagemath"
    exit 1
}

echo "Environment ready. Starting backend server..."
echo ""

# Start the backend
python backend.py
