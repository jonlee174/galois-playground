#!/bin/bash
# Starts the Vite dev server using the Node.js from the project-local pixi
# environment. Installs ui/node_modules automatically when package files change.

cd "$(dirname "$0")" || exit 1

if ! command -v pixi &> /dev/null; then
    echo "Error: pixi not found."
    echo "Install it with:  brew install pixi"
    echo "   or:            curl -fsSL https://pixi.sh/install.sh | sh"
    exit 1
fi

echo "Starting Correspondence Frontend (http://localhost:3000)..."
echo ""

exec pixi run frontend
