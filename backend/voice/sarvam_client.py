"""
Sarvam AI Client for Speech-to-Text and Text-to-Speech
Supports 10+ Indian languages
Uses Pipecat integration for Sarvam AI services
"""

import os
import logging
from typing import AsyncIterator, Optional, Union
import base64

logger = logging.getLogger(__name__)


class SarvamAIClient:
    """Wrapper for Sarvam AI STT and TTS services via Pipecat"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Sarvam AI client
        
        Args:
            api_key: Sarvam AI API key (defaults to env variable)
        """
        self.api_key = api_key or os.getenv("SARVAM_API_KEY")
        if not self.api_key:
            logger.warning("SARVAM_API_KEY not found - Sarvam features will be disabled")
        else:
            logger.info("Sarvam AI client initialized successfully")
    
    async def transcribe_stream(
        self,
        audio_stream: AsyncIterator[bytes],
        language: str = "hi-IN"
    ) -> AsyncIterator[str]:
        """
        Stream audio to Sarvam AI for real-time transcription
        Note: For production, use Pipecat's SarvamSTTService directly in pipeline
        
        Args:
            audio_stream: Async iterator of audio chunks (bytes)
            language: Language code (e.g., 'en-IN', 'hi-IN', 'ta-IN')
            
        Yields:
            Transcribed text chunks
        """
        if not self.api_key:
            logger.error("Sarvam API key not configured")
            raise ValueError("SARVAM_API_KEY required for STT")
        
        try:
            # Import here to avoid dependency issues if not using Sarvam
            from pipecat.services.sarvam import SarvamSTTService
            
            logger.info(f"Starting STT stream for language: {language}")
            
            # For streaming, you would typically use this in a Pipecat pipeline
            # This is a simplified version for testing
            stt_service = SarvamSTTService(
                api_key=self.api_key,
                language=language,
                model="saarika:v2.5"
            )
            
            async for chunk in audio_stream:
                # Process audio chunk
                # Note: Actual implementation depends on Pipecat's API
                yield f"[STT transcription for {len(chunk)} bytes]"
                    
        except ImportError:
            logger.error("Pipecat Sarvam services not available. Install with: pip install 'pipecat-ai[sarvam]'")
            raise
        except Exception as e:
            logger.error(f"STT stream error: {e}")
            raise
    
    async def transcribe_audio(
        self,
        audio_data: bytes,
        language: str = "hi-IN"
    ) -> str:
        """
        Transcribe complete audio file
        
        Args:
            audio_data: Audio bytes
            language: Language code
            
        Returns:
            Complete transcribed text
        """
        if not self.api_key:
            logger.error("Sarvam API key not configured")
            return "[STT disabled - no API key]"
        
        try:
            logger.info(f"Transcribing audio ({len(audio_data)} bytes)")
            
            # Mock transcription for now
            # For production, use Pipecat's SarvamSTTService
            result = f"[Transcription of {len(audio_data)} bytes audio in {language}]"
            
            logger.info(f"Transcription complete")
            return result
            
        except Exception as e:
            logger.error(f"STT error: {e}")
            raise
    
    async def synthesize_speech(
        self,
        text: str,
        language: str = "hi-IN",
        voice: str = "meera",
        speed: float = 1.0
    ) -> bytes:
        """
        Convert text to speech using Sarvam AI TTS
        
        Args:
            text: Text to convert to speech
            language: Language code
            voice: Voice name ('meera', 'arjun', etc.)
            speed: Speech speed (0.5 to 2.0)
            
        Returns:
            Audio bytes (WAV format)
        """
        if not self.api_key:
            logger.error("Sarvam API key not configured")
            return b""  # Return empty audio
        
        try:
            logger.info(f"Synthesizing speech: {text[:50]}... (voice: {voice})")
            
            # Mock TTS for now - returns empty audio
            # For production, use Pipecat's SarvamTTSService
            logger.warning("TTS returning empty audio - Pipecat Sarvam integration pending")
            return b""
            
        except Exception as e:
            logger.error(f"TTS error: {e}")
            raise
    
    def get_supported_languages(self) -> dict:
        """Get list of supported languages"""
        return {
            "hi-IN": "English (India)",
            "hi-IN": "Hindi",
            "ta-IN": "Tamil",
            "te-IN": "Telugu",
            "kn-IN": "Kannada",
            "ml-IN": "Malayalam",
            "mr-IN": "Marathi",
            "gu-IN": "Gujarati",
            "bn-IN": "Bengali",
            "pa-IN": "Punjabi",
            "od-IN": "Odia"
        }
    
    def get_available_voices(self, language: str = "hi-IN") -> list:
        """Get available voices for a language"""
        # Sarvam TTS voices (from documentation)
        voices = {
            "hi-IN": ["meera", "arjun", "anushka"],
            "hi-IN": ["meera", "arjun", "anushka"],
            "ta-IN": ["meera", "arjun"],
            "te-IN": ["meera", "arjun"],
            "kn-IN": ["meera", "arjun"],
            "ml-IN": ["meera", "arjun"],
            "mr-IN": ["meera", "arjun"],
            "gu-IN": ["meera", "arjun"],
            "bn-IN": ["meera", "arjun"],
            "pa-IN": ["meera", "arjun"],
        }
        return voices.get(language, ["meera"])


# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def test_sarvam():
        client = SarvamAIClient()
        
        # Test language support
        languages = client.get_supported_languages()
        print(f"Supported languages: {len(languages)}")
        for code, name in languages.items():
            voices = client.get_available_voices(code)
            print(f"  {name} ({code}): {', '.join(voices)}")
        
        # Test TTS (will return empty if no API key)
        text = "Hello! I am the AI Detector voice assistant."
        audio = await client.synthesize_speech(text, voice="meera")
        print(f"\nGenerated {len(audio)} bytes of audio")
        
        if audio:
            with open("test_output.wav", "wb") as f:
                f.write(audio)
            print("Audio saved to test_output.wav")
        else:
            print("No audio generated (API key required)")
    
    asyncio.run(test_sarvam())
    
    asyncio.run(test_sarvam())
