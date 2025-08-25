#!/bin/bash

echo "Starting Galois Playground Frontend..."
echo "===================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm not found. Please install Node.js and npm."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Navigate to the UI directory
cd ui || {
    echo "Error: 'ui' directory not found. Make sure you're in the project root directory."
    exit 1
}

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies. Please check npm and Node.js installation."
        exit 1
    fi
    echo "Dependencies installed successfully."
fi

# Start the frontend
echo "Starting frontend server at http://localhost:3000"
npm run dev
