"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Brain,
  Shield,
  Zap,
  Target,
  Github,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mic,
} from "lucide-react";

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Generate particles once to prevent re-rendering on hover
  const particles = useMemo(() => {
    const colors = [
      "bg-orange-400",
      "bg-green-400",
      "bg-blue-400",
      "bg-purple-400",
    ];
    const sizes = ["w-3 h-3", "w-4 h-4", "w-2 h-2"];

    return [...Array(30)].map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: sizes[i % sizes.length],
      x1: Math.random() * 1200,
      x2: Math.random() * 1200,
      y1: Math.random() * 800,
      y2: Math.random() * 800,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 8 + Math.random() * 15,
    }));
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description:
        "Powered by state-of-the-art machine learning models including transformer-based text analysis and vision transformers for image/video detection.",
      color: "#f97316",
      bgColor: "#fff7ed",
    },
    {
      icon: Shield,
      title: "Accurate Detection",
      description:
        "High-precision algorithms trained on extensive datasets to distinguish between AI-generated and human-created content.",
      color: "#22c55e",
      bgColor: "#f0fdf4",
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description:
        "Get instant results with our optimized processing pipeline. Analyze text, images, and videos in seconds.",
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      icon: Target,
      title: "Multi-format Support",
      description:
        "Comprehensive detection across multiple content types - text documents, images (PNG, JPG, etc.), and video files.",
      color: "#a855f7",
      bgColor: "#faf5ff",
    },
    {
      icon: Mic,
      title: "Voice Assistant",
      description:
        "Interactive multilingual voice assistant to explain detection results, guide you through features, and answer questions in 10+ languages.",
      color: "#ec4899",
      bgColor: "#fdf2f8",
    },
  ];

  const technologies = [
    { name: "Next.js 14.2", category: "Frontend Framework", color: "#000000" },
    { name: "Flask", category: "Backend API", color: "#f97316" },
    { name: "FastAPI", category: "Voice Server", color: "#009688" },
    { name: "PyTorch", category: "Deep Learning", color: "#ef4444" },
    {
      name: "Sarvam AI",
      category: "STT/TTS (10+ languages)",
      color: "#ec4899",
    },
    {name: "Hugging Face", category: "Model Hub", color: "#ff6ac1" },
    {name: "sklearn", category: "ML Algorithms", color: "#f59e0b" },
    { name: "Gemini 2.5", category: "LLM (FREE)", color: "#8b5cf6" },
    { name: "PyMuPDF", category: "PDF Processing", color: "#eab308" },
    { name: "python-docx", category: "Document Parser", color: "#06b6d4" },
    { name: "OpenCV", category: "Video Processing", color: "#22c55e" },
    { name: "Framer Motion", category: "UI Animations", color: "#3b82f6" },
    { name: "WebRTC", category: "Voice Communication", color: "#f97316" },
    { name: "Redis", category: "Session Management", color: "#dc2626" },
  ];

  const stats = [
    { value: "99%", label: "Accuracy", icon: CheckCircle2 },
    { value: "<1s", label: "Response Time", icon: Zap },
    { value: "4", label: "Detection Types", icon: Target },
  ];

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute ${particle.color} ${particle.size} rounded-full`}
            animate={{
              x: [particle.x1, particle.x2],
              y: [particle.y1, particle.y2],
              scale: [1, 2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Sparkles className="w-16 h-16 text-orange-500 mx-auto" />
          </motion.div>

          <motion.h1
            className="text-6xl font-bold mb-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <span className="bg-clip-text text-transparent bg-orange-600">
              AI Content
            </span>{" "}
            <span className="text-gray-900">Detector</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            A powerful tool designed to identify AI-generated content across
            text, images, and videos using cutting-edge machine learning
            technology.
          </motion.p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <Icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/detector"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:shadow-xl transition-all"
              >
                Start Detecting
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/voice"
                className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 hover:shadow-xl transition-all"
              >
                <Mic className="w-5 h-5" />
                Voice Assistant
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-2xl p-8 mb-12 border-l-4 border-orange-500"
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredFeature === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, type: "spring" }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="glass-effect rounded-xl p-6 cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: isHovered ? feature.bgColor : "white",
                  }}
                >
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl"
                    style={{ backgroundColor: feature.color }}
                    animate={{
                      scale: isHovered ? 1.5 : 0,
                      opacity: isHovered ? 0.1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="flex items-start gap-4 relative z-10">
                    <motion.div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: feature.color }}
                      animate={{
                        rotate: isHovered ? 360 : 0,
                        scale: isHovered ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotate: -10 }}
                whileInView={{ opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 },
                }}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-orange-300 transition-colors"
                style={{
                  borderColor:
                    hoveredFeature === index + 10 ? tech.color : undefined,
                }}
                onHoverStart={() => setHoveredFeature(index + 10)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <motion.div
                  animate={{
                    scale: hoveredFeature === index + 10 ? 1.2 : 1,
                  }}
                  className="inline-block mb-2"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto"
                    style={{ backgroundColor: tech.color }}
                  />
                </motion.div>
                <p className="font-semibold text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-500 mt-1">{tech.category}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Upload Content",
                desc: "Provide text, upload an image, or submit a video file for analysis.",
                color: "#f97316",
              },
              {
                step: 2,
                title: "AI Analysis",
                desc: "Our models process the content using advanced neural networks trained to detect AI patterns.",
                color: "#3b82f6",
              },
              {
                step: 3,
                title: "Get Results",
                desc: "Receive a confidence score indicating the likelihood of AI generation vs human creation.",
                color: "#22c55e",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 10, backgroundColor: "#f9fafb" }}
                className="flex gap-4 p-4 rounded-xl transition-all cursor-pointer"
              >
                <motion.div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: item.color }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.step}
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-500 text-sm"
        >
          <p className="mb-4">
            Built with passion for transparency and authenticity in digital
            content.
          </p>
          <div className="flex items-center justify-center gap-6">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-orange-600 transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
              GitHub
            </motion.a>
            <motion.a
              href="mailto:contact@example.com"
              className="flex items-center gap-2 hover:text-orange-600 transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-5 h-5" />
              Contact
            </motion.a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
