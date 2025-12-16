# Voice Agent - Getting Started Guide

## 🎯 Overview

The voice agent is now implemented with:

- ✅ Sarvam AI for STT/TTS (multilingual support)
- ✅ Google Gemini for LLM reasoning (FREE tier)
- ✅ WebRTC for real-time voice communication
- ✅ FastAPI backend server
- ✅ Next.js frontend interface

---

## 📋 Prerequisites

1. **Python 3.11+**
2. **Node.js 18+**
3. **Redis** (for session management)
4. **API Keys:**
   - Sarvam AI API key (get from https://www.sarvam.ai/)
   - Google Gemini API key (FREE from https://ai.google.dev/)

---

## 🚀 Setup Instructions

### Step 1: Get API Keys

#### Gemini API (FREE)

1. Visit https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with Google account
4. Click "Create API key"
5. Copy the key

#### Sarvam AI

1. Visit https://www.sarvam.ai/
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key

### Step 2: Install Redis

#### Windows:

```powershell
# Download from GitHub releases
https://github.com/Aksh-Agrawal/ai_detector_/microsoftarchive/redis/releases

# Or use Chocolatey
choco install redis-64

# Start Redis
redis-server
```

#### Linux/Mac:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo service redis-server start

# Mac
brew install redis
brew services start redis
```

### Step 3: Backend Setup

```powershell
# Navigate to voice directory
cd backend\voice

# Copy environment template
copy .env.example .env

# Edit .env and add your API keys:
# SARVAM_API_KEY=your_actual_key_here
# GEMINI_API_KEY=your_actual_key_here

# Activate virtual environment
..\..\env\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the voice server
python -m voice.voice_server
```

The server will start on **http://localhost:8001**

### Step 4: Frontend Setup

```powershell
# Navigate to frontend
cd frontend-next

# Install dependencies (if not already done)
npm install

# Run dev server
npm run dev
```

The frontend will be on **http://localhost:3000**

---

## 🎙️ Using the Voice Assistant

### Option 1: Dedicated Voice Page

1. Navigate to **http://localhost:3000/voice**
2. Select language and voice
3. Click **"Connect"**
4. Use the microphone button to speak or type messages

### Option 2: Integrate with Detector Page

Add voice button to [detector/page.tsx](detector/page.tsx):

```tsx
import Link from "next/link";
import { Mic } from "lucide-react";

// Add this button to your detector page
<Link href="/voice">
  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
    <Mic className="w-5 h-5" />
    Ask Voice Assistant
  </button>
</Link>;
```

---

## 🧪 Testing

### Test 1: Basic Echo

1. Start voice server: `python -m voice.voice_server`
2. Test health endpoint:

   ```powershell
   Invoke-RestMethod http://localhost:8001/health
   ```

3. Create a session:

   ```powershell
   Invoke-RestMethod -Method POST `
     -Uri http://localhost:8001/api/voice/session `
     -ContentType "application/json" `
     -Body '{"language":"hi-IN","voice":"meera"}'
   ```

4. Send a text message:
   ```powershell
   Invoke-RestMethod -Method POST `
     -Uri http://localhost:8001/api/voice/text `
     -ContentType "application/json" `
     -Body '{"session_id":"SESSION_ID_HERE","text":"Hello!"}'
   ```

### Test 2: Frontend Integration

1. Open http://localhost:3000/voice
2. Click "Connect"
3. Type "Hello!" in the chat
4. You should receive an audio response

---

## 📁 Project Structure

```
backend/voice/
├── __init__.py
├── voice_server.py          # FastAPI server
├── sarvam_client.py         # Sarvam AI integration
├── gemini_client.py         # Gemini LLM
├── pipecat_pipeline.py      # Voice pipeline
├── webrtc_handler.py        # WebRTC management
├── session_manager.py       # Redis sessions
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
├── run.ps1                 # Windows run script
└── run.sh                  # Linux/Mac run script

frontend-next/
├── app/voice/page.tsx      # Voice assistant page
├── components/
│   ├── VoiceButton.tsx     # Mic button component
│   └── VoiceChat.tsx       # Chat interface
└── hooks/
    ├── useWebRTC.ts        # WebRTC hook
    └── useVoiceChat.ts     # Voice chat logic
```

---

## 🎨 Features Implemented

### Phase 1 (Complete):

- ✅ FastAPI voice server
- ✅ Sarvam AI STT/TTS integration
- ✅ Gemini LLM integration
- ✅ Pipecat pipeline configuration
- ✅ WebRTC signaling
- ✅ Redis session management
- ✅ Frontend voice components

### Next Steps (Phase 2):

- [ ] Interactive results explanation
- [ ] Context-aware conversations
- [ ] Multilingual support testing
- [ ] Voice command recognition
- [ ] Audio visualization

---

## 🔧 Troubleshooting

### Issue: Redis not connecting

**Solution:** Make sure Redis is running:

```powershell
redis-cli ping
# Should return: PONG
```

### Issue: API key errors

**Solution:** Check your .env file has actual keys, not placeholders:

```
SARVAM_API_KEY=sk-... (actual key)
GEMINI_API_KEY=AI... (actual key)
```

### Issue: WebRTC connection fails

**Solution:** Check browser console for errors. WebRTC requires HTTPS in production.

### Issue: No audio response

**Solution:** Check:

1. Sarvam AI API key is valid
2. Server logs for TTS errors
3. Browser audio permissions

---

## 📊 API Endpoints

### Sessions

- `POST /api/voice/session` - Create session
- `GET /api/voice/session/{id}` - Get session
- `DELETE /api/voice/session/{id}` - Delete session

### Voice Processing

- `POST /api/voice/text` - Process text input
- `POST /api/voice/results` - Set detection results context

### WebRTC

- `POST /api/voice/webrtc/offer` - Handle SDP offer
- `POST /api/voice/webrtc/ice` - Handle ICE candidate
- `WS /ws/voice/{session_id}` - WebSocket connection

### Health

- `GET /` - Service info
- `GET /health` - Health check

---

## 💡 Usage Examples

### Example 1: Explain Detection Results

```typescript
// After detection
await voiceChat.setDetectionResults({
  ai_score: 75,
  human_score: 25,
  features: {
    uniformity: 0.85,
    vocabulary_diversity: 0.62,
  },
});

// Ask question
await voiceChat.sendTextMessage("Why was this detected as AI?");
```

### Example 2: Multi-turn Conversation

```typescript
await voiceChat.sendTextMessage("Analyze this text");
// Response: "The text shows 82% AI probability..."

await voiceChat.sendTextMessage("Which parts are most suspicious?");
// Response: "Paragraphs 2 and 4 have the strongest AI signatures..."
```

---

## 🌍 Supported Languages

- English (India) - `en-IN`
- Hindi - `hi-IN`
- Tamil - `ta-IN`
- Telugu - `te-IN`
- Kannada - `kn-IN`
- Malayalam - `ml-IN`
- Marathi - `mr-IN`
- Gujarati - `gu-IN`
- Bengali - `bn-IN`
- Punjabi - `pa-IN`

---

## 📝 Notes

- Gemini API is **completely FREE** (2M tokens/min)
- Sarvam AI pricing: Check https://www.sarvam.ai/pricing
- WebRTC uses free Google STUN servers
- Redis is open source and free
- Session timeout: 10 minutes of inactivity

---

## 🎯 Next: Integration with Detection Results

To fully integrate voice with your detector:

1. Update [detector/page.tsx](detector/page.tsx) to call voice API
2. Pass detection results to voice context
3. Add "Ask AI" button next to results
4. Enable voice tutorial for new users

See [VOICE_AGENT_SPECIFICATION.md](VOICE_AGENT_SPECIFICATION.md) for full feature roadmap.

---

**Happy voice chatting! 🎙️**
