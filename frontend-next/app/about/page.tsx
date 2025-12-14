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
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description:
        "Powered by state-of-the-art machine learning models including transformer-based text analysis and vision transformers for image/video detection.",
    },
    {
      icon: Shield,
      title: "Accurate Detection",
      description:
        "High-precision algorithms trained on extensive datasets to distinguish between AI-generated and human-created content.",
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description:
        "Get instant results with our optimized processing pipeline. Analyze text, images, and videos in seconds.",
    },
    {
      icon: Target,
      title: "Multi-format Support",
      description:
        "Comprehensive detection across multiple content types - text documents, images (PNG, JPG, etc.), and video files.",
    },
  ];

  const technologies = [
    { name: "Next.js", category: "Frontend Framework" },
    { name: "Flask", category: "Backend API" },
    { name: "PyTorch", category: "Deep Learning" },
    { name: "Transformers", category: "AI Models" },
    { name: "Scikit-learn", category: "ML Pipeline" },
    { name: "OpenCV", category: "Video Processing" },
  ];

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
            A powerful tool designed to identify AI-generated content across
            text, images, and videos using cutting-edge machine learning
            technology.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            In an era where AI-generated content is becoming increasingly
            sophisticated, our mission is to provide transparent and reliable
            tools for content verification. We believe in empowering users with
            the ability to distinguish between human-created and AI-generated
            content, fostering trust and authenticity in digital media.
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
                  Provide text, upload an image, or submit a video file for
                  analysis.
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
                  Our models process the content using advanced neural networks
                  trained to detect AI patterns.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Get Results
                </h3>
                <p className="text-gray-600 text-sm">
                  Receive a confidence score indicating the likelihood of AI
                  generation vs human creation.
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
          <p className="mb-4">
            Built with passion for transparency and authenticity in digital
            content.
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
  );
}
