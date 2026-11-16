#!/bin/bash
# Starts backend and frontend together. Uses tmux (split view) if available,
# otherwise runs both in this terminal and stops both on Ctrl+C.

cd "$(dirname "$0")" || exit 1

if ! command -v pixi &> /dev/null; then
    echo "Error: pixi not found."
    echo "Install it with:  brew install pixi"
    echo "   or:            curl -fsSL https://pixi.sh/install.sh | sh"
    exit 1
fi

echo "Starting Correspondence (Backend and Frontend)"
echo "================================================="
echo "Backend:  http://localhost:8001"
echo "Frontend: http://localhost:3000"
echo ""

# Make sure the environment exists before splitting into two processes,
# so both don't try to install it at the same time.
pixi install || exit 1

if command -v tmux &> /dev/null; then
    tmux new-session -d -s galois-playground './start-backend.sh'
    tmux split-window -h -t galois-playground './start-frontend.sh'
    tmux attach-session -t galois-playground
    tmux kill-session -t galois-playground 2>/dev/null
else
    ./start-backend.sh &
    BACKEND_PID=$!
    trap 'kill $BACKEND_PID 2>/dev/null' EXIT INT TERM
    ./start-frontend.sh
fi
