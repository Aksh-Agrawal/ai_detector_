"""
Simple Voice Server Starter
Run this directly: python start_voice_server.py
"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the test server (works without full API setup)
from voice_test_server import app

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🎙️  AI Detector Voice Server")
    print("=" * 60)
    print()
    print("Server starting on: http://localhost:8001")
    print("Health check: http://localhost:8001/health")
    print()
    print("Frontend should connect to this server")
    print("Press CTRL+C to stop")
    print("=" * 60)
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
