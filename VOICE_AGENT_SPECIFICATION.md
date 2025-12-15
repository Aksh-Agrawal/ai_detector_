# Voice Agent Specification - AI Detector

**Project:** AI Content Detector with Multilingual Voice Assistant  
**Date:** December 14, 2025  
**Version:** 2.0 (Sarvam AI STT/TTS + Gemini LLM)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features Specification](#features-specification)
5. [API Design](#api-design)
6. [Voice Flow Diagrams](#voice-flow-diagrams)
7. [Implementation Phases](#implementation-phases)
8. [File Structure](#file-structure)
9. [Security Considerations](#security-considerations)

---

## 🎯 Overview

### Purpose

Integrate a multilingual voice agent into the AI Detector application to provide interactive, conversational analysis and guidance for users detecting AI-generated content.

### Core Capabilities

- **Interactive Results Explanation:** Natural language explanation of detection results
- **Real-Time Analysis Discussion:** Conversational interface for document comparison
- **Guided Detection Tutorial:** Voice-based onboarding and help system
- **Batch Analysis Assistant:** Voice commands for analyzing multiple documents

### Key Technologies

- **Sarvam AI:** Multilingual STT/TTS (supports 10+ Indian languages + English)
- **Pipecat:** Real-time voice pipeline framework (open source)
- **WebRTC:** Low-latency voice communication (free)
- **Google Gemini 2.0 Flash:** Free reasoning engine (2M tokens/min free tier)
- **Cost:** Sarvam AI pricing + $0 for Gemini (free tier)

---

## 🛠 Technology Stack

### Backend

```
- Python 3.11+
- FastAPI (for voice endpoints)
- Pipecat (voice pipeline orchestration)
- aiortc (WebRTC implementation)
- Sarvam AI SDK (speech services - STT/TTS)
- Google Gemini API (free tier: 2M tokens/min, 1500 RPM)
- Redis (open source - session management)
```

### Frontend

```
- Next.js 14 (existing)
- WebRTC API (browser native)
- Web Audio API (audio processing)
- Socket.io-client (real-time communication)
```

### Infrastructure

```
- STUN servers (Google - free: stun.l.google.com:19302)
- Redis for session storage (open source)
- WebSocket server for signaling
```

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Voice Button│  │ Audio Player │  │ WebRTC Manager   │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │              │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │                 │                    │
          │        WebSocket│                    │WebRTC
          │                 │                    │
┌─────────┼─────────────────┼────────────────────┼─────────────┐
│         │                 │                    │              │
│  ┌──────▼─────┐  ┌────────▼──────┐  ┌─────────▼────────┐   │
│  │ FastAPI    │  │ Socket.io     │  │ WebRTC Server    │   │
│  │ Endpoints  │  │ Server        │  │ (aiortc)         │   │
│  └──────┬─────┘  └────────┬──────┘  └─────────┬────────┘   │
│         │                  │                    │             │
│  ┌──────▼──────────────────▼────────────────────▼────────┐  │
│  │              Pipecat Voice Pipeline                   │  │
│  │  ┌──────┐  ┌──────────┐  ┌──────┐  ┌──────┐  ┌─────┐│  │
│  │  │ STT  │→ │   LLM    │→ │ TTS  │→ │ Mix  │→ │ Out ││  │
│  │  │Sarvam│  │Gemini 2.0│  │Sarvam│  │      │  │     ││  │
│  │  │  AI  │  │  Flash   │  │  AI  │  │      │  │     ││  │
│  │  └──────┘  └──────────┘  └──────┘  └──────┘  └─────┘│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Sarvam AI    │  │ Gemini API  │  │ Detection Models │  │
│  │ (STT/TTS)    │  │ (FREE 2M/m) │  │ (Existing)       │  │
│  │              │  │             │  │                  │  │
│  └──────────────┘  └─────────────┘  └──────────────────┘  │
│                     Backend Services                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User speaks** → Microphone captures audio
2. **WebRTC** → Sends audio stream to backend
3. **Sarvam AI STT** → Converts speech to text (multilingual)
4. **Gemini 2.0 Flash + Context** → Generates reasoning response (FREE - 2M tokens/min)
5. **Sarvam AI TTS** → Converts response to speech (natural Indian voices)
6. **WebRTC** → Streams audio back to user
7. **Frontend** → Plays audio response

---

## 🎨 Features Specification

### Feature 1: Interactive Results Explanation

**Use Case:**
User receives detection results (e.g., 75% AI-generated) and wants to understand why.

**Voice Interactions:**

```
User: "Why was this detected as AI?"
Agent: "Based on the analysis, this text shows several AI patterns. The sentence
        structures are unusually uniform, with 85% of sentences having similar
        length. Additionally, the vocabulary diversity score is 0.62, which is
        typical of GPT-generated content."

User: "What specific parts seem AI-generated?"
Agent: "Let me highlight the key sections. Paragraphs 2 and 4 show the strongest
        AI signatures, particularly the phrases starting with 'Furthermore' and
        'In conclusion', which appear in 78% of AI-generated academic texts."

User: "ये हिंदी में समझाओ" (Explain in Hindi)
Agent: "यह टेक्स्ट 75% AI द्वारा बनाया गया है। इसमें कुछ पैटर्न हैं जो AI की
        पहचान हैं..."
```

**Technical Implementation:**

- Maintain conversation context with detection results
- Parse detection model's feature importance
- Generate human-readable explanations
- Support language switching mid-conversation

**API Endpoint:**

```python
POST /voice/explain-results
{
  "detection_id": "uuid",
  "language": "en" | "hi" | "ta" | "te" | ...,
  "audio_stream": "webrtc_stream"
}
```

---

### Feature 2: Real-Time Analysis Discussion

**Use Case:**
User uploads multiple documents and discusses findings conversationally.

**Voice Interactions:**

```
User: "Compare these two essays for me"
Agent: "I'll analyze both documents. The first essay shows 82% AI probability,
        while the second is only 23%. The main difference is in writing style
        consistency and vocabulary diversity."

User: "Which parts of the first essay are most suspicious?"
Agent: "In the first essay, paragraphs 3 through 5 have the highest AI
        probability at 94%. These sections use repetitive transition words
        and lack the stylistic variations typical of human writing."

User: "Can you read the suspicious part?"
Agent: [Reads highlighted text] "This section begins with 'Moreover, it is
        important to note that...' which is a common AI pattern."
```

**Technical Implementation:**

- Multi-document session management
- Comparative analysis algorithms
- Text-to-speech for reading excerpts
- Session state persistence in Redis

**API Endpoint:**

```python
POST /voice/analyze-discussion
{
  "session_id": "uuid",
  "document_ids": ["doc1", "doc2"],
  "audio_stream": "webrtc_stream"
}
```

---

### Feature 3: Guided Detection Tutorial

**Use Case:**
New users need help understanding the tool.

**Voice Interactions:**

```
User: "How does this work?"
Agent: "Welcome to AI Detector! I'll guide you through the process. You can
        detect AI-generated content in three ways: text, images, or videos.
        Would you like to try text detection first?"

User: "Yes, show me text detection"
Agent: "Great! You can either paste text directly or upload a document. The
        system analyzes patterns like sentence structure, vocabulary, and
        writing style. Try pasting some text now."

User: [Pastes text]
Agent: "Perfect! I've analyzed your text. It shows 15% AI probability, which
        means it's likely human-written. The varied sentence lengths and
        natural flow are good indicators. Want to learn about image detection?"
```

**Technical Implementation:**

- Tutorial state machine
- Step-by-step guidance flow
- Interactive demo mode
- Progress tracking

**API Endpoint:**

```python
POST /voice/tutorial
{
  "tutorial_step": "intro" | "text" | "image" | "video" | "results",
  "audio_stream": "webrtc_stream"
}
```

---

### Feature 4: Batch Analysis Assistant

**Use Case:**
User needs to analyze multiple documents and get a summary.

**Voice Interactions:**

```
User: "Analyze all my documents and summarize results"
Agent: "I'll process all 15 documents. This will take about 2 minutes.
        I'll notify you when complete."

[After processing]
Agent: "Analysis complete! Out of 15 documents:
        - 8 are likely AI-generated (>70% probability)
        - 5 are likely human-written (<30% probability)
        - 2 are mixed content (30-70% probability)

        The highest AI probability is 96% in 'essay_3.txt'. Would you like
        details on any specific document?"

User: "Tell me about essay_3"
Agent: "Essay_3.txt has 96% AI probability. Key indicators include:
        - Extremely uniform sentence length
        - Repetitive paragraph structure
        - Common AI phrases detected in 12 locations
        - Vocabulary diversity score of 0.58"
```

**Technical Implementation:**

- Batch processing queue
- Progress notifications
- Summary generation
- Detailed drill-down capability

**API Endpoint:**

```python
POST /voice/batch-analysis
{
  "document_ids": ["doc1", "doc2", ...],
  "audio_stream": "webrtc_stream"
}
```

---

## 📡 API Design

### Sarvam AI Integration

#### Speech-to-Text (STT)

```python
from sarvam import SarvamClient

client = SarvamClient(api_key="YOUR_API_KEY")

# Real-time streaming STT
async def transcribe_audio(audio_stream, language="hi-IN"):
    response = await client.speech_to_text_stream(
        audio=audio_stream,
        language_code=language,
        model="saaras:v1"  # Sarvam's multilingual model
    )
    return response.text
```

#### Text-to-Speech (TTS)

```python
# Generate speech from text
async def generate_speech(text, language="hi-IN", voice="meera"):
    response = await client.text_to_speech(
        text=text,
        language_code=language,
        speaker=voice,
        model="bulbul:v1"  # Sarvam's TTS model
    )
    return response.audio_content
```

#### Supported Languages

```python
SUPPORTED_LANGUAGES = {
    "hi-IN": "English (India)",
    "hi-IN": "Hindi",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "kn-IN": "Kannada",
    "ml-IN": "Malayalam",
    "mr-IN": "Marathi",
    "gu-IN": "Gujarati",
    "bn-IN": "Bengali",
    "pa-IN": "Punjabi"
}
```

### Pipecat Pipeline Configuration

```python
from pipecat.pipeline import Pipeline
from pipecat.processors.stt import SarvamSTTProcessor
from pipecat.processors.llm import GeminiLLMProcessor
from pipecat.processors.tts import SarvamTTSProcessor
import google.generativeai as genai

# Configure Gemini (FREE - 2M tokens/minute)
genai.configure(api_key=GEMINI_API_KEY)

# Create voice pipeline
pipeline = Pipeline(
    processors=[
        SarvamSTTProcessor(
            api_key=SARVAM_API_KEY,
            language="hi-IN",
            sample_rate=16000
        ),
        GeminiLLMProcessor(
            api_key=GEMINI_API_KEY,
            model="gemini-2.5-flash",  # FREE tier
            system_prompt=SYSTEM_PROMPT
        ),
        SarvamTTSProcessor(
            api_key=SARVAM_API_KEY,
            language="hi-IN",
            voice="meera"
        )
    ]
)

# Process audio stream
async def process_voice(audio_stream, context):
    async for response in pipeline.process_stream(audio_stream, context):
        yield response
```

### WebRTC Signaling Protocol

```javascript
// Frontend WebRTC Setup
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:turn.example.com:3478",
      username: "user",
      credential: "pass",
    },
  ],
});

// Get user audio
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});

// Add to peer connection
stream.getTracks().forEach((track) => {
  peerConnection.addTrack(track, stream);
});

// WebSocket signaling
socket.on("offer", async (offer) => {
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer);
});
```

---

## 🔄 Voice Flow Diagrams

### Flow 1: Interactive Results Explanation

```
┌─────────────┐
│ User clicks │
│ "Ask Voice" │
│   button    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Establish WebRTC│
│   connection    │
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│ User speaks:     │
│ "Why AI detected"│
└──────┬───────────┘
       │
       ▼
┌─────────────────────┐
│ Sarvam STT          │
│ Transcribes to text │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│ Context Enrichment:      │
│ - Load detection results │
│ - Feature importance     │
│ - Text highlights        │
└──────┬───────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Gemini 2.0 Flash:       │
│ - Analyze patterns      │
│ - Generate explanation  │
│ - Human-friendly format │
│ (FREE: 2M tokens/min)   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────┐
│ Sarvam AI TTS       │
│ Convert to speech   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Stream to user via  │
│ WebRTC              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User hears response │
│ Can ask follow-up   │
└─────────────────────┘
```

### Flow 2: Batch Analysis

```
User: "Analyze all documents"
       │
       ▼
┌──────────────────────┐
│ Queue all documents  │
│ for processing       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Process each with    │
│ existing models      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Generate summary     │
│ statistics           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ TTS: Read summary    │
│ aloud                │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Wait for follow-up   │
│ questions            │
└──────────────────────┘
```

---

## 📁 File Structure

```
ai_detector_full/
├── backend/
│   ├── app.py (existing Flask app)
│   ├── requirements.txt
│   ├── voice/
│   │   ├── __init__.py
│   │   ├── voice_server.py          # FastAPI voice endpoints
│   │   ├── webrtc_handler.py        # WebRTC connection manager
│   │   ├── pipecat_pipeline.py      # Pipecat configuration
│   │   ├── sarvam_client.py         # Sarvam AI integration (STT/TTS)
│   │   ├── gemini_client.py         # Gemini API integration (LLM)
│   │   ├── reasoning_engine.py      # Gemini prompts & logic
│   │   ├── session_manager.py       # Redis session storage
│   │   └── utils/
│   │       ├── audio_processor.py   # Audio utilities
│   │       └── language_detector.py # Auto-detect language
│   ├── prompts/
│   │   ├── system_prompts.py        # LLM system prompts
│   │   ├── explanation_prompts.py   # Result explanation templates
│   │   └── tutorial_prompts.py      # Tutorial conversation flow
│   └── models/ (existing detection models)
│
├── frontend-next/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── detector/
│   │   │   └── page.tsx
│   │   └── voice/
│   │       └── page.tsx             # Dedicated voice interface page
│   ├── components/
│   │   ├── VoiceButton.tsx          # Microphone button component
│   │   ├── VoiceChat.tsx            # Chat interface with audio
│   │   ├── AudioVisualizer.tsx      # Waveform visualization
│   │   ├── LanguageSelector.tsx     # Language switch dropdown
│   │   └── VoiceStatus.tsx          # Connection status indicator
│   ├── hooks/
│   │   ├── useWebRTC.ts             # WebRTC connection hook
│   │   ├── useVoiceChat.ts          # Voice chat state management
│   │   └── useAudioRecorder.ts      # Audio recording utilities
│   └── lib/
│       ├── webrtc-client.ts         # WebRTC client setup
│       └── voice-api.ts             # Voice API calls
│
├── redis/
│   └── redis.conf                   # Redis configuration
│
└── docs/
    ├── VOICE_AGENT_SPECIFICATION.md (this file)
    └── API_DOCUMENTATION.md         # API reference
```

---

## 🔐 Security Considerations

### 1. API Key Management

```python
# Use environment variables
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Free from ai.google.dev

# Get free Gemini API key:
# Visit https://ai.google.dev/ and click "Get API key"
# 2M tokens/min free tier

# Never expose in frontend
# All API calls go through backend
```

### 2. WebRTC Security

- Use Google STUN servers (free: stun.l.google.com:19302)
- Implement token-based WebRTC connection
- Rate limiting on signaling endpoints
- Session timeout (10 minutes idle)

### 3. Audio Data Privacy

- No permanent audio storage
- Process in memory only
- Encrypted WebRTC streams (DTLS-SRTP)
- User consent before mic access

### 4. Rate Limiting

```python
# Limit voice requests per user
RATE_LIMITS = {
    "voice_requests_per_hour": 60,
    "concurrent_sessions_per_user": 2,
    "max_audio_duration": 300  # 5 minutes
}
```

---

## 📅 Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up basic voice infrastructure

- [ ] Set up FastAPI voice server
- [ ] Integrate Sarvam AI SDK (STT + TTS)
- [ ] Get free Gemini API key from ai.google.dev
- [ ] Configure Pipecat pipeline with Gemini
- [ ] Implement WebRTC signaling (Google STUN)
- [ ] Create basic frontend voice button
- [ ] Test "echo" - user speaks, bot repeats

**Deliverables:**

- Working WebRTC connection
- Basic STT → TTS pipeline
- Simple voice interaction

---

### Phase 2: Results Explanation (Week 3-4)

**Goal:** Implement interactive results explanation

- [ ] Design Gemini system prompts for explanations
- [ ] Load detection results into context (use Gemini's 2M token context)
- [ ] Parse feature importance from models
- [ ] Implement natural language generation with Gemini
- [ ] Add conversation memory (last 5 exchanges)
- [ ] Create highlight visualization in frontend
- [ ] Test multilingual explanations (10+ Indian languages via Sarvam)

**Deliverables:**

- "Why was this AI?" functionality
- Highlight suspicious text sections
- Support 3+ languages

---

### Phase 3: Analysis Discussion (Week 5-6)

**Goal:** Enable multi-document conversations

- [ ] Implement session state management (Redis)
- [ ] Build comparative analysis engine
- [ ] Add document context switching
- [ ] Implement "read aloud" feature
- [ ] Create conversation history UI
- [ ] Add export conversation transcript

**Deliverables:**

- Multi-document comparison
- Context-aware conversations
- Conversation history

---

### Phase 4: Tutorial & Batch (Week 7-8)

**Goal:** Complete remaining features

- [ ] Design tutorial state machine
- [ ] Implement guided walkthroughs
- [ ] Build batch processing queue
- [ ] Add progress notifications
- [ ] Create summary generation
- [ ] Implement voice commands (e.g., "stop", "repeat")

**Deliverables:**

- Interactive tutorials
- Batch analysis with summaries
- Voice command system

---

### Phase 5: Polish & Testing (Week 9-10)

**Goal:** Production readiness

- [ ] Comprehensive testing (all languages)
- [ ] Performance optimization
- [ ] Error handling & fallbacks
- [ ] Analytics integration
- [ ] Documentation
- [ ] User acceptance testing

**Deliverables:**

- Production-ready voice agent
- Complete documentation
- Test coverage >80%

---

## 🎯 Success Metrics

### Technical Metrics

- **Latency:** <1s from speech to response start
- **Accuracy:** >95% STT accuracy for supported languages
- **Uptime:** 99.5% availability
- **Concurrent Users:** Support 100+ simultaneous voice sessions

### User Experience Metrics

- **Clarity:** TTS naturalness score >4/5
- **Helpfulness:** 80%+ of questions answered satisfactorily
- **Adoption:** 30%+ of users try voice feature
- **Retention:** 50%+ return to use voice again

---

## 🚀 Getting Started (After Implementation)

### Backend Setup

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Set environment variables
export SARVAM_API_KEY="your_sarvam_key"
export GEMINI_API_KEY="your_free_gemini_key"  # Get from ai.google.dev
export REDIS_URL="redis://localhost:6379"

# Start Redis
redis-server

# Start voice server
python -m voice.voice_server
```

python -m voice.voice_server

````

### Frontend Setup
```bash
cd frontend-next
npm install
npm run dev
````

### Test Voice

1. Navigate to http://localhost:3000/detector
2. Click "Ask Voice Assistant" button
3. Allow microphone access
4. Start speaking!

---

## 📚 References

- **Sarvam AI Docs:** https://docs.sarvam.ai/ (STT/TTS)
- **Gemini API (FREE):** https://ai.google.dev/
- **Pipecat:** https://github.com/pipecat-ai/pipecat
- **WebRTC API:** https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Google STUN Servers (FREE):** stun:stun.l.google.com:19302

---

## 🤝 Contributing

This is a living document. Update as implementation progresses.

**Last Updated:** December 14, 2025  
**Version:** 2.0 (Sarvam AI STT/TTS + Gemini LLM)  
**Next Review:** After Phase 1 completion

---

## ❓ Questions & Decisions Needed

1. **Sarvam AI Pricing:** Confirm API costs for STT/TTS expected usage
2. **Gemini Free Tier:** 2M tokens/min is generous - monitor usage
3. **Voice Personas:** Different Sarvam voices (meera, arjun, etc.) for different features?
4. **Analytics:** Which metrics to track for voice interactions?
5. **Fallback:** If Sarvam AI is down, consider Web Speech API as backup for STT/TTS

---

**COST BREAKDOWN:**

- Sarvam AI STT/TTS: Paid (check pricing)
- Gemini API: FREE (2M tokens/min)
- WebRTC/STUN: FREE
- Redis: FREE (open source)
- Pipecat: FREE (open source)

---

**END OF SPECIFICATION**
