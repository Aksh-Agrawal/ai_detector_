"""
Session Manager using Redis
Manages voice conversation sessions and state
"""

import logging
import json
import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages voice conversation sessions with Redis"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """
        Initialize session manager
        
        Args:
            redis_url: Redis connection URL
        """
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None
        self.session_ttl = 600  # 10 minutes
        logger.info(f"Session manager initialized (TTL: {self.session_ttl}s)")
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis = await aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")
    
    async def create_session(
        self,
        user_id: Optional[str] = None,
        language: str = "en-IN",
        voice: str = "meera"
    ) -> str:
        """
        Create new voice session
        
        Args:
            user_id: Optional user identifier
            language: Session language
            voice: TTS voice
            
        Returns:
            Session ID
        """
        try:
            session_id = str(uuid.uuid4())
            
            session_data = {
                "session_id": session_id,
                "user_id": user_id or "anonymous",
                "language": language,
                "voice": voice,
                "created_at": datetime.utcnow().isoformat(),
                "last_activity": datetime.utcnow().isoformat(),
                "conversation_history": [],
                "context": {}
            }
            
            # Store in Redis
            await self.redis.setex(
                f"session:{session_id}",
                self.session_ttl,
                json.dumps(session_data)
            )
            
            logger.info(f"Session created: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """
        Get session data
        
        Args:
            session_id: Session ID
            
        Returns:
            Session data dict or None
        """
        try:
            data = await self.redis.get(f"session:{session_id}")
            if data:
                # Refresh TTL on access
                await self.redis.expire(f"session:{session_id}", self.session_ttl)
                return json.loads(data)
            return None
            
        except Exception as e:
            logger.error(f"Error getting session: {e}")
            return None
    
    async def update_session(
        self,
        session_id: str,
        updates: Dict[str, Any]
    ):
        """
        Update session data
        
        Args:
            session_id: Session ID
            updates: Dict of fields to update
        """
        try:
            session = await self.get_session(session_id)
            if not session:
                logger.warning(f"Session not found: {session_id}")
                return
            
            # Update fields
            session.update(updates)
            session["last_activity"] = datetime.utcnow().isoformat()
            
            # Save back to Redis
            await self.redis.setex(
                f"session:{session_id}",
                self.session_ttl,
                json.dumps(session)
            )
            
            logger.debug(f"Session updated: {session_id}")
            
        except Exception as e:
            logger.error(f"Error updating session: {e}")
    
    async def add_to_history(
        self,
        session_id: str,
        user_message: str,
        assistant_response: str
    ):
        """
        Add exchange to conversation history
        
        Args:
            session_id: Session ID
            user_message: User's message
            assistant_response: Assistant's response
        """
        try:
            session = await self.get_session(session_id)
            if not session:
                return
            
            # Add to history
            session["conversation_history"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "user": user_message,
                "assistant": assistant_response
            })
            
            # Keep only last 20 exchanges
            if len(session["conversation_history"]) > 20:
                session["conversation_history"] = session["conversation_history"][-20:]
            
            await self.update_session(session_id, {
                "conversation_history": session["conversation_history"]
            })
            
        except Exception as e:
            logger.error(f"Error adding to history: {e}")
    
    async def set_context(
        self,
        session_id: str,
        context: Dict[str, Any]
    ):
        """
        Set session context (detection results, documents, etc.)
        
        Args:
            session_id: Session ID
            context: Context data
        """
        try:
            await self.update_session(session_id, {"context": context})
            logger.debug(f"Context set for session: {session_id}")
            
        except Exception as e:
            logger.error(f"Error setting context: {e}")
    
    async def get_context(self, session_id: str) -> Optional[Dict]:
        """Get session context"""
        session = await self.get_session(session_id)
        return session.get("context") if session else None
    
    async def delete_session(self, session_id: str):
        """
        Delete session
        
        Args:
            session_id: Session ID to delete
        """
        try:
            await self.redis.delete(f"session:{session_id}")
            logger.info(f"Session deleted: {session_id}")
            
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
    
    async def get_active_sessions(self) -> list:
        """Get list of active session IDs"""
        try:
            keys = await self.redis.keys("session:*")
            return [key.replace("session:", "") for key in keys]
            
        except Exception as e:
            logger.error(f"Error getting active sessions: {e}")
            return []
    
    async def cleanup_expired(self):
        """Clean up expired sessions (Redis TTL handles this automatically)"""
        logger.info("Redis TTL auto-cleanup - no manual cleanup needed")


# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def test_session_manager():
        manager = SessionManager()
        await manager.connect()
        
        # Create session
        session_id = await manager.create_session(
            user_id="test_user",
            language="en-IN"
        )
        print(f"Created session: {session_id}")
        
        # Get session
        session = await manager.get_session(session_id)
        print(f"Session data: {session}")
        
        # Add conversation
        await manager.add_to_history(
            session_id,
            "Hello!",
            "Hi! How can I help you?"
        )
        
        # Set context
        await manager.set_context(session_id, {
            "detection_results": {
                "ai_score": 75,
                "human_score": 25
            }
        })
        
        # Get updated session
        session = await manager.get_session(session_id)
        print(f"Updated session: {json.dumps(session, indent=2)}")
        
        # Cleanup
        await manager.delete_session(session_id)
        await manager.disconnect()
    
    asyncio.run(test_session_manager())
