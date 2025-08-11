#!/bin/bash

# Galois Playground Native Runner
# Runs both frontend and backend without Docker

set -e

PROJECT_DIR="/home/jlee/git/galois-playground"
FRONTEND_DIR="$PROJECT_DIR/ui"
BACKEND_FILE="$PROJECT_DIR/backend_process.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to stop existing processes
stop_services() {
    print_status "Stopping existing services..."
    
    # Stop backend
    pkill -f "python.*backend" 2>/dev/null || true
    pkill -f "uvicorn" 2>/dev/null || true

    # Stop frontend
    pkill -f "npm.*run.*dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    sleep 2
    print_success "Existing services stopped"
}

# Function to start backend
start_backend() {
    print_status "Starting Process-Isolated FastAPI backend with SageMath..."
    
    cd "$PROJECT_DIR"
    
    # Use the process-based FastAPI startup script
    if [ -x "./start-process-backend.sh" ]; then
        ./start-process-backend.sh &
        BACKEND_PID=$!
    else
        print_error "Process backend startup script not found or not executable"
        return 1
    fi
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    for i in {1..30}; do
        if check_port 8001; then
            print_success "Backend started on http://localhost:8001"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    print_error "Backend failed to start"
    return 1
}

# Function to start frontend
start_frontend() {
    print_status "Starting React frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    for i in {1..30}; do
        if check_port 3000; then
            print_success "Frontend started on http://localhost:3000"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    print_error "Frontend failed to start"
    return 1
}

# Function to test backend API
test_backend() {
    print_status "Testing backend API..."
    
    # Test the basic endpoint
    if curl -s -f http://localhost:8001/api/test > /dev/null; then
        print_success "Backend API is responding"
        
        # Test a simple Galois computation
        print_status "Testing Galois computation..."
        RESULT=$(curl -s -X POST http://localhost:8001/api/galois \
            -H "Content-Type: application/json" \
            -d '{"polynomial": "x^2 - 2"}' | grep -o '"polynomial":"x^2 - 2"' || echo "")
        
        if [ "$RESULT" = '"polynomial":"x^2 - 2"' ]; then
            print_success "Galois computation test passed"
        else
            print_warning "Galois computation test failed, but API is responding"
        fi
    else
        print_error "Backend API is not responding"
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}🚀 Galois Playground Native Runner${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo ""
    
    # Stop any existing services
    stop_services
    
    # Start backend
    if ! start_backend; then
        print_error "Failed to start backend"
        exit 1
    fi
    
    # Test backend
    test_backend
    
    # Start frontend
    if ! start_frontend; then
        print_error "Failed to start frontend"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    echo ""
    print_success "🎉 Galois Playground is running!"
    echo ""
    echo -e "${GREEN}📊 Backend:  http://localhost:8001${NC}"
    echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Wait for user interrupt
    trap 'echo ""; print_status "Shutting down..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; stop_services; print_success "All services stopped. Goodbye!"; exit 0' INT
    
    # Keep script running
    wait
}

# Check command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        stop_services
        ;;
    "test")
        test_backend
        ;;
    "backend")
        stop_services
        start_backend
        echo "Backend running. Press Ctrl+C to stop."
        trap 'stop_services; exit 0' INT
        wait
        ;;
    "frontend")
        cd "$FRONTEND_DIR"
        npm run dev
        ;;
    *)
        echo "Usage: $0 {start|stop|test|backend|frontend}"
        echo ""
        echo "Commands:"
        echo "  start     - Start both backend and frontend (default)"
        echo "  stop      - Stop all services"
        echo "  test      - Test backend API"
        echo "  backend   - Start only backend"
        echo "  frontend  - Start only frontend"
        exit 1
        ;;
esac
