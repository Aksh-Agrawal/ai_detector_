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

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
session_manager: Optional[SessionManager] = None
gemini_client: Optional[Any] = None


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
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class CreateSessionRequest(BaseModel):
    user_id: Optional[str] = None
    language: str = "en-IN"
    voice: str = "meera"


class TextInputRequest(BaseModel):
    session_id: str
    text: str


class SetResultsRequest(BaseModel):
    session_id: str
    results: Dict[str, Any]


# Endpoints
@app.get("/")
async def root():
    """Service information"""
    return {
        "service": "Voice Agent Test Server",
        "version": "1.0.0",
        "status": "online",
        "mode": "test",
        "note": "No API keys required for testing"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "session_manager": "connected" if session_manager else "disconnected"
    }


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
        "language": session.get("language", "en-IN"),
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


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting test server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
