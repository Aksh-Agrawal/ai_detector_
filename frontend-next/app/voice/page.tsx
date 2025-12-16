"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, Languages, Key } from "lucide-react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import VoiceButton from "@/components/VoiceButton";
import VoiceChat from "@/components/VoiceChat";
import APIKeyModal from "@/components/APIKeyModal";

const LANGUAGES = [
  { code: "hi-IN", name: "English (India)" },
  { code: "hi-IN", name: "हिंदी (Hindi)" },
  { code: "ta-IN", name: "தமிழ் (Tamil)" },
  { code: "te-IN", name: "తెలుగు (Telugu)" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", name: "മലയാളം (Malayalam)" },
];

const VOICES = [
  { id: "meera", name: "Meera (Female)" },
  { id: "arjun", name: "Arjun (Male)" },
];

export default function VoiceAssistantPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");
  const [selectedVoice, setSelectedVoice] = useState("meera");
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null);

  const {
    sessionId,
    messages,
    isConnected,
    isListening,
    isSpeaking,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
  } = useVoiceChat({
    onMessage: (message) => {
      console.log("New message:", message);
    },
    onError: (error) => {
      console.error("Voice chat error:", error);
    },
  });

  // Check API key status on mount
  useEffect(() => {
    checkAPIKeyStatus();
  }, []);

  const checkAPIKeyStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:8001/api/voice/api-keys/status"
      );
      const data = await response.json();
      setApiKeyStatus(data);

      // Show modal if no keys are configured
      if (!data.gemini.configured && !data.sarvam.configured) {
        setShowAPIKeyModal(true);
      }
    } catch (error) {
      console.error("Failed to check API key status:", error);
    }
  };

  const handleStartSession = async () => {
    await startSession(selectedLanguage, selectedVoice);
  };

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-800">
              🎙️ Voice Assistant
            </h1>
            <button
              onClick={() => setShowAPIKeyModal(true)}
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition flex items-center gap-2"
              title="Configure API Keys"
            >
              <Key className="w-4 h-4" />
              API Keys
            </button>
          </div>
          <p className="text-gray-600">
            Ask questions about your AI detection results
          </p>

          {/* API Key Status Banner */}
          {apiKeyStatus &&
            (!apiKeyStatus.gemini.configured ||
              !apiKeyStatus.sarvam.configured) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2"
              >
                <p className="text-sm text-yellow-800">
                  ⚠️ {!apiKeyStatus.gemini.configured && "Gemini"}
                  {!apiKeyStatus.gemini.configured &&
                    !apiKeyStatus.sarvam.configured &&
                    " and "}
                  {!apiKeyStatus.sarvam.configured && "Sarvam"} API key
                  {!apiKeyStatus.gemini.configured &&
                  !apiKeyStatus.sarvam.configured
                    ? "s"
                    : ""}{" "}
                  not configured. Using fallback mode.{" "}
                  <button
                    onClick={() => setShowAPIKeyModal(true)}
                    className="underline font-medium hover:text-yellow-900"
                  >
                    Configure now
                  </button>
                </p>
              </motion.div>
            )}
        </motion.div>

        {/* API Key Modal */}
        <APIKeyModal
          isOpen={showAPIKeyModal}
          onClose={() => setShowAPIKeyModal(false)}
          onKeysConfigured={() => {
            checkAPIKeyStatus();
            setShowAPIKeyModal(false);
          }}
        />

        {/* Settings */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Languages className="w-6 h-6 text-orange-500" />
              Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Language selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Voice Controls */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Voice Controls
              </h3>

              <div className="space-y-4">
                {/* Connection button */}
                <button
                  onClick={isConnected ? endSession : handleStartSession}
                  className={`
                    w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                    transition-all duration-300 font-medium
                    ${
                      isConnected
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }
                  `}
                >
                  {isConnected ? (
                    <>
                      <PhoneOff className="w-5 h-5" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Connect
                    </>
                  )}
                </button>

                {/* Voice button */}
                <div className="flex flex-col items-center gap-4 py-6">
                  <VoiceButton
                    isListening={isListening}
                    isConnected={isConnected}
                    onClick={handleVoiceButtonClick}
                  />
                  <p className="text-sm text-gray-600 text-center">
                    {isListening
                      ? "Listening..."
                      : isConnected
                      ? "Click to speak"
                      : "Connect to start"}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        isConnected ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  {isConnected && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Session ID:</span>
                        <span className="text-xs font-mono text-gray-500">
                          {sessionId?.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Language:</span>
                        <span className="font-medium text-gray-700">
                          {
                            LANGUAGES.find((l) => l.code === selectedLanguage)
                              ?.name
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="md:col-span-2">
            <VoiceChat
              messages={messages}
              isConnected={isConnected}
              isSpeaking={isSpeaking}
              onSendMessage={sendTextMessage}
            />
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Click "Connect" to start a voice session</li>
            <li>• Use the microphone button to speak your questions</li>
            <li>• Type text messages for faster responses</li>
            <li>• Ask "Why was this detected as AI?" after analyzing text</li>
            <li>• Switch languages anytime before connecting</li>
            <li>• The assistant supports 10+ Indian languages</li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
