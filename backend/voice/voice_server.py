"""
FastAPI Voice Server
Main server handling voice requests and WebRTC signaling
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json

from .sarvam_client import SarvamAIClient
from .gemini_client import GeminiClient, SYSTEM_PROMPTS
from .pipecat_pipeline import VoicePipeline, PipelineConfig
from .webrtc_handler import WebRTCHandler
# Use in-memory session manager for testing (no Redis required)
from .session_manager_memory import SessionManager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
session_manager: Optional[SessionManager] = None
webrtc_handler: Optional[WebRTCHandler] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global session_manager, webrtc_handler
    
    # Startup
    logger.info("Starting Voice Server...")
    
    # Initialize session manager
    session_manager = SessionManager(
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379")
    )
    await session_manager.connect()
    
    # Initialize WebRTC handler
    webrtc_handler = WebRTCHandler()
    
    logger.info("Voice Server started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Voice Server...")
    await session_manager.disconnect()
    await webrtc_handler.close_all()
    logger.info("Voice Server stopped")


# Create FastAPI app
app = FastAPI(
    title="AI Detector Voice Agent",
    description="Multilingual voice assistant for AI content detection",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class SessionCreateRequest(BaseModel):
    user_id: Optional[str] = None
    language: str = "hi-IN"
    voice: str = "meera"


class SessionResponse(BaseModel):
    session_id: str
    language: str
    voice: str


class TextInputRequest(BaseModel):
    session_id: str
    text: str
    context: Optional[Dict[str, Any]] = None


class DetectionResultsRequest(BaseModel):
    session_id: str
    detection_id: str
    ai_score: float
    human_score: float
    features: Optional[Dict] = None


class WebRTCOfferRequest(BaseModel):
    session_id: str
    offer: Dict[str, str]


class WebRTCICERequest(BaseModel):
    session_id: str
    candidate: Dict[str, Any]


# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Detector Voice Agent",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "sessions": "/api/voice/session",
            "text_input": "/api/voice/text",
            "webrtc_offer": "/api/voice/webrtc/offer",
            "websocket": "/ws/voice/{session_id}"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "redis": "connected" if session_manager else "disconnected",
        "active_sessions": len(await session_manager.get_active_sessions()) if session_manager else 0
    }


@app.post("/api/voice/session", response_model=SessionResponse)
async def create_session(request: SessionCreateRequest):
    """
    Create new voice session
    
    Returns session ID for subsequent requests
    """
    try:
        session_id = await session_manager.create_session(
            user_id=request.user_id,
            language=request.language,
            voice=request.voice
        )
        
        return SessionResponse(
            session_id=session_id,
            language=request.language,
            voice=request.voice
        )
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/voice/session/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    try:
        session = await session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/voice/session/{session_id}")
async def delete_session(session_id: str):
    """Delete session"""
    try:
        await session_manager.delete_session(session_id)
        return {"message": "Session deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/text")
async def process_text_input(request: TextInputRequest):
    """
    Process text input through voice pipeline
    
    Returns audio response
    """
    try:
        # Get session
        session = await session_manager.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Create pipeline
        config = PipelineConfig(
            sarvam_api_key=os.getenv("SARVAM_API_KEY"),
            gemini_api_key=os.getenv("GEMINI_API_KEY"),
            language=session["language"],
            voice=session["voice"],
            system_prompt=SYSTEM_PROMPTS.get("results_explanation")
        )
        
        pipeline = VoicePipeline(config)
        
        # Process text
        audio_bytes = await pipeline.process_text_input(
            request.text,
            context=request.context
        )
        
        # Update session history
        # (response text would be extracted from pipeline in real implementation)
        await session_manager.add_to_history(
            request.session_id,
            request.text,
            "Audio response generated"
        )
        
        # Return audio as base64
        import base64
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return {
            "session_id": request.session_id,
            "audio": audio_b64,
            "format": "wav"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing text: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/results")
async def set_detection_results(request: DetectionResultsRequest):
    """
    Set detection results as context for voice conversation
    
    User can then ask questions about the results
    """
    try:
        context = {
            "detection_results": {
                "detection_id": request.detection_id,
                "ai_score": request.ai_score,
                "human_score": request.human_score,
                "features": request.features or {}
            }
        }
        
        await session_manager.set_context(request.session_id, context)
        
        return {"message": "Detection results set successfully"}
        
    except Exception as e:
        logger.error(f"Error setting results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/webrtc/offer")
async def handle_webrtc_offer(request: WebRTCOfferRequest):
    """
    Handle WebRTC offer from client
    
    Returns SDP answer for peer connection
    """
    try:
        # Verify session exists
        session = await session_manager.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Handle offer and create answer
        answer = await webrtc_handler.handle_offer(
            request.session_id,
            request.offer
        )
        
        return {"answer": answer}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling WebRTC offer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/webrtc/ice")
async def handle_ice_candidate(request: WebRTCICERequest):
    """Handle ICE candidate from client"""
    try:
        await webrtc_handler.handle_ice_candidate(
            request.session_id,
            request.candidate
        )
        
        return {"message": "ICE candidate added"}
        
    except Exception as e:
        logger.error(f"Error handling ICE candidate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/voice/{session_id}")
async def voice_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time voice communication
    
    Handles bidirectional audio streaming
    """
    await websocket.accept()
    logger.info(f"WebSocket connected: {session_id}")
    
    try:
        # Verify session
        session = await session_manager.get_session(session_id)
        if not session:
            await websocket.close(code=4004, reason="Session not found")
            return
        
        # Handle messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type")
            
            if msg_type == "audio":
                # Handle incoming audio chunk
                logger.debug("Received audio chunk")
                # Process through pipeline
                # Send response back
                await websocket.send_json({
                    "type": "audio_response",
                    "data": "..."  # Audio response
                })
                
            elif msg_type == "text":
                # Handle text message
                text = message.get("text")
                logger.info(f"Received text: {text}")
                
                # Process and respond
                await websocket.send_json({
                    "type": "text_response",
                    "text": "Response to: " + text
                })
                
            elif msg_type == "ping":
                # Keep-alive ping
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))


# Run server
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "voice_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
