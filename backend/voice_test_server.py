"""
Minimal Voice Server for Testing
Works without Sarvam AI or Gemini API keys
"""

import os
import logging
import base64
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / "voice" / ".env"
load_dotenv(env_path)

from voice.session_manager_memory import SessionManager

# Try to import Gemini client
try:
    from voice.gemini_client import GeminiClient
    GEMINI_AVAILABLE = bool(os.getenv("GEMINI_API_KEY"))
except ImportError:
    GEMINI_AVAILABLE = False

# Try to import Sarvam AI client
try:
    import aiohttp
    SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
    SARVAM_AVAILABLE = bool(SARVAM_API_KEY)
except ImportError:
    SARVAM_AVAILABLE = False
    SARVAM_API_KEY = None

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
session_manager: Optional[SessionManager] = None
gemini_client: Optional[Any] = None
sarvam_base_url = "https://api.sarvam.ai"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global session_manager, gemini_client
    
    # Startup
    logger.info("Starting Minimal Voice Server (Test Mode)...")
    
    # Initialize session manager
    session_manager = SessionManager()
    await session_manager.connect()
    
    # Initialize Gemini if available
    if GEMINI_AVAILABLE:
        try:
            gemini_client = GeminiClient()
            logger.info("Gemini AI enabled - you'll get smart responses!")
        except Exception as e:
            logger.warning(f"Gemini not available: {e}")
            gemini_client = None
    else:
        logger.info("Gemini API key not found - using mock responses")
    
    # Log Sarvam AI status
    if SARVAM_AVAILABLE:
        logger.info("Sarvam AI enabled - multilingual voice support active!")
    else:
        logger.info("Sarvam AI not configured - using browser speech synthesis")
    
    logger.info("Test server started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down test server...")
    if session_manager:
        await session_manager.disconnect()


