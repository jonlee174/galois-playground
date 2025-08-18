#!/bin/bash

echo "Starting Galois Playground Backend..."
echo "Ultra-fast backend with direct SageMath import"
echo ""

# Source conda initialization
source ~/miniforge3/etc/profile.d/conda.sh

# Activate sage environment
conda activate sage

# Check if we're in the correct environment
if [[ "$CONDA_DEFAULT_ENV" != "sage" ]]; then
    echo "Error: Failed to activate sage environment"
    exit 1
fi

# Check if required packages are installed
python -c "import fastapi, uvicorn, sage.all" 2>/dev/null || {
    echo "Error: Required packages not found. Please ensure FastAPI and SageMath are installed."
    exit 1
}

echo "Environment ready. Starting backend server..."
echo ""

# Start the backend
python backend.py
