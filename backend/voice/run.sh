#!/bin/bash

# Voice Agent Setup and Run Script

echo "🎙️  AI Detector Voice Agent Setup"
echo "=================================="

# Check Python version
echo "\n📋 Checking Python version..."
python --version

# Check if virtual environment exists
if [ ! -d "../../env" ]; then
    echo "❌ Virtual environment not found at ../../env"
    echo "Please create a virtual environment first:"
    echo "python -m venv env"
    exit 1
fi

# Activate virtual environment
echo "\n🔧 Activating virtual environment..."
source ../../env/bin/activate

# Install voice dependencies
echo "\n📦 Installing voice agent dependencies..."
pip install -r requirements.txt

# Check for Redis
echo "\n🔍 Checking Redis..."
redis-cli ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running"
    echo "Please start Redis first:"
    echo "  - Windows: redis-server"
    echo "  - Linux/Mac: sudo service redis-server start"
    echo "  - Or install: https://redis.io/download"
    exit 1
fi

# Check for API keys
echo "\n🔑 Checking API keys..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
    source .env
    
    if [ -z "$SARVAM_API_KEY" ] || [ "$SARVAM_API_KEY" == "your_sarvam_api_key_here" ]; then
        echo "⚠️  SARVAM_API_KEY not set in .env"
        echo "Get your key from: https://www.sarvam.ai/"
    fi
    
    if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" == "your_gemini_api_key_here" ]; then
        echo "⚠️  GEMINI_API_KEY not set in .env"
        echo "Get your FREE key from: https://ai.google.dev/"
    fi
else
    echo "⚠️  .env file not found"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "Please edit .env and add your API keys"
    exit 1
fi

echo "\n✅ Setup complete!"
echo "\n🚀 Starting Voice Server..."
echo "Server will run on http://localhost:8001"
echo "\nPress Ctrl+C to stop\n"

# Run the server
python -m voice.voice_server
