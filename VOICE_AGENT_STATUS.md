# Voice Agent Setup & Testing Guide

## ✅ What's Been Completed

### Phase 1: Foundation (100% Complete)

- ✅ Backend voice server infrastructure
- ✅ Sarvam AI client for STT/TTS (10+ languages)
- ✅ Gemini client for LLM reasoning (FREE tier)
- ✅ Pipecat pipeline orchestration
- ✅ WebRTC handler for real-time communication
- ✅ Session management (in-memory & Redis options)
- ✅ Frontend voice components and hooks
- ✅ Test server for development without API keys

## 🚀 Quick Start (No API Keys Required)

### 1. Install Dependencies ✅

Already installed:

- FastAPI, uvicorn
- Sarvam AI SDK
- Google Gemini SDK
- Pipecat framework
- WebRTC (aiortc)
- Session management

### 2. Run Component Tests ✅

```powershell
# Test session management and mock voice flow
python backend\test_voice.py
```

**Result:** All tests passed! ✅

- Session creation/retrieval
- Conversation history
- Context management
- Mock voice flow simulation

### 3. Run Test Server (Without API Keys)

```powershell
# Start minimal test server on port 8001
cd D:\data\id\ai_detector\ai_detector_full
$env:PYTHONPATH = "D:\data\id\ai_detector\ai_detector_full\backend"
.\env\Scripts\python.exe -m uvicorn voice_test_server:app --host 0.0.0.0 --port 8001
```

**Features Available:**

- ✅ Session management (create, get, delete)
- ✅ Text message processing (mock responses)
- ✅ Conversation history tracking
- ✅ Detection results context
- ❌ Real voice (requires API keys)

### 4. Test API Endpoints

```powershell
# In a new terminal, run API tests
python backend\test_api.py
```

**Tests:**

1. Health check
2. Create session
3. Get session info
4. Send text message
5. Set detection results
6. Ask about results
7. Delete session

## 🔑 Enabling Full Voice Features

### Get API Keys

#### 1. Google Gemini (FREE) ⭐

- Visit: https://ai.google.dev
- Sign in with Google account
- Click "Get API Key"
- Copy your key
- **Cost:** FREE (2M tokens/min, 1500 RPM)

#### 2. Sarvam AI (Paid)

- Visit: https://sarvam.ai
- Create account
- Subscribe to API plan
- Copy API key
- **Cost:** Pay-as-you-go for STT/TTS

### Configure Environment

```powershell
# Edit backend\voice\.env
notepad backend\voice\.env
```

Add your keys:

```env
SARVAM_API_KEY=your_sarvam_key_here
GEMINI_API_KEY=your_gemini_key_here
REDIS_URL=redis://localhost:6379/0
PORT=8001
HOST=0.0.0.0
```

### Install Redis (Optional)

For production use with Redis session storage:

**Windows:**

```powershell
# Download from https://github.com/Aksh-Agrawal/ai_detector_/microsoftarchive/redis/releases
# Or use WSL:
wsl --install
wsl -d Ubuntu
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**For Development:** Use in-memory session manager (already working!)

### Run Full Voice Server

```powershell
cd D:\data\id\ai_detector\ai_detector_full\backend
# Activate environment if not active
..\env\Scripts\Activate.ps1

# Run voice server
python -m voice.voice_server
```

## 🌐 Frontend Integration

### Start Frontend (Next.js)

```powershell
cd D:\data\id\ai_detector\ai_detector_full\frontend-next
npm run dev
```

### Access Voice Assistant

Open browser: http://localhost:3000/voice

**Features:**

- 🎤 Voice input (microphone)
- 🔊 Voice output (text-to-speech)
- 💬 Text chat interface
- 🌍 Language selector (6+ Indian languages)
- 🎭 Voice selector (meera, arjun, kavya)
- 📊 Detection results Q&A

## 📁 Project Structure

```
backend/
├── voice/
│   ├── __init__.py                    # Module initialization
│   ├── requirements.txt               # Dependencies
│   ├── .env                          # API keys (create from .env.example)
│   ├── .env.example                  # Environment template
│   ├── sarvam_client.py              # Sarvam AI integration
│   ├── gemini_client.py              # Gemini LLM client
│   ├── pipecat_pipeline.py           # Voice pipeline orchestration
│   ├── webrtc_handler.py             # WebRTC management
│   ├── session_manager.py            # Redis session storage
│   ├── session_manager_memory.py     # In-memory storage (testing)
│   ├── voice_server.py               # Full FastAPI server
│   ├── README.md                     # Detailed documentation
│   ├── run.ps1                       # Windows setup script
│   └── run.sh                        # Linux/Mac setup script
├── voice_test_server.py              # Test server (no API keys)
├── test_voice.py                     # Component tests
└── test_api.py                       # API endpoint tests

