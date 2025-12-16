# 🔑 API Key Configuration Guide

Your voice assistant now supports **dynamic API key configuration** directly from the frontend! No need to restart the server.

## 🎯 Features

- **Automatic Detection**: App checks if API keys are missing on startup
- **In-App Configuration**: Configure keys directly in the UI
- **Live Instructions**: Step-by-step guide to get free API keys
- **Fallback Mode**: Works without keys (limited features)
- **No Restart Required**: Keys are configured instantly

---

## 🚀 How to Use

### 1. **Automatic Prompt**
When you open the Voice Assistant page, if API keys are missing, a modal will automatically appear.

### 2. **Manual Configuration**
Click the **"API Keys"** button in the header anytime to open the configuration modal.

### 3. **Get Free API Keys**

#### **Gemini API Key (Google AI)** - FREE
- **What it's for**: AI-powered intelligent responses and conversation
- **Free tier**: 2M tokens/min (very generous!)
- **How to get it**:
  1. Visit [https://ai.google.dev/](https://ai.google.dev/)
  2. Click "Get API Key in Google AI Studio"
  3. Sign in with your Google account
  4. Create a new API key
  5. Copy and paste into the modal

#### **Sarvam AI API Key** - FREE TIER AVAILABLE
- **What it's for**: Indian language voice support (Hindi, Tamil, Telugu, etc.)
- **How to get it**:
  1. Visit [https://www.sarvam.ai/](https://www.sarvam.ai/)
  2. Sign up for an account
  3. Navigate to API section in dashboard
  4. Generate API key
  5. Copy and paste into the modal

---

## 📊 API Key Status

The app shows real-time status:
- ✅ **Green** = Configured and working
- ⚠️ **Yellow** = Not configured (using fallback mode)
- ❌ **Red** = Error or invalid key

---

## 🔄 Fallback Modes

### Without Gemini API Key:
- **Mock responses** instead of AI-powered answers
- Basic conversation works
- Limited intelligence

### Without Sarvam AI API Key:
- **Browser speech synthesis** instead of natural Indian voices
- English and some Indian languages still work
- Less natural sounding voices

### With Both Keys:
- 🤖 **Smart AI responses** from Gemini
- 🎙️ **Natural Indian language voices** from Sarvam
- 🌐 **Full multilingual support**

---

## 🛡️ Security

- **In-Memory Only**: API keys are stored temporarily in server memory
- **Not Saved**: Keys are never written to disk
- **Session-Based**: Keys are lost when server restarts (for security)
- **No Database**: No persistent storage of sensitive data

**Note**: You'll need to re-enter keys if you restart the backend server.

---

## 🎨 UI Features

### Configuration Modal Includes:
1. **Current Status** - See which keys are configured
2. **Live Instructions** - Get keys directly from modal
3. **Direct Links** - Click to open API provider websites
4. **Validation** - Real-time feedback on key validity
5. **Success Messages** - Confirmation when keys are saved

---

## 🔧 Technical Details

### Backend Endpoints

```bash
# Check API key status
GET http://localhost:8001/api/voice/api-keys/status

# Configure API keys
POST http://localhost:8001/api/voice/api-keys/configure
{
  "gemini_api_key": "AIza...",
  "sarvam_api_key": "sarvam_..."
}
```

### Frontend Components

- **APIKeyModal.tsx** - Main configuration modal
- **Voice page** - Auto-checks status on load
- **Status banner** - Shows missing key warnings

---

## 📝 Example Workflow

1. **User opens Voice Assistant page**
2. **App checks**: `GET /api/voice/api-keys/status`
3. **If missing**: Modal appears automatically
4. **User clicks** "Get Key" links
5. **User generates** free API keys
6. **User pastes** keys in modal
7. **Click** "Save API Keys"
8. **App configures**: `POST /api/voice/api-keys/configure`
9. **Success!** Full features enabled

---

## ❓ FAQ

### Q: Do I need both keys?
**A**: No! You can use:
- Just Gemini (smart responses, browser voices)
- Just Sarvam (mock responses, Indian voices)
- Both (full features)
- Neither (basic fallback mode)

### Q: Are the keys saved permanently?
**A**: No, for security they're only stored in memory. Re-enter after server restart.

### Q: How much do the APIs cost?
**A**: Both offer generous **FREE tiers**:
- Gemini: 2M tokens/min (plenty for personal use)
- Sarvam: Check their free tier limits

### Q: Can I change keys later?
**A**: Yes! Click the "API Keys" button anytime to update.

### Q: What if I enter a wrong key?
**A**: The app validates keys and shows error messages. Just re-enter the correct one.

---

## 🎉 Benefits

✅ **No Manual .env Editing** - Configure from UI  
✅ **User-Friendly** - Clear instructions with direct links  
✅ **Secure** - Keys not saved permanently  
✅ **Flexible** - Use any combination of keys  
✅ **No Restart** - Changes apply immediately  
✅ **Free** - Both APIs have free tiers  

---

## 🚀 Ready to Deploy?

For hosting (Vercel, Railway, etc.), you can set environment variables:
```bash
GEMINI_API_KEY=your_key_here
SARVAM_API_KEY=your_key_here
```

But users can still override them through the UI for testing!

---

**Enjoy your enhanced voice assistant! 🎙️🤖**
