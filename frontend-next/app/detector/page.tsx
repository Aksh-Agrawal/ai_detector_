"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Image,
  Video,
  Sparkles,
  ArrowLeft,
  File,
} from "lucide-react";
import Link from "next/link";
import TextDetector from "@/components/TextDetector";
import ImageDetector from "@/components/ImageDetector";
import VideoDetector from "@/components/VideoDetector";
import DocumentDetector from "@/components/DocumentDetector";

type Tab = "text" | "image" | "video" | "document";
type DetectionResult = {
  ai: number;
  human: number;
  type: "text" | "image" | "video";
  content?: string;
};

export default function Detector() {
  const [activeTab, setActiveTab] = useState<Tab>("text");
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);

  // Generate lighter background particles
  const particles = useMemo(() => {
    const colors = ["bg-orange-400", "bg-green-400", "bg-blue-400"];
    const sizes = ["w-2 h-2", "w-3 h-3"];

    return [...Array(15)].map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: sizes[i % sizes.length],
      x1: Math.random() * 1200,
      x2: Math.random() * 1200,
      y1: Math.random() * 800,
      y2: Math.random() * 800,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 10 + Math.random() * 15,
    }));
  }, []);

  const tabs = [
    { id: "text" as Tab, label: "Text", icon: FileText },
    { id: "image" as Tab, label: "Image", icon: Image },
    { id: "video" as Tab, label: "Video", icon: Video },
    { id: "document" as Tab, label: "Document", icon: File },
  ];

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating background elements - lighter version */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute ${particle.color} ${particle.size} rounded-full`}
            animate={{
              x: [particle.x1, particle.x2],
              y: [particle.y1, particle.y2],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              filter: "blur(2px)",
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-10 h-10 text-orange-500" />
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900">
              AI Content Detector
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze text, images, and videos to determine if they were created
            by AI or humans. Get instant, accurate results powered by machine
            learning.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-2 mb-8"
        >
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 relative px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "text" && (
              <TextDetector onResult={setDetectionResult} />
            )}
            {activeTab === "image" && (
              <ImageDetector onResult={setDetectionResult} />
            )}
            {activeTab === "video" && (
              <VideoDetector onResult={setDetectionResult} />
            )}
            {activeTab === "document" && <DocumentDetector />}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-sm text-gray-500"
        >
          <p>Powered by advanced machine learning models</p>
        </motion.div>
      </div>
    </main>
  );
}
