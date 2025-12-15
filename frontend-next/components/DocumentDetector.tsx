"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Loader2,
  X,
  File,
  FileCheck,
  Mic,
} from "lucide-react";
import axios from "axios";
import DocumentResult from "./DocumentResult";
import VoiceChat from "./VoiceChat";
import VoiceButton from "./VoiceButton";
import { useVoiceChat } from "@/hooks/useVoiceChat";

const API_URL = "http://127.0.0.1:8000";

interface DocumentInfo {
  filename: string;
  file_type: string;
  page_count: number;
  total_characters: number;
  total_words: number;
  metadata: Record<string, string>;
}

interface DetectionResults {
  ai_score: number;
  human_score: number;
  confidence: string;
}

interface PageAnalysis {
  page: number;
  ai_score: number;
  human_score: number;
  char_count: number;
}

interface DocumentAnalysisResult {
  success: boolean;
  document_info: DocumentInfo;
  detection_results: DetectionResults;
  page_analysis: PageAnalysis[] | null;
  text_preview: string;
}

export default function DocumentDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [".pdf", ".docx", ".txt"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(fileExt)) {
      setError(
        `Invalid file type. Supported formats: ${validTypes.join(", ")}`
      );
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size: 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const response = await axios.post<DocumentAnalysisResult>(
        `${API_URL}/detect/document`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);

      // Send results to voice assistant
      if (sessionId) {
        await setDetectionResults({
          document_analyzed: response.data.document_info.filename,
          ai_probability: response.data.detection_results.ai_score / 100,
          human_probability: response.data.detection_results.human_score / 100,
          detection_type: "document",
          page_count: response.data.document_info.page_count,
          word_count: response.data.document_info.total_words,
          analysis_timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Document analysis error:", err);
      const errorMsg =
        err.response?.data?.error ||
        "Failed to analyze document. Make sure the backend is running.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleStartVoice = async () => {
    if (!isConnected) {
      await startSession();
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (ext === "docx" || ext === "doc") return "📝";
    return "📋";
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-green-500 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Document Analysis
          </h2>
        </div>

        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-400"
            }`}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Upload Document
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <input
              type="file"
              id="document-upload"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) =>
                e.target.files && handleFileSelect(e.target.files[0])
              }
            />
            <label
              htmlFor="document-upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg cursor-pointer hover:from-orange-600 hover:to-green-600 transition-colors"
            >
              Select File
            </label>
            <p className="text-sm text-gray-400 mt-4">
              Supported formats: PDF, DOCX, TXT (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-green-50 border-2 border-orange-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {getFileIcon(selectedFile.name)}
                </motion.span>
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Document...
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  Analyze Document
                </>
              )}
            </motion.button>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DocumentResult result={result} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 via-white to-purple-50 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Voice Assistant
                </h3>
                <p className="text-xs text-gray-500">
                  {isConnected ? "Connected" : "Click to start"}
                </p>
              </div>
            </div>
            <VoiceButton
              isConnected={isConnected}
              isListening={isListening}
              isSpeaking={isSpeaking}
              onStart={handleStartVoice}
              onEnd={endSession}
              onToggleListening={() =>
                isListening ? stopListening() : startListening()
              }
            />
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <VoiceChat
                messages={messages}
                isConnected={isConnected}
                isSpeaking={isSpeaking}
                onSendMessage={sendTextMessage}
              />

              {/* Quick Questions */}
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
                    sendTextMessage("Which pages seem most suspicious?")
                  }
                  className="p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-left"
                >
                  📄 Which pages are suspicious?
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
                The AI assistant can explain why the document was detected as AI
                or human, discuss specific pages, and answer your questions.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
