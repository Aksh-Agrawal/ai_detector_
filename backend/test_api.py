"""
Test the voice server API endpoints
Run this while voice_test_server.py is running
"""

import requests
import json
import time


def test_server():
    """Test all server endpoints"""
    base_url = "http://localhost:8001"
    
    print("🧪 Testing Voice Server API")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✓ Status: {response.status_code}")
        print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 2: Create session
    print("\n2. Creating session...")
    try:
        response = requests.post(
            f"{base_url}/api/voice/session",
            json={
                "user_id": "test_user",
                "language": "hi-IN",
                "voice": "meera"
            }
        )
        print(f"✓ Status: {response.status_code}")
        session_data = response.json()
        session_id = session_data["session_id"]
        print(f"  Session ID: {session_id}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 3: Get session
    print("\n3. Getting session...")
    try:
        response = requests.get(f"{base_url}/api/voice/session/{session_id}")
        print(f"✓ Status: {response.status_code}")
        print(f"  Language: {response.json()['language']}")
        print(f"  Voice: {response.json()['voice']}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 4: Send text message
    print("\n4. Sending text message...")
    try:
        response = requests.post(
            f"{base_url}/api/voice/text",
            json={
                "session_id": session_id,
                "text": "Hello! Can you explain AI detection?"
            }
        )
        print(f"✓ Status: {response.status_code}")
        result = response.json()
        print(f"  Response: {result['text'][:100]}...")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 5: Set detection results
    print("\n5. Setting detection results context...")
    try:
        response = requests.post(
            f"{base_url}/api/voice/results",
            json={
                "session_id": session_id,
                "results": {
                    "ai_probability": 0.85,
                    "human_probability": 0.15,
                    "features": {
                        "perplexity": "low",
                        "burstiness": "low"
                    }
                }
            }
        )
        print(f"✓ Status: {response.status_code}")
        print(f"  {response.json()['message']}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 6: Ask about results
    print("\n6. Asking about detection results...")
    try:
        response = requests.post(
            f"{base_url}/api/voice/text",
            json={
                "session_id": session_id,
                "text": "Why was this detected as AI?"
            }
        )
        print(f"✓ Status: {response.status_code}")
        result = response.json()
        print(f"  Response: {result['text'][:100]}...")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    # Test 7: Delete session
    print("\n7. Deleting session...")
    try:
        response = requests.delete(f"{base_url}/api/voice/session/{session_id}")
        print(f"✓ Status: {response.status_code}")
        print(f"  {response.json()['message']}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    print("\n" + "=" * 50)
    print("✅ All API tests passed!")
    print("\n📋 Next Steps:")
    print("1. Get API keys from:")
    print("   - https://ai.google.dev (Gemini - FREE)")
    print("   - https://sarvam.ai (Sarvam AI - paid)")
    print("2. Add keys to backend/voice/.env")
    print("3. Test voice features at http://localhost:3000/voice")


if __name__ == "__main__":
    print("Waiting for server to start...")
    time.sleep(2)
    
    try:
        test_server()
    except KeyboardInterrupt:
        print("\n\nTest interrupted")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
