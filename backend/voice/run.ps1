# Voice Agent Setup and Run Script (Windows)

Write-Host "🎙️  AI Detector Voice Agent Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check Python version
Write-Host "`n📋 Checking Python version..." -ForegroundColor Yellow
python --version

# Check if virtual environment exists
if (-Not (Test-Path "..\..\env")) {
    Write-Host "❌ Virtual environment not found at ..\..\env" -ForegroundColor Red
    Write-Host "Please create a virtual environment first:" -ForegroundColor Yellow
    Write-Host "python -m venv env" -ForegroundColor White
    exit 1
}

# Activate virtual environment
Write-Host "`n🔧 Activating virtual environment..." -ForegroundColor Yellow
& "..\..\env\Scripts\Activate.ps1"

# Install voice dependencies
Write-Host "`n📦 Installing voice agent dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check for Redis
Write-Host "`n🔍 Checking Redis..." -ForegroundColor Yellow
try {
    $redisCheck = redis-cli ping 2>$null
    if ($redisCheck -eq "PONG") {
        Write-Host "✅ Redis is running" -ForegroundColor Green
    } else {
        throw "Redis not responding"
    }
} catch {
    Write-Host "❌ Redis is not running" -ForegroundColor Red
    Write-Host "Please start Redis first:" -ForegroundColor Yellow
    Write-Host "  - Download: https://github.com/microsoftarchive/redis/releases" -ForegroundColor White
    Write-Host "  - Run: redis-server" -ForegroundColor White
    exit 1
}

# Check for API keys
Write-Host "`n🔑 Checking API keys..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content .env -Raw
    
    if ($envContent -notmatch "SARVAM_API_KEY=.+" -or $envContent -match "your_sarvam_api_key_here") {
        Write-Host "⚠️  SARVAM_API_KEY not set in .env" -ForegroundColor Yellow
        Write-Host "Get your key from: https://www.sarvam.ai/" -ForegroundColor White
    }
    
    if ($envContent -notmatch "GEMINI_API_KEY=.+" -or $envContent -match "your_gemini_api_key_here") {
        Write-Host "⚠️  GEMINI_API_KEY not set in .env" -ForegroundColor Yellow
        Write-Host "Get your FREE key from: https://ai.google.dev/" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "Copying .env.example to .env..." -ForegroundColor White
    Copy-Item .env.example .env
    Write-Host "Please edit .env and add your API keys" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n🚀 Starting Voice Server..." -ForegroundColor Cyan
Write-Host "Server will run on http://localhost:8001" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop`n" -ForegroundColor Gray

# Run the server
python -m voice.voice_server
