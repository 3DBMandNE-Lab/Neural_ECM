#!/bin/bash

# Neural ECM Repository Startup Script
# This script starts both the API server and web application

echo "🚀 Starting Neural ECM Explorer..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install Python dependencies
echo "Installing Python dependencies..."
cd src/api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ../..

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd src/web
npm install
cd ../..

echo "✅ Dependencies installed successfully!"

# Validate data
echo "🔍 Validating data files..."
python3 src/utils/validate_data.py
if [ $? -ne 0 ]; then
    echo "❌ Data validation failed. Please check the errors above."
    exit 1
fi

echo "✅ Data validation passed!"

# Start the API server in the background
echo "🌐 Starting API server..."
cd src/api
source venv/bin/activate
python app.py &
API_PID=$!
cd ../..

# Wait a moment for the API to start
sleep 3

# Start the web application
echo "🌍 Starting web application..."
cd src/web
npm start &
WEB_PID=$!
cd ../..

echo "🎉 Neural ECM Explorer is starting up!"
echo "📊 API server: http://localhost:5000"
echo "🌐 Web application: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    echo "✅ Services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 