"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, Bot, Mic } from "lucide-react";
import axios from "axios";
// @ts-ignore
import ResultCard from "./ResultCard";
import VoiceChat from "./VoiceChat";
import VoiceButton from "./VoiceButton";
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
                <Mic className="w-6 h-6 text-pink-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Ask the AI Assistant
                </h3>
              </div>
              {!isConnected ? (
                <button
                  onClick={handleStartVoice}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Start Voice Assistant
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  End Session
                </button>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-700">
                    Voice assistant is ready. Ask questions about the detection
                    results!
                  </p>
                  <VoiceButton
                    isListening={isListening}
                    isConnected={isConnected}
                    onClick={isListening ? stopListening : startListening}
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
              <div className="text-center py-8 text-gray-500">
                <Mic className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>
                  Click "Start Voice Assistant" to ask questions about these
                  results
                </p>
                <p className="text-sm mt-2">
                  The AI assistant can explain why the text was detected as AI
                  or human, discuss specific features, and answer your
                  questions.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
