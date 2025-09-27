#!/bin/bash

echo "🚀 Starting Digital Wardrobe Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one based on env.example"
    echo "📝 Copying env.example to .env..."
    cp env.example .env
    echo "✅ Please edit .env file with your actual credentials before running again"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start backend server in background
echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

echo "✅ Application started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup on exit
echo "🛑 Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "✅ Servers stopped"
