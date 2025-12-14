"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image, Video, Sparkles } from "lucide-react";
import TextDetector from "@/components/TextDetector";
import ImageDetector from "@/components/ImageDetector";
import VideoDetector from "@/components/VideoDetector";

type Tab = "text" | "image" | "video";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("text");

  const tabs = [
    { id: "text" as Tab, label: "Text", icon: FileText },
    { id: "image" as Tab, label: "Image", icon: Image },
    { id: "video" as Tab, label: "Video", icon: Video },
  ];

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
              <Sparkles className="w-10 h-10 text-primary-500" />
            </motion.div>
            <h1 className="text-5xl font-bold gradient-text">
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
            {activeTab === "text" && <TextDetector />}
            {activeTab === "image" && <ImageDetector />}
            {activeTab === "video" && <VideoDetector />}
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
