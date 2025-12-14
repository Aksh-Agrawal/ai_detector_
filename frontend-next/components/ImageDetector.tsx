"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, User, Bot, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import ResultCard from "./ResultCard";

const API_URL = "http://127.0.0.1:8000";

export default function ImageDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ai: number; human: number } | null>(
    null
  );

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
      setResult(response.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze image. Make sure the backend is running.");
    } finally {
      setLoading(false);
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
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
