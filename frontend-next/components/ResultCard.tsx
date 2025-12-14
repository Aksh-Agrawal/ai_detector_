"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

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
  const aiPercentage = (aiScore * 100).toFixed(1);
  const humanPercentage = (humanScore * 100).toFixed(1);
  const isAI = aiScore > humanScore;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-effect rounded-2xl p-6 space-y-6"
    >
      {/* Main Result */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
            isAI
              ? "bg-gradient-to-r from-orange-100 to-red-100"
              : "bg-gradient-to-r from-green-100 to-emerald-100"
          }`}
        >
          {isAI ? (
            <AiIcon className="w-6 h-6 text-orange-600" />
          ) : (
            <HumanIcon className="w-6 h-6 text-green-600" />
          )}
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
            <span className="font-semibold text-orange-600">
              {aiPercentage}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiPercentage}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="absolute h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
            />
          </div>
        </div>

        {/* Human Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HumanIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Human Created</span>
            </div>
            <span className="font-semibold text-green-600">
              {humanPercentage}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${humanPercentage}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="absolute h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Confidence Note */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          {isAI
            ? aiScore > 0.9
              ? "High confidence this content is AI-generated"
              : "Moderate confidence this content is AI-generated"
            : humanScore > 0.9
            ? "High confidence this content is human-created"
            : "Moderate confidence this content is human-created"}
        </p>
      </div>
    </motion.div>
  );
}
