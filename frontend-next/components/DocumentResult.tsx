"use client";

import { motion } from "framer-motion";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  BarChart3,
  FileCheck,
  Calendar,
  User,
  Bot,
} from "lucide-react";
import { useEffect, useState } from "react";

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

interface DocumentResultProps {
  result: DocumentAnalysisResult;
}

export default function DocumentResult({ result }: DocumentResultProps) {
  const { document_info, detection_results, page_analysis, text_preview } =
    result;
  const isAI = detection_results.ai_score > detection_results.human_score;
  
  const [displayAI, setDisplayAI] = useState(0);
  const [displayHuman, setDisplayHuman] = useState(0);

  const aiPercentage = detection_results.ai_score;
  const humanPercentage = detection_results.human_score;

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const aiIncrement = aiPercentage / steps;
    const humanIncrement = humanPercentage / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setDisplayAI(Math.min(aiIncrement * currentStep, aiPercentage));
      setDisplayHuman(Math.min(humanIncrement * currentStep, humanPercentage));

      if (currentStep >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [aiPercentage, humanPercentage]);

  return (
    <div className="space-y-6">
      {/* Overall Result Card - Matching ResultCard Design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="glass-effect rounded-2xl p-6 space-y-6 border-2"
        style={{
          borderColor: isAI ? "#f97316" : "#22c55e",
        }}
      >
        {/* Main Result */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
              isAI ? "bg-orange-100" : "bg-green-100"
            }`}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              {isAI ? (
                <Bot className="w-6 h-6 text-orange-600" />
              ) : (
                <User className="w-6 h-6 text-green-600" />
              )}
            </motion.div>
            <span
              className={`text-lg font-semibold ${
                isAI ? "text-orange-700" : "text-green-700"
              }`}
            >
              {isAI ? "Likely AI-Generated" : "Likely Human-Created"}
            </span>
          </motion.div>
        </div>

        {/* Score Bars */}
        <div className="space-y-4">
          {/* AI Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-700">AI Generated</span>
              </div>
              <motion.span
                className="font-semibold text-orange-600 text-lg"
                key={displayAI}
              >
                {displayAI.toFixed(1)}%
              </motion.span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${aiPercentage}%` }}
                transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                className="absolute h-full bg-orange-500 rounded-full relative"
              >
                <motion.div
                  className="absolute inset-0 bg-white"
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0.5, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    width: "50%",
                    filter: "blur(10px)",
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Human Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Human Created</span>
              </div>
              <motion.span
                className="font-semibold text-green-600 text-lg"
                key={displayHuman}
              >
                {displayHuman.toFixed(1)}%
              </motion.span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${humanPercentage}%` }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                className="absolute h-full bg-green-500 rounded-full relative"
              >
                <motion.div
                  className="absolute inset-0 bg-white"
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0.5, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    width: "50%",
                    filter: "blur(10px)",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Confidence Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-4 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600 text-center">
            {isAI
              ? aiPercentage > 90
                ? "🎯 High confidence this content is AI-generated"
                : "⚠️ Moderate confidence this content is AI-generated"
              : humanPercentage > 90
              ? "✅ High confidence this content is human-created"
              : "⚠️ Moderate confidence this content is human-created"}
          </p>
        </motion.div>
      </motion.div>

      {/* Document Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Document Information
        </h4>

        <div className="mb-3 pb-3 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Filename</p>
          <p className="text-base font-semibold text-gray-800">{document_info.filename}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">File Type</p>
            <p className="text-lg font-semibold text-gray-800 uppercase">
              {document_info.file_type}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Pages</p>
            <p className="text-lg font-semibold text-gray-800">
              {document_info.page_count}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Words</p>
            <p className="text-lg font-semibold text-gray-800">
              {document_info.total_words.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Characters</p>
            <p className="text-lg font-semibold text-gray-800">
              {document_info.total_characters.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Metadata */}
        {Object.keys(document_info.metadata).length > 0 && (
          <div className="mt-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">
              Metadata
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {document_info.metadata.author && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Author:</span>
                  <span className="font-medium text-gray-800">
                    {document_info.metadata.author}
                  </span>
                </div>
              )}
              {document_info.metadata.created && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(
                      document_info.metadata.created
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Page-by-Page Analysis */}
      {page_analysis && page_analysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Page-by-Page Analysis
          </h4>

          <div className="space-y-3">
            {page_analysis.map((page) => {
              const pageIsAI = page.ai_score > page.human_score;
              return (
                <div
                  key={page.page}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-800">
                      Page {page.page}
                    </span>
                    <span className="text-sm text-gray-600">
                      {page.char_count} characters
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-orange-600" />
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${page.ai_score}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * page.page }}
                            className="h-full bg-orange-500 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-orange-600 w-12 text-right">
                        {page.ai_score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${page.human_score}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * page.page }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-green-600 w-12 text-right">
                        {page.human_score}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Text Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-purple-500" />
          Text Preview
        </h4>

        <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {text_preview}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
