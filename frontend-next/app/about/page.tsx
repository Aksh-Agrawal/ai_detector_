"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Shield,
  Zap,
  Target,
  Github,
  Mail,
  Mic,
  FileText,
  Globe,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description:
        "Powered by state-of-the-art machine learning models including transformer-based text analysis and vision transformers for multimodal detection.",
    },
    {
      icon: Shield,
      title: "88.5% Accuracy",
      description:
        "High-precision algorithms trained on extensive datasets achieving 88.5% overall accuracy across text (89%), images (92%), videos (85%), and documents (88%).",
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description:
        "Comprehensive PDF, DOCX, and TXT processing with page-by-page analysis, metadata extraction, and batch document support up to 10MB.",
    },
    {
      icon: Mic,
      title: "Multilingual Voice Assistant",
      description:
        "Interactive voice agent supporting 10+ Indian languages (Hindi, Tamil, Telugu, etc.) with real-time Q&A about detection results using Sarvam AI and Google Gemini.",
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description:
        "Lightning-fast results with 0.8s text analysis, 2.1s image processing, and <1s voice response latency. Get instant insights with optimized processing.",
    },
    {
      icon: MessageCircle,
      title: "Floating Chat Widget",
      description:
        "Bottom-right chat interface for seamless voice and text conversations. Ask questions, get explanations, and understand results in your preferred language.",
    },
    {
      icon: Target,
      title: "Multi-format Support",
      description:
        "Comprehensive detection across text, images (PNG, JPG, etc.), videos (MP4, AVI, MOV), and documents with intelligent format detection and validation.",
    },
    {
      icon: Globe,
      title: "Language Auto-Detection",
      description:
        "Automatic language switching between English (en-IN) and Hindi (hi-IN) based on browser settings, with manual toggle for seamless multilingual experience.",
    },
  ];

  const technologies = [
    { name: "Next.js 14.2", category: "Frontend Framework" },
    { name: "Flask", category: "Backend API" },
    { name: "FastAPI", category: "Voice Server" },
    { name: "PyTorch", category: "Deep Learning" },
    { name: "Sarvam AI", category: "STT/TTS (10+ languages)" },
    { name: "Gemini 2.5", category: "LLM (FREE)" },
    { name: "PyMuPDF", category: "PDF Processing" },
    { name: "python-docx", category: "Document Parser" },
    { name: "OpenCV", category: "Video Processing" },
    { name: "Framer Motion", category: "UI Animations" },
    { name: "WebRTC", category: "Voice Communication" },
    { name: "Redis", category: "Session Management" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
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
              Back to Detector
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold gradient-text mb-4">
              About AI Content Detector
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive AI detection platform with multilingual voice
              assistant analyzing text, images, videos, and documents using
              cutting-edge machine learning and natural language processing
              across 10+ Indian languages.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-2xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In an era where AI-generated content is becoming increasingly
              sophisticated, our mission is to provide transparent, accurate,
              and accessible tools for content verification. We believe in
              empowering users with the ability to distinguish between
              human-created and AI-generated content, fostering trust and
              authenticity in digital media.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With 88.5% detection accuracy across 4 content types and support
              for 10+ Indian languages through our voice assistant, we're making
              AI detection accessible to diverse communities. Our platform
              combines cutting-edge technology (Sarvam AI, Google Gemini,
              PyMuPDF) with user-friendly design to serve educational
              institutions, content creators, journalists, and anyone concerned
              about content authenticity.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="glass-effect rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Technology Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-effect rounded-2xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 text-center"
                >
                  <p className="font-semibold text-gray-900">{tech.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{tech.category}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-effect rounded-2xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Upload Content
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choose from 4 detection modes: Text (paste or type), Image
                    (drag-drop), Video (upload MP4/AVI/MOV), or Document
                    (PDF/DOCX/TXT up to 10MB).
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    AI Analysis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Our models analyze patterns (perplexity, burstiness,
                    artifacts) using NLP, computer vision, and temporal
                    analysis. Documents get page-by-page breakdown.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Get Results & Ask Questions
                  </h3>
                  <p className="text-gray-600 text-sm">
                    View AI vs Human probability scores with animated
                    visualizations. Use the floating chat widget to ask our
                    voice assistant "Why is this AI?" in English or Hindi!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-500 text-sm"
          >
            <p className="mb-2">
              <strong className="text-gray-700">
                AI Content Detector v2.0
              </strong>{" "}
              - Built with passion for transparency and authenticity in digital
              content.
            </p>
            <p className="mb-4 text-xs">
              Achieved 88.5% accuracy • 4 content types • 10+ languages •
              Real-time voice assistant
            </p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary-600 transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
              <a
                href="mailto:contact@example.com"
                className="flex items-center gap-2 hover:text-primary-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
