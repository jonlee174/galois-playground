#!/bin/bash

# Galois Playground FastAPI Backend with Process Isolation
# This version runs SageMath computations in separate processes

# Set environment
export SAGE_NUM_THREADS=1
export OMP_NUM_THREADS=1
export PARI_SIZE=50000000

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Checking FastAPI dependencies...${NC}"

# Activate conda environment
source ~/miniforge3/etc/profile.d/conda.sh
conda activate sage

# Check if FastAPI is installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing FastAPI and uvicorn..."
    pip install fastapi uvicorn[standard] python-multipart
else
    echo "FastAPI dependencies OK"
fi

echo ""
echo -e "${GREEN}🚀 Starting FastAPI Backend with Process-Isolated SageMath...${NC}"
echo -e "${BLUE}📊 This version runs SageMath in separate processes for maximum stability${NC}"
echo -e "${BLUE}🔧 No threading conflicts with PARI/GP${NC}"
echo ""

# Start the FastAPI backend
python backend_process.py
