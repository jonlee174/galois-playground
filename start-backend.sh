#!/bin/bash
# Starts the FastAPI + SageMath backend using the project-local pixi environment.
# pixi resolves Python, SageMath, fastapi and uvicorn from pixi.lock, so no
# conda activation, shell hooks, or system Python are involved.

cd "$(dirname "$0")" || exit 1

if ! command -v pixi &> /dev/null; then
    echo "Error: pixi not found."
    echo "Install it with:  brew install pixi"
    echo "   or:            curl -fsSL https://pixi.sh/install.sh | sh"
    exit 1
fi

echo "Starting Correspondence Backend (http://localhost:8001)..."
echo "First run downloads SageMath into .pixi/ and may take several minutes."
echo ""

exec pixi run backend
