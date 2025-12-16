"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, Bot, Mic, Key, AlertCircle } from "lucide-react";
import axios from "axios";
// @ts-ignore
import ResultCard from "./ResultCard";
import VoiceChat from "./VoiceChat";
import VoiceButton from "./VoiceButton";
import APIKeyModal from "./APIKeyModal";
import { useVoiceChat } from "@/hooks/useVoiceChat";

const API_URL = "http://127.0.0.1:8000";
const VOICE_API_URL = "http://localhost:8001";

interface TextDetectorProps {
  onResult?: (result: {
    ai: number;
    human: number;
    type: "text";
    content: string;
  }) => void;
}

export default function TextDetector({ onResult }: TextDetectorProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ai: number; human: number } | null>(
    null
  );
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null);

  // Voice chat integration
  const {
    sessionId,
    messages,
    isConnected,
    isListening,
    isSpeaking,
    startSession,
    endSession,
    sendTextMessage,
    setDetectionResults,
    startListening,
    stopListening,
  } = useVoiceChat();

  // Check API key status
  useEffect(() => {
    checkAPIKeyStatus();
  }, []);

  const checkAPIKeyStatus = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/voice/api-keys/status");
      const data = await response.json();
      setApiKeyStatus(data);
    } catch (error) {
      console.error("Failed to check API key status:", error);
    }
  };

  const handleDetect = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/detect/text`, { text });
      const detectionResult = response.data;
      setResult(detectionResult);

      // Pass result to parent
      if (onResult) {
        onResult({
          ...detectionResult,
          type: "text",
          content: text,
        });
      }

      // Send results to voice assistant
      if (sessionId) {
        await setDetectionResults({
          text_analyzed:
            text.substring(0, 200) + (text.length > 200 ? "..." : ""),
          ai_probability: detectionResult.ai,
          human_probability: detectionResult.human,
          detection_type: "text",
          analysis_timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze text. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-start voice session when component mounts (if result exists)
  const handleStartVoice = async () => {
    if (!isConnected) {
      await startSession();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleDetect();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Enter or paste text to analyze
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type or paste your text here... (Press Ctrl+Enter to analyze)"
          className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {text.length} characters
          </span>
          <button
            onClick={handleDetect}
            disabled={!text.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze Text
              </>
            )}
          </button>
        </div>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <ResultCard
            aiScore={result.ai}
            humanScore={result.human}
            aiIcon={Bot}
            humanIcon={User}
          />

          {/* Voice Assistant Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Ask the AI Assistant</h3>
                  <p className="text-sm text-gray-500">
                    Click "Start Voice Assistant" to ask questions about these results
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAPIKeyModal(true)}
                  className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                  title="Configure API Keys"
                >
                  <Key className="w-4 h-4" />
                </button>
                {!isConnected ? (
                  <button
                    onClick={handleStartVoice}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Start Voice Assistant
                  </button>
                ) : (
                  <button
                    onClick={endSession}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    End
                  </button>
                )}
              </div>
            </div>

            {/* API Key Warning */}
            {apiKeyStatus && (!apiKeyStatus.gemini.configured || !apiKeyStatus.sarvam.configured) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    {!apiKeyStatus.gemini.configured && "Gemini"}
                    {!apiKeyStatus.gemini.configured && !apiKeyStatus.sarvam.configured && " & "}
                    {!apiKeyStatus.sarvam.configured && "Sarvam"} API not configured.
                    <button
                      onClick={() => setShowAPIKeyModal(true)}
                      className="underline font-medium ml-1 hover:text-yellow-900"
                    >
                      Configure now
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              The AI assistant can explain why the text was detected as AI or human, discuss specific features, and answer your questions.
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-between">
                  <VoiceButton
                    isConnected={isConnected}
                    isListening={isListening}
                    onClick={() => (isListening ? stopListening() : startListening())}
                  />
                </div>

                <VoiceChat
                  messages={messages}
                  isConnected={isConnected}
                  isSpeaking={isSpeaking}
                  onSendMessage={sendTextMessage}
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      sendTextMessage("Why was this detected as AI-generated?")
                    }
                    className="p-3 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-left"
                  >
                    💭 Why was this detected as AI?
                  </button>
                  <button
                    onClick={() =>
                      sendTextMessage("What features indicate AI generation?")
                    }
                    className="p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-left"
                  >
                    🔍 What are the AI indicators?
                  </button>
                  <button
                    onClick={() =>
                      sendTextMessage("How confident is this detection?")
                    }
                    className="p-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-left"
                  >
                    📊 How confident is this?
                  </button>
                  <button
                    onClick={() =>
                      sendTextMessage(
                        "Can you explain the results in simple terms?"
                      )
                    }
                    className="p-3 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left"
                  >
                    💡 Explain in simple terms
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Mic className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">
                  Start the voice assistant to discuss these results
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => setShowAPIKeyModal(false)}
        onKeysConfigured={() => {
          checkAPIKeyStatus();
          setShowAPIKeyModal(false);
        }}
      />
    </div>
  );
}
