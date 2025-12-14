# 🚀 Quick Start - All Servers
# Run this script to start all three servers

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  🤖 AI Detector - Starting All Servers" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\data\id\ai_detector\ai_detector_full"

# Start Backend (Flask - Port 8000)
Write-Host "1️⃣  Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectRoot'; .\env\Scripts\Activate.ps1; python .\backend\app.py"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Voice Server (Port 8001)
Write-Host "2️⃣  Starting Voice Server (Port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectRoot\backend'; ..\env\Scripts\Activate.ps1; python start_voice_server.py"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend (Next.js - Port 3000)
Write-Host "3️⃣  Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectRoot\frontend-next'; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "  ✅ All Servers Started!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host ""
Write-Host "  📱 Open in browser:" -ForegroundColor White
Write-Host "     Main App:       http://localhost:3000" -ForegroundColor Cyan
Write-Host "     AI Detector:    http://localhost:3000/detector" -ForegroundColor Cyan
Write-Host "     Voice Assistant: http://localhost:3000/voice" -ForegroundColor Magenta
Write-Host ""
Write-Host "  🔧 API Endpoints:" -ForegroundColor White
Write-Host "     Backend:        http://localhost:8000" -ForegroundColor Yellow
Write-Host "     Voice Server:   http://localhost:8001" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ⚡ Each server is running in its own window" -ForegroundColor Gray
Write-Host "  🛑 Close the terminal windows to stop servers" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host ""

# Keep this window open
Read-Host "Press Enter to close this window"
