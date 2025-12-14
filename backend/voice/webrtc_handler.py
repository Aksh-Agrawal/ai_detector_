"""
WebRTC Handler for Voice Communication
Manages peer connections and signaling
"""

import logging
import asyncio
import json
from typing import Optional, Dict, Callable
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.media import MediaRelay, MediaPlayer
import uuid

logger = logging.getLogger(__name__)


class WebRTCHandler:
    """Manages WebRTC connections for voice communication"""
    
    def __init__(self):
        """Initialize WebRTC handler"""
        self.peer_connections: Dict[str, RTCPeerConnection] = {}
        self.relay = MediaRelay()
        logger.info("WebRTC handler initialized")
    
    async def create_peer_connection(
        self,
        session_id: str,
        on_track: Optional[Callable] = None
    ) -> RTCPeerConnection:
        """
        Create new WebRTC peer connection
        
        Args:
            session_id: Unique session identifier
            on_track: Callback for incoming audio tracks
            
        Returns:
            RTCPeerConnection instance
        """
        try:
            # Create peer connection with STUN server
            pc = RTCPeerConnection(
                configuration={
                    "iceServers": [
                        {"urls": ["stun:stun.l.google.com:19302"]}  # Free Google STUN
                    ]
                }
            )
            
            # Handle incoming tracks (audio from user)
            @pc.on("track")
            async def on_track_received(track: MediaStreamTrack):
                logger.info(f"Track received: {track.kind}")
                
                if track.kind == "audio":
                    if on_track:
                        await on_track(track, session_id)
                    else:
                        logger.warning("No track handler configured")
            
            # Handle connection state changes
            @pc.on("connectionstatechange")
            async def on_connectionstatechange():
                logger.info(f"Connection state: {pc.connectionState}")
                
                if pc.connectionState == "failed":
                    await self.close_connection(session_id)
            
            # Store connection
            self.peer_connections[session_id] = pc
            
            logger.info(f"Peer connection created for session: {session_id}")
            return pc
            
        except Exception as e:
            logger.error(f"Error creating peer connection: {e}")
            raise
    
    async def handle_offer(
        self,
        session_id: str,
        offer_sdp: Dict,
        on_track: Optional[Callable] = None
    ) -> Dict:
        """
        Handle WebRTC offer from client
        
        Args:
            session_id: Session ID
            offer_sdp: Offer SDP from client
            on_track: Audio track handler
            
        Returns:
            Answer SDP
        """
        try:
            logger.info(f"Handling offer for session: {session_id}")
            
            # Create peer connection
            pc = await self.create_peer_connection(session_id, on_track)
            
            # Set remote description (offer)
            offer = RTCSessionDescription(
                sdp=offer_sdp["sdp"],
                type=offer_sdp["type"]
            )
            await pc.setRemoteDescription(offer)
            
            # Create answer
            answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            
            logger.info(f"Answer created for session: {session_id}")
            
            return {
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type
            }
            
        except Exception as e:
            logger.error(f"Error handling offer: {e}")
            raise
    
    async def handle_ice_candidate(
        self,
        session_id: str,
        candidate: Dict
    ):
        """
        Handle ICE candidate from client
        
        Args:
            session_id: Session ID
            candidate: ICE candidate data
        """
        try:
            pc = self.peer_connections.get(session_id)
            if not pc:
                logger.warning(f"No peer connection for session: {session_id}")
                return
            
            # Add ICE candidate
            await pc.addIceCandidate(candidate)
            logger.debug(f"ICE candidate added for session: {session_id}")
            
        except Exception as e:
            logger.error(f"Error handling ICE candidate: {e}")
    
    async def send_audio(
        self,
        session_id: str,
        audio_data: bytes
    ):
        """
        Send audio to client via WebRTC
        
        Args:
            session_id: Session ID
            audio_data: Audio bytes to send
        """
        try:
            pc = self.peer_connections.get(session_id)
            if not pc:
                logger.warning(f"No peer connection for session: {session_id}")
                return
            
            # Create audio track from data
            # Note: This is simplified - in production, use proper audio track
            logger.info(f"Sending {len(audio_data)} bytes of audio")
            
            # TODO: Implement audio track creation and streaming
            # This requires converting audio_data to proper MediaStreamTrack
            
        except Exception as e:
            logger.error(f"Error sending audio: {e}")
    
    async def close_connection(self, session_id: str):
        """
        Close WebRTC connection
        
        Args:
            session_id: Session ID to close
        """
        try:
            pc = self.peer_connections.get(session_id)
            if pc:
                await pc.close()
                del self.peer_connections[session_id]
                logger.info(f"Connection closed for session: {session_id}")
            
        except Exception as e:
            logger.error(f"Error closing connection: {e}")
    
    async def close_all(self):
        """Close all connections"""
        logger.info("Closing all connections...")
        for session_id in list(self.peer_connections.keys()):
            await self.close_connection(session_id)
    
    def get_active_sessions(self) -> list:
        """Get list of active session IDs"""
        return list(self.peer_connections.keys())


# Audio track handler for processing incoming audio
class AudioTrackHandler:
    """Handles incoming audio tracks and processes them through pipeline"""
    
    def __init__(self, pipeline_callback: Callable):
        """
        Initialize audio track handler
        
        Args:
            pipeline_callback: Async function to process audio through pipeline
        """
        self.pipeline_callback = pipeline_callback
        self.audio_buffer = []
    
    async def handle_track(self, track: MediaStreamTrack, session_id: str):
        """
        Process incoming audio track
        
        Args:
            track: Audio track from client
            session_id: Session ID
        """
        try:
            logger.info(f"Processing audio track for session: {session_id}")
            
            # Collect audio frames
            async for frame in track:
                # Convert frame to bytes
                audio_bytes = frame.to_ndarray().tobytes()
                self.audio_buffer.append(audio_bytes)
                
                # Process when buffer reaches threshold
                if len(self.audio_buffer) >= 10:  # Adjust threshold as needed
                    combined_audio = b''.join(self.audio_buffer)
                    self.audio_buffer = []
                    
                    # Send to pipeline for processing
                    await self.pipeline_callback(combined_audio, session_id)
            
        except Exception as e:
            logger.error(f"Error handling track: {e}")


# Example usage
if __name__ == "__main__":
    async def test_webrtc():
        handler = WebRTCHandler()
        
        # Create test session
        session_id = str(uuid.uuid4())
        
        # Mock offer
        offer = {
            "type": "offer",
            "sdp": "..."  # Real SDP would come from client
        }
        
        # Handle offer
        # answer = await handler.handle_offer(session_id, offer)
        # print(f"Answer: {answer}")
        
        print(f"WebRTC handler initialized with session: {session_id}")
        
        # Close
        await handler.close_all()
    
    asyncio.run(test_webrtc())
