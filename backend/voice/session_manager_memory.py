"""
In-Memory Session Manager (for testing without Redis)
Manages voice conversation sessions in memory
"""

import logging
import json
import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages voice conversation sessions in memory (for testing)"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """
        Initialize session manager
        
        Args:
            redis_url: Ignored for in-memory version
        """
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.session_ttl = 600  # 10 minutes
        logger.info(f"In-memory session manager initialized (TTL: {self.session_ttl}s)")
    
    async def connect(self):
        """Connect (no-op for in-memory)"""
        logger.info("Using in-memory session storage (no Redis required)")
    
    async def disconnect(self):
        """Disconnect (no-op for in-memory)"""
        logger.info("In-memory session storage cleared")
        self.sessions.clear()
    
    async def create_session(
        self,
        user_id: Optional[str] = None,
        language: str = "hi-IN",
        voice: str = "meera"
    ) -> Dict[str, Any]:
        """
        Create a new session
        
        Args:
            user_id: Optional user identifier
            language: Language code
            voice: Voice name
            
        Returns:
            Session data
        """
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "language": language,
            "voice": voice,
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
            "conversation_history": [],
            "context": {}
        }
        
        self.sessions[session_id] = session_data
        logger.info(f"Created session {session_id}")
        return session_data
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session data
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data or None if not found
        """
        session = self.sessions.get(session_id)
        if session:
            # Update last activity
            session["last_activity"] = datetime.now().isoformat()
        return session
    
    async def update_session(
        self,
        session_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Update session data
        
        Args:
            session_id: Session identifier
            updates: Fields to update
            
        Returns:
            True if successful
        """
        session = self.sessions.get(session_id)
        if not session:
            return False
        
        session.update(updates)
        session["last_activity"] = datetime.now().isoformat()
        return True
    
    async def delete_session(self, session_id: str) -> bool:
        """
        Delete a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if deleted
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Deleted session {session_id}")
            return True
        return False
    
    async def add_to_history(
        self,
        session_id: str,
        role: str,
        content: str
    ) -> bool:
        """
        Add message to conversation history
        
        Args:
            session_id: Session identifier
            role: Message role (user/assistant)
            content: Message content
            
        Returns:
            True if successful
        """
        session = await self.get_session(session_id)
        if not session:
            return False
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        session["conversation_history"].append(message)
        
        # Keep only last 10 messages
        if len(session["conversation_history"]) > 10:
            session["conversation_history"] = session["conversation_history"][-10:]
        
        return True
    
    async def get_history(
        self,
        session_id: str,
        limit: int = 5
    ) -> list:
        """
        Get conversation history
        
        Args:
            session_id: Session identifier
            limit: Maximum number of messages
            
        Returns:
            List of messages
        """
        session = await self.get_session(session_id)
        if not session:
            return []
        
        history = session.get("conversation_history", [])
        return history[-limit:] if limit else history
    
    async def set_context(
        self,
        session_id: str,
        context_key: str,
        context_value: Any
    ) -> bool:
        """
        Set context data for the session
        
        Args:
            session_id: Session identifier
            context_key: Context key
            context_value: Context value
            
        Returns:
            True if successful
        """
        session = await self.get_session(session_id)
        if not session:
            return False
        
        if "context" not in session:
            session["context"] = {}
        
        session["context"][context_key] = context_value
        logger.info(f"Set context {context_key} for session {session_id}")
        return True
    
    async def get_context(
        self,
        session_id: str,
        context_key: Optional[str] = None
    ) -> Optional[Any]:
        """
        Get context data from the session
        
        Args:
            session_id: Session identifier
            context_key: Optional context key (returns all context if None)
            
        Returns:
            Context value or None
        """
        session = await self.get_session(session_id)
        if not session:
            return None
        
        context = session.get("context", {})
        
        if context_key:
            return context.get(context_key)
        return context
