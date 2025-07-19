#!/bin/bash

# FitMind Development Server Startup Script

echo "🧠 Starting FitMind Development Servers..."
echo

# Check if tmux is available (for better terminal management)
if command -v tmux &> /dev/null; then
    echo "Using tmux for session management..."
    
    # Create new tmux session
    tmux new-session -d -s fitmind
    
    # Split window horizontally
    tmux split-window -h
    
    # Run backend in left pane
    tmux send-keys -t 0 'cd backend && echo "🚀 Starting Backend Server..." && node server.js' Enter
    
    # Run frontend in right pane  
    tmux send-keys -t 1 'cd frontend && echo "🎨 Starting Frontend Server..." && npm run dev' Enter
    
    echo "✅ Servers started in tmux session 'fitmind'"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔌 Backend: http://localhost:5000"
    echo
    echo "To attach to session: tmux attach -t fitmind"
    echo "To kill session: tmux kill-session -t fitmind"
    
else
    echo "Starting servers in background..."
    
    # Start backend
    cd backend
    echo "🚀 Starting Backend Server..."
    node server.js &
    BACKEND_PID=$!
    
    # Start frontend
    cd ../frontend
    echo "🎨 Starting Frontend Server..."
    npm run dev &
    FRONTEND_PID=$!
    
    echo "✅ Servers started!"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔌 Backend: http://localhost:5000"
    echo
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    echo
    echo "To stop servers:"
    echo "kill $BACKEND_PID $FRONTEND_PID"
    
    # Wait for processes
    wait
fi
