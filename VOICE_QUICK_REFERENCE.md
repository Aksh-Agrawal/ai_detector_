# 🎙️ Voice Agent - Quick Reference

## 📦 What You Have Now

```
✅ Backend Components
   ├─ Voice Server (FastAPI on port 8001)
   ├─ Sarvam AI Client (STT/TTS for 10+ languages)
   ├─ Gemini Client (FREE AI reasoning)
   ├─ WebRTC Handler (real-time voice)
   ├─ Session Manager (conversation state)
   └─ Test Server (works without API keys!)

✅ Frontend Components
   ├─ Voice Page (/voice route)
   ├─ Voice Chat UI (messages, auto-scroll)
   ├─ Voice Button (animated mic)
   ├─ WebRTC Hook (peer connections)
   └─ Voice Chat Hook (state management)

✅ Testing Tools
   ├─ Component tests (test_voice.py) ✅ PASSED
   ├─ API tests (test_api.py)
   └─ Test server (voice_test_server.py) ✅ RUNNING
```

## 🚀 How to Use (3 Options)

### Option A: Test Mode (No API Keys Needed)

**Best for:** UI/UX development, learning the system

```powershell
# 1. Start test server (already running!)
python -m uvicorn voice_test_server:app --port 8001

# 2. Start frontend
cd frontend-next
npm run dev

# 3. Open browser
http://localhost:3000/voice
```

**What works:**

- ✅ Text chat
- ✅ Session management
- ✅ Mock responses
- ❌ Real voice (needs API keys)

---

### Option B: Full Voice (Gemini Only - FREE)

**Best for:** Testing AI reasoning without voice

```powershell
# 1. Get FREE Gemini API key
https://ai.google.dev

# 2. Edit .env file
notepad backend\voice\.env
# Add: GEMINI_API_KEY=your_key_here

# 3. Run server with Gemini
# (Sarvam features will be disabled)
```

**What works:**

- ✅ Text chat
- ✅ AI reasoning (Gemini)
- ✅ Context-aware responses
- ❌ Voice input/output (needs Sarvam)

---

### Option C: Complete Voice (Gemini + Sarvam)

**Best for:** Full production features

```powershell
# 1. Get API keys
Gemini: https://ai.google.dev (FREE)
Sarvam: https://sarvam.ai (paid)

# 2. Update .env
GEMINI_API_KEY=your_gemini_key
SARVAM_API_KEY=your_sarvam_key

# 3. Run full server
python -m voice.voice_server
```

**What works:**

- ✅ Everything!
- ✅ Voice input (10+ languages)
- ✅ Voice output (3 voices)
- ✅ AI reasoning
- ✅ Real-time conversation

## 🎯 Test Results Summary

### Component Tests ✅

```bash
$ python backend\test_voice.py

✅ All session manager tests passed!
✅ Mock voice flow test passed!
```

### Server Status ✅

```
Voice Agent Test Server
- Port: 8001
- Mode: Test (no API keys required)
- Session Storage: In-memory
- Status: Running 🟢
```

## 📍 File Locations

### Important Files to Know

```
backend/voice/.env              ← Add your API keys here
backend/voice_test_server.py    ← Test server (no keys needed)
backend/test_voice.py           ← Run component tests
backend/test_api.py             ← Run API tests

frontend-next/app/voice/page.tsx     ← Voice UI page
frontend-next/components/VoiceChat.tsx  ← Chat interface

VOICE_AGENT_STATUS.md           ← Detailed guide (this directory)
VOICE_AGENT_SPECIFICATION.md    ← Technical specification
```

## 🌐 API Endpoints

Base URL: `http://localhost:8001`

```
GET  /                          Service info
GET  /health                    Health check
POST /api/voice/session         Create session
GET  /api/voice/session/{id}    Get session
DEL  /api/voice/session/{id}    Delete session
POST /api/voice/text            Send text message
POST /api/voice/results         Set detection context
POST /api/voice/webrtc/offer    WebRTC negotiation
POST /api/voice/webrtc/ice      ICE candidates
WS   /ws/voice/{session_id}     WebSocket stream
```

## 💡 Quick Commands

### Start Everything

```powershell
# Terminal 1: Test server
python -m uvicorn voice_test_server:app --port 8001

# Terminal 2: Frontend
cd frontend-next
npm run dev

# Browser
http://localhost:3000/voice
```

### Run Tests

```powershell
# Component tests
python backend\test_voice.py

# API tests (requires server running)
python backend\test_api.py
```

### Check Status

```powershell
# Server running?
netstat -ano | findstr :8001

# Environment activated?
python --version  # Should show Python 3.11

# Dependencies installed?
pip list | findstr fastapi
```

## 🎨 Voice Page Features

Visit: `http://localhost:3000/voice`

```
┌─────────────────────────────────────┐
│  🎙️ AI Detection Voice Assistant   │
├─────────────────────────────────────┤
│  Language: [English ▼]             │
│  Voice:    [Meera ▼]               │
│  [Connect to Voice Agent]          │
│                                     │
│  [🎤] ← Animated mic button        │
│                                     │
│  ┌──────────────────────────────┐ │
│  │ 💬 Chat Messages             │ │
│  │                              │ │
│  │ You: Hello!                  │ │
│  │ AI: I can help...            │ │
│  └──────────────────────────────┘ │
│  [Type message...] [Send]         │
└─────────────────────────────────────┘
```

## 📊 Cost Breakdown

```
Component         Status    Cost
─────────────────────────────────
Gemini API        ✅ FREE   $0.00
Sarvam AI STT     ⚠️ Paid   ~$0.02/min
Sarvam AI TTS     ⚠️ Paid   ~$0.01/min
Google STUN       ✅ FREE   $0.00
Redis             ✅ FREE   $0.00 (in-memory)
Hosting           💻 Local  $0.00
─────────────────────────────────
Test Mode         ✅        $0.00
Gemini Only       ✅        $0.00
Full Voice        ⚠️        ~$0.03/min
```

## 🎓 Learning Resources

```
📖 VOICE_AGENT_SPECIFICATION.md    Full technical spec
📖 backend/voice/README.md          Setup guide
📖 VOICE_AGENT_STATUS.md           Current status
🧪 backend/test_voice.py            Example code
🌐 https://ai.google.dev            Gemini docs
🌐 https://sarvam.ai                Sarvam docs
```

## 🐛 Common Issues

### "Import Error"

```powershell
.\env\Scripts\Activate.ps1
pip install -r backend\voice\requirements.txt
```

### "Connection Refused"

```powershell
# Start server first!
python -m uvicorn voice_test_server:app --port 8001
```

### "CORS Error"

- Check server allows localhost:3000
- Check frontend runs on port 3000
- Clear browser cache

## ✨ You're All Set!

**Phase 1: Foundation** ✅ COMPLETE

**Next Options:**

1. **Test the UI** → Start servers, visit /voice
2. **Get API keys** → Enable full voice features
3. **Integrate detection** → Connect to AI detector (Phase 2)
4. **Add features** → Tutorial, batch analysis (Phase 3-4)

---

**Questions?** Check [VOICE_AGENT_STATUS.md](./VOICE_AGENT_STATUS.md)  
**Technical Details?** Check [VOICE_AGENT_SPECIFICATION.md](./VOICE_AGENT_SPECIFICATION.md)  
**Problems?** Check server logs in terminal

🎉 **Happy Voice Coding!**
