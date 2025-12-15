"""
Simple test script for voice agent components
Tests without requiring external API keys
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from voice.session_manager_memory import SessionManager


async def test_session_manager():
    """Test session manager functionality"""
    print("\n=== Testing Session Manager ===")
    
    manager = SessionManager()
    await manager.connect()
    
    # Test 1: Create session
    print("\n1. Creating session...")
    session = await manager.create_session(
        user_id="test_user",
        language="hi-IN",
        voice="meera"
    )
    print(f"✓ Session created: {session['session_id']}")
    
    # Test 2: Get session
    print("\n2. Retrieving session...")
    retrieved = await manager.get_session(session['session_id'])
    assert retrieved is not None
    print(f"✓ Session retrieved: {retrieved['session_id']}")
    
    # Test 3: Add to history
    print("\n3. Adding conversation history...")
    await manager.add_to_history(
        session['session_id'],
        "user",
        "Hello, can you help me?"
    )
    await manager.add_to_history(
        session['session_id'],
        "assistant",
        "Of course! I'm here to help with AI detection."
    )
    print("✓ History added")
    
    # Test 4: Get history
    print("\n4. Retrieving history...")
    history = await manager.get_history(session['session_id'])
    print(f"✓ History retrieved: {len(history)} messages")
    for msg in history:
        print(f"  - {msg['role']}: {msg['content'][:50]}...")
    
    # Test 5: Set context
    print("\n5. Setting context...")
    await manager.set_context(
        session['session_id'],
        "detection_results",
        {"ai_probability": 0.85, "human_probability": 0.15}
    )
    print("✓ Context set")
    
    # Test 6: Get context
    print("\n6. Retrieving context...")
    context = await manager.get_context(session['session_id'])
    print(f"✓ Context retrieved: {context}")
    
    # Test 7: Delete session
    print("\n7. Deleting session...")
    deleted = await manager.delete_session(session['session_id'])
    assert deleted is True
    print("✓ Session deleted")
    
    await manager.disconnect()
    print("\n✅ All session manager tests passed!")


async def test_mock_voice_flow():
    """Test mock voice conversation flow"""
    print("\n\n=== Testing Mock Voice Flow ===")
    
    manager = SessionManager()
    await manager.connect()
    
    # Create session
    session = await manager.create_session(language="hi-IN", voice="meera")
    session_id = session['session_id']
    print(f"\n✓ Session started: {session_id}")
    
    # Simulate conversation
    conversations = [
        ("user", "What is AI detection?"),
        ("assistant", "AI detection is the process of identifying whether text was written by AI or humans."),
        ("user", "How accurate is it?"),
        ("assistant", "Our model achieves over 90% accuracy on most texts."),
        ("user", "Can I test it in multiple languages?"),
        ("assistant", "Yes! We support 10+ Indian languages including Hindi, Tamil, Telugu, and more."),
    ]
    
    print("\n📝 Simulating conversation:")
    for role, content in conversations:
        await manager.add_to_history(session_id, role, content)
        emoji = "👤" if role == "user" else "🤖"
        print(f"{emoji} {role}: {content}")
    
    # Get conversation summary
    history = await manager.get_history(session_id, limit=10)
    print(f"\n✓ Conversation stored: {len(history)} messages")
    
    # Set detection context
    await manager.set_context(
        session_id,
        "detection_results",
        {
            "text": "Sample text to analyze",
            "ai_probability": 0.75,
            "human_probability": 0.25,
            "features": {
                "perplexity": "low",
                "burstiness": "low",
                "coherence": "high"
            }
        }
    )
    print("✓ Detection results added to context")
    
    # Cleanup
    await manager.delete_session(session_id)
    await manager.disconnect()
    
    print("\n✅ Mock voice flow test passed!")


async def main():
    """Run all tests"""
    print("🧪 Voice Agent Component Tests")
    print("=" * 50)
    
    try:
        await test_session_manager()
        await test_mock_voice_flow()
        
        print("\n" + "=" * 50)
        print("✨ All tests completed successfully!")
        print("\n📋 Next Steps:")
        print("1. Get API keys:")
        print("   - Gemini: https://ai.google.dev (FREE)")
        print("   - Sarvam AI: https://sarvam.ai (paid)")
        print("2. Update backend/voice/.env with your keys")
        print("3. Install Redis (or continue with in-memory for testing)")
        print("4. Run: python -m voice.voice_server")
        print("5. Test at: http://localhost:3000/voice")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