frontend-next/
├── app/
│   └── voice/
│       └── page.tsx                  # Voice assistant page
├── components/
│   ├── VoiceButton.tsx              # Animated mic button
│   └── VoiceChat.tsx                # Chat interface
└── hooks/
    ├── useWebRTC.ts                 # WebRTC connection
    └── useVoiceChat.ts              # Voice chat state
```

## 🧪 Test Results

### ✅ Component Tests (Passed)

```
🧪 Voice Agent Component Tests
==================================================

=== Testing Session Manager ===
✓ Session created
✓ Session retrieved
✓ History added (2 messages)
✓ Context set
✓ Context retrieved
✓ Session deleted

=== Testing Mock Voice Flow ===
✓ Session started
✓ Conversation stored (6 messages)
✓ Detection results added to context

✅ All tests completed successfully!
```

### ⚙️ Server Status

- Test server running on port 8001
- In-memory session storage active
- No API keys required for basic testing
- Ready for frontend integration

## 📊 Current Capabilities

### Without API Keys (Test Mode)

- ✅ Session management
- ✅ Text message processing
- ✅ Conversation history
- ✅ Context storage
- ✅ Mock responses
- ❌ Real voice synthesis
- ❌ Speech recognition
- ❌ AI reasoning

### With API Keys (Full Features)

- ✅ All test mode features
- ✅ Real-time speech-to-text (10+ languages)
- ✅ Text-to-speech (3 voices)
- ✅ AI reasoning with Gemini
- ✅ Interactive Q&A about detection results
- ✅ Multi-turn conversations
- ✅ Context-aware responses

## 🎯 Next Steps

### Option 1: Continue with Test Mode

- Frontend already works with test server
- Can develop UI without API keys
- Mock responses for all interactions
- Perfect for design/UX development

### Option 2: Enable Full Voice

1. Get Gemini API key (FREE)
2. Get Sarvam API key (paid)
3. Update .env file
4. Run full voice server
5. Test at /voice page

### Option 3: Proceed to Phase 2

Once basic testing is satisfactory:

- Integrate with existing detection system
- Pass real detection results to voice agent
- Enable interactive explanations
- Implement tutorial mode

## 🔧 Troubleshooting

### Server Won't Start

```powershell
# Check if port is in use
netstat -ano | findstr :8001

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
python -m uvicorn voice_test_server:app --port 8001
```

### Import Errors

```powershell
# Ensure environment is activated
.\env\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r backend\voice\requirements.txt
```

### Frontend Connection Issues

```powershell
# Check CORS settings in server
# Ensure frontend runs on localhost:3000
# Check browser console for errors
```

## 📝 Summary

✅ **Phase 1 Complete:**

- All backend infrastructure built
- Frontend components ready
- Test server operational
- Component tests passing
- Ready for API key integration

🚀 **Ready to Test:**

- Test server: http://localhost:8001
- Health check: http://localhost:8001/health
- Frontend: http://localhost:3000/voice (when running)

📋 **To Enable Full Voice:**

1. Get free Gemini API key
2. Get Sarvam API key (paid)
3. Update .env file
4. Switch to full voice server
5. Test voice features

---

**Created:** December 14, 2025  
**Status:** Phase 1 Complete ✅  
**Next:** Get API keys or proceed with test mode