# Create FastAPI app
app = FastAPI(
    title="Voice Agent Test Server",
    description="Minimal voice server for testing without API keys",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class CreateSessionRequest(BaseModel):
    user_id: Optional[str] = None
    language: str = "hi-IN"
    voice: str = "anushka"  # Sarvam AI female voice


class TextInputRequest(BaseModel):
    session_id: str
    text: str


class SetResultsRequest(BaseModel):
    session_id: str
    results: Dict[str, Any]


class AudioInputRequest(BaseModel):
    session_id: str
    audio: str  # Base64 encoded audio
    language: str = "hi-IN"


class TTSRequest(BaseModel):
    text: str
    language: str = "hi-IN"
    voice: str = "anushka"  # Sarvam AI female voice


# Endpoints
@app.get("/")
async def root():
    """Service information"""
    return {
        "service": "Voice Agent Test Server",
        "version": "2.0.0",
        "status": "online",
        "gemini": GEMINI_AVAILABLE,
        "sarvam": SARVAM_AVAILABLE,
        "features": {
            "text_chat": True,
            "voice_input": SARVAM_AVAILABLE,
            "voice_output": SARVAM_AVAILABLE,
            "multilingual": SARVAM_AVAILABLE,
            "ai_reasoning": GEMINI_AVAILABLE
        }
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "session_manager": "connected" if session_manager else "disconnected",
        "gemini": GEMINI_AVAILABLE,
        "sarvam": SARVAM_AVAILABLE
    }


@app.get("/api/voice/api-keys/status")
async def api_keys_status():
    """Check which API keys are configured"""
    return {
        "gemini": {
            "configured": GEMINI_AVAILABLE,
            "required_for": "AI-powered responses and conversation",
            "get_key_url": "https://ai.google.dev/",
            "instructions": "1. Visit https://ai.google.dev/\n2. Click 'Get API Key in Google AI Studio'\n3. Create a new API key\n4. Copy and paste below (FREE tier: 2M tokens/min)"
        },
        "sarvam": {
            "configured": SARVAM_AVAILABLE,
            "required_for": "Indian language voice support (Hindi, Tamil, etc.)",
            "get_key_url": "https://www.sarvam.ai/",
            "instructions": "1. Visit https://www.sarvam.ai/\n2. Sign up for an account\n3. Navigate to API section\n4. Generate API key\n5. Copy and paste below"
        },
        "fallback_mode": {
            "gemini": "Mock responses" if not GEMINI_AVAILABLE else None,
            "sarvam": "Browser speech synthesis" if not SARVAM_AVAILABLE else None
        }
    }


class SetAPIKeysRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    sarvam_api_key: Optional[str] = None


@app.post("/api/voice/api-keys/configure")
async def configure_api_keys(request: SetAPIKeysRequest):
    """Configure API keys dynamically"""
    global gemini_client, GEMINI_AVAILABLE, SARVAM_AVAILABLE, SARVAM_API_KEY
    
    results = {"success": False, "updated": [], "errors": []}
    
    # Configure Gemini
    if request.gemini_api_key:
        try:
            from voice.gemini_client import GeminiClient
            test_client = GeminiClient(api_key=request.gemini_api_key)
            gemini_client = test_client
            GEMINI_AVAILABLE = True
            os.environ["GEMINI_API_KEY"] = request.gemini_api_key
            results["updated"].append("gemini")
            logger.info("Gemini API key configured successfully")
        except Exception as e:
            results["errors"].append({"service": "gemini", "error": str(e)})
            logger.error(f"Failed to configure Gemini: {e}")
    
    # Configure Sarvam
    if request.sarvam_api_key:
        try:
            # Validate by checking if key format is correct
            if len(request.sarvam_api_key) > 10:
                SARVAM_API_KEY = request.sarvam_api_key
                SARVAM_AVAILABLE = True
                os.environ["SARVAM_API_KEY"] = request.sarvam_api_key
                results["updated"].append("sarvam")
                logger.info("Sarvam API key configured successfully")
            else:
                results["errors"].append({"service": "sarvam", "error": "Invalid key format"})
        except Exception as e:
            results["errors"].append({"service": "sarvam", "error": str(e)})
            logger.error(f"Failed to configure Sarvam: {e}")
    
    results["success"] = len(results["updated"]) > 0
    results["current_status"] = {
        "gemini": GEMINI_AVAILABLE,
        "sarvam": SARVAM_AVAILABLE
    }
    
    return results


@app.post("/api/voice/session")
async def create_session(request: CreateSessionRequest):
    """Create a new voice session"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    try:
        session = await session_manager.create_session(
            user_id=request.user_id,
            language=request.language,
            voice=request.voice
        )
        logger.info(f"Created session: {session['session_id']}")
        return session
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/voice/session/{session_id}")
async def get_session(session_id: str):
    """Get session information"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    session = await session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session


@app.delete("/api/voice/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    success = await session_manager.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted", "session_id": session_id}


@app.post("/api/voice/text")
async def process_text(request: TextInputRequest):
    """Process text input with Gemini AI if available, otherwise mock response"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    session = await session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Add user message to history
    await session_manager.add_to_history(
        request.session_id,
        "user",
        request.text
    )
    
    # Generate response using Gemini if available
    if gemini_client:
        try:
            # Get context (detection results if any)
            context = await session_manager.get_context(request.session_id)
            detection_results = context.get("detection_results")
            
            # Get conversation history and convert to Gemini format
            history = await session_manager.get_history(request.session_id, limit=5)
            gemini_context = []
            for msg in history:
                role = "model" if msg["role"] == "assistant" else "user"
                gemini_context.append({
                    "role": role,
                    "parts": [msg["content"]]
                })
            
            # Use Gemini to generate response
            if detection_results:
                # Format detection results for explanation
                formatted_results = {
                    "ai_score": detection_results.get("ai", 0) * 100,
                    "human_score": detection_results.get("human", 0) * 100,
                    "type": detection_results.get("type", "text"),
                    "content": detection_results.get("content", "")
                }
                response_text = gemini_client.explain_detection_results(
                    detection_results=formatted_results,
                    user_question=request.text
                )
            else:
                # General conversation
                response_text = await gemini_client.generate_response(
                    prompt=request.text,
                    context=gemini_context,
                    system_prompt="""You are a friendly AI assistant in a chat conversation about AI content detection.

CRITICAL FORMATTING RULES:
- Write in natural paragraphs, NOT bullet points or markdown
- Use line breaks (\\n\\n) to separate different ideas
- NO asterisks (*), NO markdown formatting, NO special characters
- Write conversationally, as if speaking to the user
- Keep responses brief and friendly (2-3 short paragraphs)
- Be helpful, warm, and educational"""
                )
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            response_text = f"I understand your question: '{request.text}'. However, I encountered an error processing it. Error: {str(e)}"
    else:
        # Mock response when Gemini not available
        response_text = f"I received your message: '{request.text}'. This is a test response. To enable AI-powered responses, add your GEMINI_API_KEY to the .env file."
    
    # Add assistant response to history
    await session_manager.add_to_history(
        request.session_id,
        "assistant",
        response_text
    )
    
    # Return response (no audio in test mode)
    return {
        "text": response_text,
        "audio": "",  # Empty for testing (TTS requires Sarvam AI)
        "language": session.get("language", "hi-IN"),
        "voice": session.get("voice", "meera")
    }


@app.post("/api/voice/results")
async def set_detection_results(request: SetResultsRequest):
    """Set detection results context for a session"""
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    success = await session_manager.set_context(
        request.session_id,
        "detection_results",
        request.results
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Detection results set", "session_id": request.session_id}


@app.post("/api/voice/stt")
async def speech_to_text(request: AudioInputRequest):
    """Convert speech to text using Sarvam AI STT"""
    if not SARVAM_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Sarvam AI not configured. Add SARVAM_API_KEY to use multilingual speech-to-text."
        )
    
    if not session_manager:
        raise HTTPException(status_code=503, detail="Session manager not available")
    
    session = await session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # Call Sarvam AI STT API
        async with aiohttp.ClientSession() as http_session:
            headers = {
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json"
            }
            
            payload = {
                "language_code": request.language,
                "model": "saarika:v2"
            }
            
            # For STT, we need to send audio as file, not JSON
            # Convert base64 to bytes
            import base64
            audio_bytes = base64.b64decode(request.audio)
            
            # Create multipart form data
            data = aiohttp.FormData()
            data.add_field('file', audio_bytes, filename='audio.wav', content_type='audio/wav')
            data.add_field('language_code', request.language)
            data.add_field('model', 'saarika:v2')
            
            async with http_session.post(
                f"{sarvam_base_url}/speech-to-text",
                data=data,
                headers={"api-subscription-key": SARVAM_API_KEY}
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Sarvam STT error: {error_text}")
                    raise HTTPException(status_code=response.status, detail=error_text)
                
                data = await response.json()
                transcribed_text = data.get("transcript", "")
                
                logger.info(f"STT ({request.language}): {transcribed_text}")
                
                return {
                    "text": transcribed_text,
                    "language": request.language
                }
    
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using Sarvam AI TTS"""
    if not SARVAM_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Sarvam AI not configured. Add SARVAM_API_KEY to use multilingual text-to-speech."
        )
    
    try:
        # Truncate text to 500 chars max (Sarvam limit)
        truncated_text = request.text[:500] if len(request.text) > 500 else request.text
        
        # Map voice to valid Sarvam speakers
        speaker_map = {
            "meera": "anushka",  # Female voice
            "arvind": "rahul",   # Male voice
        }
        speaker = speaker_map.get(request.voice, "anushka")  # Default to anushka
        
        logger.info(f"TTS request: text='{truncated_text[:50]}...', lang={request.language}, speaker={speaker}")
        
        # Call Sarvam AI TTS API
        async with aiohttp.ClientSession() as http_session:
            headers = {
                "API-Subscription-Key": SARVAM_API_KEY
            }
            
            payload = {
                "inputs": [truncated_text],
                "target_language_code": request.language,
                "speaker": speaker,
                "pitch": 0,
                "pace": 1.0,
                "loudness": 1.5,
                "speech_sample_rate": 8000,
                "enable_preprocessing": True,
                "model": "bulbul:v2"
            }
            
            logger.info(f"Calling Sarvam TTS: {sarvam_base_url}/text-to-speech")
            
            async with http_session.post(
                f"{sarvam_base_url}/text-to-speech",
                json=payload,
                headers=headers
            ) as response:
                response_text = await response.text()
                logger.info(f"Sarvam TTS response status: {response.status}")
                logger.info(f"Sarvam TTS response: {response_text[:200]}")
                
                if response.status != 200:
                    logger.error(f"Sarvam TTS error: {response_text}")
                    raise HTTPException(status_code=response.status, detail=response_text)
                
                data = await response.json() if response_text else {}
                # Sarvam returns array of audio responses
                audio_base64 = data.get("audios", [""])[0] if "audios" in data else ""
                
                logger.info(f"TTS success ({request.language}, {request.voice}): audio_length={len(audio_base64)}")
                
                return {
                    "audio": audio_base64,
                    "language": request.language,
                    "voice": request.voice
                }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting test server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
