# 🤖 AI Detector with Voice Assistant

A comprehensive AI text detection system with multilingual voice assistant capabilities.

## 🌟 Features

- **AI Text Detection**: Detect AI-generated content with high accuracy
- **Multilingual Support**: Analyze text in multiple languages
- **Voice Assistant**: Interactive voice agent for results explanation (10+ Indian languages)
- **Modern UI**: Next.js frontend with smooth animations
- **Real-time Analysis**: Instant detection results
- **Batch Processing**: Analyze multiple documents
- **Voice Features**:
  - Text-to-Speech (TTS) in multiple voices
  - Speech-to-Text (STT) in 10+ languages
  - Interactive Q&A about detection results
  - Tutorial mode and guided analysis

## 📋 Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **Virtual Environment**: Already set up in `env/`

## 🚀 Quick Start (3 Terminals)

### Terminal 1: Backend (AI Detection Server)

```powershell
# Navigate to project root
cd D:\data\id\ai_detector\ai_detector_full

# Activate virtual environment
.\env\Scripts\Activate.ps1

# Start Flask backend (port 8000)
python .\backend\app.py
```

**Expected Output:**

```
* Running on http://127.0.0.1:8000
* Running on http://<your-ip>:8000
```

---

### Terminal 2: Voice Agent Server

```powershell
# Navigate to project root
cd D:\data\id\ai_detector\ai_detector_full

# Activate virtual environment
.\env\Scripts\Activate.ps1

# Set Python path and start voice server (port 8001)
$env:PYTHONPATH = "D:\data\id\ai_detector\ai_detector_full\backend"
python -m uvicorn voice_test_server:app --host 0.0.0.0 --port 8001
```

**Expected Output:**

```
INFO: Uvicorn running on http://0.0.0.0:8001
Starting Minimal Voice Server (Test Mode)...
Test server started successfully - no API keys required
```

