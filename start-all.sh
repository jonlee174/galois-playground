#!/bin/bash

echo "Starting Galois Playground (Backend and Frontend)"
echo "================================================="
echo ""

# Check if we're running on Windows (GitBash or WSL)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || -f /proc/version && $(cat /proc/version) == *Microsoft* ]]; then
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Check if tmux is available for non-Windows systems
if ! $IS_WINDOWS && command -v tmux &> /dev/null; then
    echo "Using tmux to start both services..."
    
    # Start a new tmux session with backend
    tmux new-session -d -s galois-playground 'bash start-backend.sh'
    
    # Split the window and start the frontend
    tmux split-window -h -t galois-playground 'cd ui && npm run dev'
    
    # Attach to the session
    tmux attach-session -t galois-playground
    
    # When detached, kill the session
    tmux kill-session -t galois-playground
else
    # Check if Node.js and npm are installed
    if ! command -v npm &> /dev/null; then
        echo "Error: npm not found. Please install Node.js and npm."
        echo "Visit https://nodejs.org/ for installation instructions."
        exit 1
    fi
    
    # Check if frontend dependencies are installed
    if [ ! -d "ui/node_modules" ]; then
        echo "Installing frontend dependencies..."
        cd ui
        npm install
        cd ..
    fi
    
    echo "Starting backend and frontend in separate terminals..."
    
    if $IS_WINDOWS; then
        # Windows approach
        start cmd /c "bash start-backend.sh"
        start cmd /c "cd ui && npm run dev"
    else
        # Linux/Mac approach - try various terminal emulators
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "./start-backend.sh; exec bash"
            gnome-terminal -- bash -c "cd ui && npm run dev; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "./start-backend.sh" &
            xterm -e "cd ui && npm run dev" &
        elif command -v konsole &> /dev/null; then
            konsole -e "./start-backend.sh" &
            konsole -e "cd ui && npm run dev" &
        elif command -v terminal &> /dev/null; then
            terminal -e "./start-backend.sh" &
            terminal -e "cd ui && npm run dev" &
        else
            echo "No supported terminal emulator found."
            echo "Please start the backend and frontend manually in separate terminals:"
            echo ""
            echo "Terminal 1: ./start-backend.sh"
            echo "Terminal 2: cd ui && npm run dev"
            exit 1
        fi
    fi
    
    echo ""
    echo "Services started in separate windows."
    echo "Backend: http://localhost:8001"
    echo "Frontend: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop this script (but you'll need to close the other terminals manually)."
    
    # Keep the script running
    while true; do sleep 1; done
fi
