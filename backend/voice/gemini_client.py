"""
Google Gemini Client for LLM Reasoning
Uses FREE Gemini 2.0 Flash (2M tokens/min)
"""

import os
import logging
from typing import List, Dict, Optional, AsyncIterator
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

logger = logging.getLogger(__name__)


class GeminiClient:
    """Wrapper for Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client
        
        Args:
            api_key: Gemini API key (defaults to env variable)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found. Get free key from https://ai.google.dev/")
        
        genai.configure(api_key=self.api_key)
        
        # Use free Gemini 2.0 Flash model
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=2048,
            )
        )
        
        logger.info("Gemini client initialized (FREE tier: 2M tokens/min)")
    
    async def generate_response(
        self,
        prompt: str,
        context: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate response from Gemini
        
        Args:
            prompt: User's question/request
            context: Conversation history [{"role": "user/model", "parts": "text"}]
            system_prompt: System instructions
            
        Returns:
            Generated response text
        """
        try:
            # Build conversation history
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "user",
                    "parts": [f"SYSTEM INSTRUCTIONS: {system_prompt}"]
                })
                messages.append({
                    "role": "model",
                    "parts": ["Understood. I will follow these instructions."]
                })
            
            if context:
                messages.extend(context)
            
            messages.append({
                "role": "user",
                "parts": [prompt]
            })
            
            logger.info(f"Generating response for: {prompt[:100]}...")
            
            # Generate response
            chat = self.model.start_chat(history=messages[:-1])
            response = await chat.send_message_async(prompt)
            
            logger.info(f"Generated response: {response.text[:100]}...")
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise
    
    async def stream_response(
        self,
        prompt: str,
        context: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream response from Gemini (for real-time voice)
        
        Args:
            prompt: User's question/request
            context: Conversation history
            system_prompt: System instructions
            
        Yields:
            Response chunks as they're generated
        """
        try:
            # Build conversation history
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "user",
                    "parts": [f"SYSTEM INSTRUCTIONS: {system_prompt}"]
                })
                messages.append({
                    "role": "model",
                    "parts": ["Understood."]
                })
            
            if context:
                messages.extend(context)
            
            logger.info(f"Streaming response for: {prompt[:100]}...")
            
            # Stream response
            chat = self.model.start_chat(history=messages)
            response = await chat.send_message_async(prompt, stream=True)
            
            async for chunk in response:
                if chunk.text:
                    logger.debug(f"Chunk: {chunk.text}")
                    yield chunk.text
                    
        except Exception as e:
            logger.error(f"Gemini streaming error: {e}")
            raise
    
    def explain_detection_results(
        self,
        detection_results: Dict,
        user_question: str
    ) -> str:
        """
        Generate natural language explanation of AI detection results
        
        Args:
            detection_results: Dict with ai_score, human_score, features, etc.
            user_question: User's specific question
            
        Returns:
            Human-friendly explanation
        """
        system_prompt = """You are an AI detection expert explaining results to users.
        Be clear, concise, and helpful. Use simple language. Provide specific examples
        from the analyzed text when possible."""
        
        ai_score = detection_results.get('ai_score', 0)
        human_score = detection_results.get('human_score', 0)
        content_type = detection_results.get('type', 'text')
        
        context_prompt = f"""
        Detection Results:
        - AI Probability: {ai_score:.1f}%
        - Human Probability: {human_score:.1f}%
        - Content Type: {content_type}
        
        User Question: {user_question}
        
        Provide a clear, helpful explanation focusing on why the {content_type} was classified this way.
        Be concise (2-3 sentences) and specific.
        """
        
        # Use synchronous version
        try:
            messages = [{
                "role": "user",
                "parts": [f"SYSTEM INSTRUCTIONS: {system_prompt}"]
            }, {
                "role": "model",
                "parts": ["Understood. I will follow these instructions."]
            }, {
                "role": "user",
                "parts": [context_prompt]
            }]
            
            chat = self.model.start_chat(history=messages[:-1])
            response = chat.send_message(context_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini error in explain_detection_results: {e}")
            return f"Based on the analysis, this {content_type} appears to be {ai_score:.0f}% AI-generated and {human_score:.0f}% human-created."


# System prompts for different features
SYSTEM_PROMPTS = {
    "results_explanation": """You are an AI detection expert. Explain detection results clearly and concisely.
    Focus on specific patterns, features, and evidence. Use simple language. Be helpful and educational.""",
    
    "tutorial": """You are a friendly tutorial guide for the AI Detector tool.
    Guide users step-by-step through features. Be encouraging and clear. Ask questions to understand user needs.""",
    
    "analysis_discussion": """You are an analytical assistant for document comparison.
    Compare documents objectively, highlight key differences, and provide insights. Be thorough but concise.""",
    
    "batch_summary": """You are a data analyst summarizing batch analysis results.
    Provide clear statistics, identify patterns, and highlight important findings. Be organized and precise."""
}


# Example usage
if __name__ == "__main__":
    import asyncio
    
    async def test_gemini():
        client = GeminiClient()
        
        # Test simple generation
        response = await client.generate_response(
            "Explain in one sentence what AI-generated text typically looks like.",
            system_prompt=SYSTEM_PROMPTS["results_explanation"]
        )
        print(f"Response: {response}")
        
        # Test streaming
        print("\nStreaming response:")
        async for chunk in client.stream_response(
            "How can users tell if an essay was written by AI?",
            system_prompt=SYSTEM_PROMPTS["tutorial"]
        ):
            print(chunk, end="", flush=True)
        print()
    
    asyncio.run(test_gemini())
