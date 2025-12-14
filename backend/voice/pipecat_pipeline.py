"""
Pipecat Pipeline Configuration
Orchestrates: Sarvam STT → Gemini LLM → Sarvam TTS
"""

import logging
from typing import Optional, Dict, AsyncIterator
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class PipelineConfig:
    """Configuration for voice pipeline"""
    sarvam_api_key: str
    gemini_api_key: str
    language: str = "en-IN"
    voice: str = "meera"
    sample_rate: int = 16000
    system_prompt: Optional[str] = None


class VoicePipeline:
    """
    Voice processing pipeline combining STT, LLM, and TTS
    
    Flow: Audio Input → Sarvam STT → Gemini LLM → Sarvam TTS → Audio Output
    """
    
    def __init__(self, config: PipelineConfig):
        """
        Initialize voice pipeline
        
        Args:
            config: Pipeline configuration
        """
        self.config = config
        
        # Import clients
        from .sarvam_client import SarvamAIClient
        from .gemini_client import GeminiClient
        
        # Initialize components
        self.sarvam = SarvamAIClient(api_key=config.sarvam_api_key)
        self.gemini = GeminiClient(api_key=config.gemini_api_key)
        
        # Conversation state
        self.conversation_history = []
        self.max_history = 5  # Keep last 5 exchanges
        
        logger.info(f"Voice pipeline initialized (language: {config.language})")
    
    async def process_audio_stream(
        self,
        audio_stream: AsyncIterator[bytes],
        context: Optional[Dict] = None
    ) -> AsyncIterator[bytes]:
        """
        Process audio stream through full pipeline
        
        Args:
            audio_stream: Incoming audio chunks
            context: Additional context (detection results, documents, etc.)
            
        Yields:
            Synthesized speech audio chunks
        """
        try:
            # Step 1: Speech-to-Text
            logger.info("Step 1: Transcribing audio...")
            transcribed_text = ""
            
            async for text_chunk in self.sarvam.transcribe_stream(
                audio_stream,
                language=self.config.language
            ):
                transcribed_text += text_chunk
            
            logger.info(f"Transcription complete: {transcribed_text}")
            
            if not transcribed_text.strip():
                logger.warning("No transcription received")
                return
            
            # Step 2: LLM Reasoning (Gemini)
            logger.info("Step 2: Generating response with Gemini...")
            
            # Build context-enriched prompt
            enriched_prompt = self._build_prompt(transcribed_text, context)
            
            # Generate response
            response_text = await self.gemini.generate_response(
                enriched_prompt,
                context=self.conversation_history,
                system_prompt=self.config.system_prompt
            )
            
            logger.info(f"Response generated: {response_text[:100]}...")
            
            # Update conversation history
            self._update_history(transcribed_text, response_text)
            
            # Step 3: Text-to-Speech
            logger.info("Step 3: Synthesizing speech...")
            audio_output = await self.sarvam.synthesize_speech(
                response_text,
                language=self.config.language,
                voice=self.config.voice
            )
            
            logger.info(f"Speech synthesis complete: {len(audio_output)} bytes")
            
            # Yield audio in chunks for streaming
            chunk_size = 4096
            for i in range(0, len(audio_output), chunk_size):
                yield audio_output[i:i + chunk_size]
                
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            # Generate error message audio
            error_message = "I'm sorry, I encountered an error processing your request."
            error_audio = await self.sarvam.synthesize_speech(
                error_message,
                language=self.config.language,
                voice=self.config.voice
            )
            yield error_audio
    
    async def process_text_input(
        self,
        text: str,
        context: Optional[Dict] = None
    ) -> bytes:
        """
        Process text input (skip STT, go directly to LLM → TTS)
        
        Args:
            text: User's text input
            context: Additional context
            
        Returns:
            Synthesized speech audio
        """
        try:
            logger.info(f"Processing text input: {text}")
            
            # Build prompt with context
            enriched_prompt = self._build_prompt(text, context)
            
            # Generate response with Gemini
            response_text = await self.gemini.generate_response(
                enriched_prompt,
                context=self.conversation_history,
                system_prompt=self.config.system_prompt
            )
            
            logger.info(f"Response: {response_text}")
            
            # Update history
            self._update_history(text, response_text)
            
            # Synthesize speech
            audio_output = await self.sarvam.synthesize_speech(
                response_text,
                language=self.config.language,
                voice=self.config.voice
            )
            
            return audio_output
            
        except Exception as e:
            logger.error(f"Text processing error: {e}")
            raise
    
    def _build_prompt(self, user_input: str, context: Optional[Dict] = None) -> str:
        """Build context-enriched prompt"""
        if not context:
            return user_input
        
        # Add detection results context
        if "detection_results" in context:
            results = context["detection_results"]
            prompt = f"""
Based on the AI detection analysis:
- AI Probability: {results.get('ai_score', 0)}%
- Human Probability: {results.get('human_score', 0)}%
- Key Features: {results.get('features', {})}

User Question: {user_input}

Provide a clear, helpful explanation.
"""
            return prompt
        
        # Add document context
        if "documents" in context:
            docs_info = "\n".join([
                f"- Document {i+1}: {doc.get('name', 'Unknown')}"
                for i, doc in enumerate(context["documents"])
            ])
            prompt = f"""
Documents being discussed:
{docs_info}

User Question: {user_input}
"""
            return prompt
        
        return user_input
    
    def _update_history(self, user_message: str, assistant_response: str):
        """Update conversation history"""
        self.conversation_history.append({
            "role": "user",
            "parts": [user_message]
        })
        self.conversation_history.append({
            "role": "model",
            "parts": [assistant_response]
        })
        
        # Keep only last N exchanges
        if len(self.conversation_history) > self.max_history * 2:
            self.conversation_history = self.conversation_history[-self.max_history * 2:]
    
    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
        logger.info("Conversation history reset")
    
    def set_language(self, language: str):
        """Change pipeline language"""
        self.config.language = language
        logger.info(f"Language changed to: {language}")
    
    def set_voice(self, voice: str):
        """Change TTS voice"""
        self.config.voice = voice
        logger.info(f"Voice changed to: {voice}")


# Example usage
if __name__ == "__main__":
    import asyncio
    import os
    
    async def test_pipeline():
        config = PipelineConfig(
            sarvam_api_key=os.getenv("SARVAM_API_KEY"),
            gemini_api_key=os.getenv("GEMINI_API_KEY"),
            language="en-IN",
            voice="meera",
            system_prompt="You are a helpful AI detection assistant."
        )
        
        pipeline = VoicePipeline(config)
        
        # Test text input
        print("Testing text input...")
        audio = await pipeline.process_text_input(
            "Hello! Can you explain what AI-generated text looks like?",
            context=None
        )
        
        print(f"Generated {len(audio)} bytes of audio")
        
        # Save audio
        with open("pipeline_test.wav", "wb") as f:
            f.write(audio)
        print("Audio saved to pipeline_test.wav")
    
    asyncio.run(test_pipeline())
