"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, User, Bot } from "lucide-react";
import axios from "axios";
import ResultCard from "./ResultCard";

const API_URL = "http://127.0.0.1:8000";

export default function TextDetector() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ai: number; human: number } | null>(
    null
  );

  const handleDetect = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/detect/text`, { text });
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze text. Make sure the backend is running.");
    } finally {
      setLoading(false);
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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
        <ResultCard
          aiScore={result.ai}
          humanScore={result.human}
          aiIcon={Bot}
          humanIcon={User}
        />
      )}
    </div>
  );
}