**Note:** Test mode works without API keys. For full voice features, see [Voice Agent Setup](#-voice-agent-setup).

---

### Terminal 3: Frontend (Next.js)

```powershell
# Navigate to frontend directory
cd D:\data\id\ai_detector\ai_detector_full\frontend-next

# Install dependencies (first time only)
npm install

# Start development server (port 3000)
npm run dev
```

**Expected Output:**

```
- Local:        http://localhost:3000
- Network:      http://<your-ip>:3000
✓ Ready in 2.5s
```

---

## 🌐 Access the Application

Once all three servers are running:

| Service             | URL                            | Description              |
| ------------------- | ------------------------------ | ------------------------ |
| **Main App**        | http://localhost:3000          | Home page and navigation |
| **AI Detector**     | http://localhost:3000/detector | Text detection interface |
| **Voice Assistant** | http://localhost:3000/voice    | Interactive voice agent  |
| **Backend API**     | http://localhost:8000          | Flask API endpoints      |
| **Voice API**       | http://localhost:8001          | Voice agent endpoints    |

## 📦 Project Structure

```
ai_detector_full/
├── backend/
│   ├── app.py                    # Flask server (port 8000)
│   ├── requirements.txt          # Python dependencies
│   ├── voice/                    # Voice agent module
│   │   ├── voice_server.py       # Full voice server
│   │   ├── sarvam_client.py      # Sarvam AI (STT/TTS)
│   │   ├── gemini_client.py      # Google Gemini (LLM)
│   │   ├── pipecat_pipeline.py   # Voice pipeline
│   │   ├── webrtc_handler.py     # WebRTC support
│   │   ├── session_manager*.py   # Session management
│   │   └── .env                  # API keys (create this)
│   ├── voice_test_server.py      # Test server (no keys needed)
│   ├── test_voice.py             # Component tests
│   └── test_api.py               # API tests
├── frontend-next/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── detector/page.tsx     # Detection interface
│   │   └── voice/page.tsx        # Voice assistant
│   ├── components/               # React components
│   ├── hooks/                    # Custom hooks
│   └── package.json              # Node dependencies
├── env/                          # Python virtual environment
├── extension/                    # Browser extension (optional)
├── README.md                     # This file
├── VOICE_AGENT_STATUS.md         # Voice setup guide
├── VOICE_QUICK_REFERENCE.md      # Voice quick reference
└── VOICE_AGENT_SPECIFICATION.md  # Technical specification
```

## 🎯 Usage Guide

### 1. Text Detection (Basic Mode)

1. Go to http://localhost:3000/detector
2. Paste or type text to analyze
3. Click "Detect AI Content"
4. View results with probability scores

### 2. Voice Assistant (Test Mode)

1. Go to http://localhost:3000/voice
2. Select language (English, Hindi, etc.)
3. Click "Connect to Voice Agent"
4. Type messages in the chat
5. Receive text responses

### 3. Voice Assistant (Full Mode - with API Keys)

1. Get API keys (see below)
2. Configure `.env` file
3. Restart voice server
4. Connect and use:
   - 🎤 Voice input (click mic button)
   - 🔊 Voice output (AI speaks responses)
   - 💬 Text chat
   - 📊 Ask about detection results

## 🔑 Voice Agent Setup

### Test Mode (No API Keys) ✅

The project runs in test mode by default:

- ✅ Text chat works
- ✅ Session management
- ✅ Mock responses
- ❌ No real voice (TTS/STT)
- ❌ No AI reasoning

### Full Mode (Requires API Keys)

#### Step 1: Get API Keys

**Google Gemini (FREE)** ⭐

- Visit: https://ai.google.dev
- Sign in with Google account
- Click "Get API Key"
- Copy your API key
- **Cost:** FREE (2M tokens/min)

**Sarvam AI (Paid)**

- Visit: https://sarvam.ai
- Create account
- Subscribe to API plan
- Copy your API key
- **Cost:** ~$0.02/min (STT) + ~$0.01/min (TTS)

#### Step 2: Configure Environment

```powershell
# Create .env file from template
Copy-Item backend\voice\.env.example backend\voice\.env

# Edit the file
notepad backend\voice\.env
```

Add your keys:

```env
SARVAM_API_KEY=your_sarvam_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_URL=redis://localhost:6379/0
PORT=8001
HOST=0.0.0.0
```

#### Step 3: Run Full Voice Server

```powershell
cd D:\data\id\ai_detector\ai_detector_full\backend

# Activate environment
..\env\Scripts\Activate.ps1

# Run full voice server (instead of test server)
python -m voice.voice_server
```

## 🧪 Testing

### Test Components

```powershell
# Test session manager and voice flow
python backend\test_voice.py
```

### Test API Endpoints

```powershell
# Make sure voice server is running first
python backend\test_api.py
```

### Check Server Status

```powershell
# Check if ports are in use
netstat -ano | findstr "8000 8001 3000"

# Test backend API
Invoke-WebRequest http://localhost:8000/api/health

# Test voice server
Invoke-WebRequest http://localhost:8001/health
```

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Find process using the port
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

### Frontend Won't Start

```powershell
cd frontend-next

# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev
```

### Backend Import Errors

```powershell
# Activate environment
.\env\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r backend\requirements.txt
pip install -r backend\voice\requirements.txt
```

### Voice Server Issues

```powershell
# Check Python path is set
echo $env:PYTHONPATH

# Should output: D:\data\id\ai_detector\ai_detector_full\backend

# If not, set it:
$env:PYTHONPATH = "D:\data\id\ai_detector\ai_detector_full\backend"
```

### CORS Errors

- Ensure backend runs on port 8000
- Ensure voice server runs on port 8001
- Ensure frontend runs on port 3000
- Check browser console for specific errors

## 🎨 Customization

### Change Ports

**Backend (Flask):**
Edit `backend\app.py`:

```python
app.run(debug=True, port=YOUR_PORT)
```

**Voice Server:**
Edit `backend\voice\.env`:

```env
PORT=YOUR_PORT
```

**Frontend:**
Edit `frontend-next\package.json`:

```json
"scripts": {
  "dev": "next dev -p YOUR_PORT"
}
```

### Add Languages

Voice agent supports:

- English (en-IN)
- Hindi (hi-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Marathi (mr-IN)
- Gujarati (gu-IN)
- Bengali (bn-IN)
- Punjabi (pa-IN)

Edit `frontend-next\app\voice\page.tsx` to add more.

## 📚 Additional Resources

- **Voice Setup Guide:** [VOICE_AGENT_STATUS.md](./VOICE_AGENT_STATUS.md)
- **Quick Reference:** [VOICE_QUICK_REFERENCE.md](./VOICE_QUICK_REFERENCE.md)
- **Technical Spec:** [VOICE_AGENT_SPECIFICATION.md](./VOICE_AGENT_SPECIFICATION.md)
- **Voice API Docs:** [backend/voice/README.md](./backend/voice/README.md)

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep API keys secure
- Use environment variables for production
- Enable authentication for production deployment
- Use HTTPS in production

## 📝 Development Workflow

### Daily Development

```powershell
# Start all servers with one script (create this)
.\start-dev.ps1
```

Create `start-dev.ps1`:

```powershell
# Start all services in new windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\env\Scripts\Activate.ps1; python .\backend\app.py"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\env\Scripts\Activate.ps1; `$env:PYTHONPATH='$PWD\backend'; python -m uvicorn voice_test_server:app --port 8001"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend-next'; npm run dev"

Write-Host "All servers starting..."
Write-Host "Backend: http://localhost:8000"
Write-Host "Voice: http://localhost:8001"
Write-Host "Frontend: http://localhost:3000"
```

## 🚀 Production Deployment

### Build Frontend

```powershell
cd frontend-next
npm run build
npm start
```

### Run Backend with Gunicorn

```powershell
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app
```

### Run Voice Server

```powershell
uvicorn voice_server:app --host 0.0.0.0 --port 8001 --workers 4
```

## 📊 System Requirements

### Minimum

- RAM: 4GB
- CPU: 2 cores
- Storage: 2GB free space
- Internet: Required for API calls

### Recommended

- RAM: 8GB
- CPU: 4 cores
- Storage: 5GB free space
- Internet: Stable high-speed connection

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

[Your License Here]

## 👥 Authors

[Your Name/Team]

## 🆘 Support

For issues and questions:

- Check [Troubleshooting](#-troubleshooting)
- Review documentation in `/docs`
- Check terminal logs for errors

---

## ⚡ Quick Start Commands

### First Time Setup

```powershell
# 1. Install frontend dependencies
cd frontend-next
npm install

# 2. Create voice .env file
Copy-Item backend\voice\.env.example backend\voice\.env
```

### Every Time (3 Terminals)

```powershell
# Terminal 1: Backend
.\env\Scripts\Activate.ps1; python .\backend\app.py

# Terminal 2: Voice
.\env\Scripts\Activate.ps1; $env:PYTHONPATH="$PWD\backend"; python -m uvicorn voice_test_server:app --port 8001

# Terminal 3: Frontend
cd frontend-next; npm run dev
```

### Open Application

```
http://localhost:3000
```

---

**🎉 You're all set! Start all three servers and enjoy your AI Detector with Voice Assistant!**
