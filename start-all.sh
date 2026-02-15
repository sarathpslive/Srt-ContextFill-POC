#!/bin/bash

# Context Fill POC - Start All Services Script
# This script starts all three services: Firebase Emulator, Backend, and Frontend

echo "🚀 Starting Context Fill POC Services..."
echo ""

# Check if required directories exist
if [ ! -d "context-fill-backend" ] || [ ! -d "context-fill-frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    pkill -f "ts-node src/server.ts" 2>/dev/null
    pkill -f "npm run start" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend Server
echo "🖥️  Starting Backend Server..."
cd context-fill-backend
npm run dev > /tmp/backend-server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for Backend to start
sleep 3

# Start Frontend Application
echo "🌐 Starting Frontend Application..."
cd context-fill-frontend
npm run start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend:          http://localhost:4200"
echo "   Backend API:       http://localhost:3000"
echo "   Firebase Emulator: http://localhost:4000"
echo "   Firestore:         localhost:8080"
echo ""
echo "📝 Logs:"
echo "   Firebase: /tmp/firebase-emulator.log"
echo "   Backend:  /tmp/backend-server.log"
echo "   Frontend: /tmp/frontend.log"
echo ""
echo "Press Ctrl+C to http://localhost:4200"
echo "   Backend API: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   Backend:  /tmp/backend-server.log"
echo "   Frontend: /tmp/frontend.log"
echo "   Form Submissions: context-fill-backend/form_submissions