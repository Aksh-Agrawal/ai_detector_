"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  User,
  Bot,
  X,
  Mic,
  Key,
  AlertCircle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
// @ts-ignore
import ResultCard from "./ResultCard";
import VoiceChat from "./VoiceChat";
import VoiceButton from "./VoiceButton";
import APIKeyModal from "./APIKeyModal";
import { useVoiceChat } from "@/hooks/useVoiceChat";

const API_URL = "http://127.0.0.1:8000";

interface ImageDetectorProps {
  onResult?: (result: {
    ai: number;
    human: number;
    type: "image";
    content?: string;
  }) => void;
}

export default function ImageDetector({ onResult }: ImageDetectorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
    currentLanguage,
    startSession,
    endSession,
    sendTextMessage,
    setDetectionResults,
    startListening,
    stopListening,
    toggleLanguage,
  } = useVoiceChat();

  // Check API key status
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
    } catch (error) {
      console.error("Failed to check API key status:", error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setResult(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    multiple: false,
  });

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(`${API_URL}/detect/image`, formData);
      const detectionResult = response.data;
      setResult(detectionResult);

      // Pass result to parent
      if (onResult) {
        onResult({
          ...detectionResult,
          type: "image",
          content: file.name,
        });
      }

      // Send results to voice assistant
      if (sessionId) {
        await setDetectionResults({
          image_analyzed: file.name,
          ai_probability: detectionResult.ai,
          human_probability: detectionResult.human,
          detection_type: "image",
          analysis_timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze image. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartVoice = async () => {
    if (!isConnected) {
      await startSession();
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? "Drop the image here" : "Drag & drop an image"}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (PNG, JPG, JPEG, GIF, WebP)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-96 object-contain rounded-xl"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{file?.name}</span>
              <button
                onClick={handleDetect}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {result && (
        <>
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
            className="glass-effect rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Ask the AI Assistant
                  </h3>
                  <p className="text-sm text-gray-500">
                    Click "Start Voice Assistant" to ask questions about these
                    results
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAPIKeyModal(true)}
                  className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                  title="Configure API Keys"
                >
                  <Key className="w-4 h-4" />
                </button>
                {!isConnected && (
                  <button
                    onClick={handleStartVoice}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Start Voice Assistant
                  </button>
                )}
                {isConnected && (
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
            {apiKeyStatus &&
              (!apiKeyStatus.gemini.configured ||
                !apiKeyStatus.sarvam.configured) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      {!apiKeyStatus.gemini.configured && "Gemini"}
                      {!apiKeyStatus.gemini.configured &&
                        !apiKeyStatus.sarvam.configured &&
                        " & "}
                      {!apiKeyStatus.sarvam.configured && "Sarvam"} API not
                      configured.
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
              The AI assistant can explain why the image was detected as AI or
              human, discuss specific features, and answer your questions.
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 justify-between">
                  <VoiceButton
                    isConnected={isConnected}
                    isListening={isListening}
                    onClick={() =>
                      isListening ? stopListening() : startListening()
                    }
                  />
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-all"
                    title="Toggle Language"
                  >
                    {currentLanguage === "hi-IN"
                      ? "Switch to English"
                      : "हिंदी में बदलें"}
                  </button>
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
                      sendTextMessage(
                        "Why was this image detected as AI-generated?"
                      )
                    }
                    className="p-3 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-left"
                  >
                    💭 Why detected as AI?
                  </button>
                  <button
                    onClick={() =>
                      sendTextMessage("What features indicate AI generation?")
                    }
                    className="p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-left"
                  >
                    🔍 AI indicators?
                  </button>
                  <button
                    onClick={() =>
                      sendTextMessage("How confident is this detection?")
                    }
                    className="p-3 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-left"
                  >
                    📊 Confidence level?
                  </button>
                  <button
                    onClick={() =>
                      sendTextMessage("Can you explain in simple terms?")
                    }
                    className="p-3 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left"
                  >
                    💡 Explain simply
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
        </>
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
