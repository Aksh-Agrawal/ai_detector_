"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, User, Bot, X, Film } from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import ResultCard from "./ResultCard";

const API_URL = "http://127.0.0.1:8000";

export default function VideoDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ai: number;
    human: number;
    frame_count?: number;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"] },
    multiple: false,
  });

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const response = await axios.post(`${API_URL}/detect/video`, formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze video. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const clearVideo = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <Film className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? "Drop the video here" : "Drag & drop a video"}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (MP4, MOV, AVI, MKV, WebM)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Film className="w-12 h-12 text-primary-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={clearVideo}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleDetect}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Video...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Analyze Video
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {result && (
        <div className="space-y-4">
          {result.frame_count && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-xl p-4 text-center"
            >
              <p className="text-sm text-gray-600">
                Analyzed{" "}
                <span className="font-semibold text-primary-600">
                  {result.frame_count}
                </span>{" "}
                frames
              </p>
            </motion.div>
          )}
          <ResultCard
            aiScore={result.ai}
            humanScore={result.human}
            aiIcon={Bot}
            humanIcon={User}
          />
        </div>
      )}
    </div>
  );
}
