"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  Bot,
  User,
  Loader2,
  Volume2,
  Key,
  AlertCircle,
} from "lucide-react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import VoiceButton from "./VoiceButton";
import APIKeyModal from "./APIKeyModal";

export default function FloatingVoiceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sessionId,
    messages,
    isConnected,
    isListening,
    isSpeaking,
    currentLanguage,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
    toggleLanguage,
  } = useVoiceChat();

  // Check API key status when component mounts
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!isConnected) {
      await startSession(currentLanguage);
    }

    await sendTextMessage(inputMessage.trim());
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartVoice = async () => {
    if (!isConnected) {
      await startSession(currentLanguage);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-7 h-7" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
            {/* API Key Warning Badge */}
            {apiKeyStatus && (!apiKeyStatus.gemini.configured || !apiKeyStatus.sarvam.configured) && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-yellow-900" />
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Voice Assistant</h3>
                    <p className="text-white/80 text-xs">
                      {isConnected
                        ? `Connected • ${
                            currentLanguage === "hi-IN"
                              ? "🇮🇳 हिंदी"
                              : "🇮🇳 English"
                          }`
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAPIKeyModal(true)}
                    className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                    title="Configure API Keys"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* API Key Warning */}
              {apiKeyStatus && (!apiKeyStatus.gemini.configured || !apiKeyStatus.sarvam.configured) && (
                <div className="mt-2 p-2 bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-100 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-yellow-50">
                        {!apiKeyStatus.gemini.configured && "Gemini"}
                        {!apiKeyStatus.gemini.configured && !apiKeyStatus.sarvam.configured && " & "}
                        {!apiKeyStatus.sarvam.configured && "Sarvam"} API not configured.
                        <button
                          onClick={() => setShowAPIKeyModal(true)}
                          className="underline font-medium ml-1 hover:text-white"
                        >
                          Setup
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Start a conversation! Ask me anything about your detection
                    results.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : "bg-gradient-to-br from-orange-400 to-purple-500"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isSpeaking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-white rounded-2xl p-3 shadow-sm">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Language Toggle & Voice Controls */}
              {!isConnected && (
                <div className="mb-3 flex items-center gap-2">
                  <button
                    onClick={toggleLanguage}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-all border border-gray-300"
                  >
                    {currentLanguage === "hi-IN"
                      ? "Switch to English"
                      : "हिंदी में बदलें"}
                  </button>
                  <button
                    onClick={handleStartVoice}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:from-orange-600 hover:to-purple-600 transition-all"
                  >
                    Start Voice
                  </button>
                </div>
              )}

              {isConnected && (
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VoiceButton
                      isConnected={isConnected}
                      isListening={isListening}
                      onClick={() =>
                        isListening ? stopListening() : startListening()
                      }
                    />
                    <span className="text-xs text-gray-500">
                      {isListening ? "Listening..." : "Click to speak"}
                    </span>
                  </div>
                  <button
                    onClick={endSession}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors"
                  >
                    End Session
                  </button>
                </div>
              )}

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg hover:from-orange-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Configuration Modal */}
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => setShowAPIKeyModal(false)}
        onKeysConfigured={() => {
          checkAPIKeyStatus();
          setShowAPIKeyModal(false);
        }}
      />
    </>
  );
}
