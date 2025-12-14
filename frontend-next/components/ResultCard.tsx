"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ResultCardProps {
  aiScore: number;
  humanScore: number;
  aiIcon: LucideIcon;
  humanIcon: LucideIcon;
}

export default function ResultCard({
  aiScore,
  humanScore,
  aiIcon: AiIcon,
  humanIcon: HumanIcon,
}: ResultCardProps) {
  const [displayAI, setDisplayAI] = useState(0);
  const [displayHuman, setDisplayHuman] = useState(0);

  const aiPercentage = aiScore * 100;
  const humanPercentage = humanScore * 100;
  const isAI = aiScore > humanScore;

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
              <AiIcon className="w-6 h-6 text-orange-600" />
            ) : (
              <HumanIcon className="w-6 h-6 text-green-600" />
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
              <AiIcon className="w-5 h-5 text-orange-600" />
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
              <HumanIcon className="w-5 h-5 text-green-600" />
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
            ? aiScore > 0.9
              ? "🎯 High confidence this content is AI-generated"
              : "⚠️ Moderate confidence this content is AI-generated"
            : humanScore > 0.9
            ? "✅ High confidence this content is human-created"
            : "⚠️ Moderate confidence this content is human-created"}
        </p>
      </motion.div>
    </motion.div>
  );
}
