"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

export interface VoiceButtonProps {
  isListening: boolean;
  isConnected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function VoiceButton({
  isListening,
  isConnected,
  onClick,
  disabled = false,
}: VoiceButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || !isConnected}
      className={`
        relative flex items-center justify-center
        w-16 h-16 rounded-full
        transition-all duration-300
        ${
          isListening
            ? "bg-orange-500 shadow-lg shadow-orange-500/50"
            : "bg-gray-700 hover:bg-gray-600"
        }
        ${
          !isConnected || disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }
      `}
      whileHover={isConnected && !disabled ? { scale: 1.1 } : {}}
      whileTap={isConnected && !disabled ? { scale: 0.95 } : {}}
      animate={
        isListening
          ? {
              boxShadow: [
                "0 0 0 0 rgba(249, 115, 22, 0.7)",
                "0 0 0 20px rgba(249, 115, 22, 0)",
              ],
            }
          : {}
      }
      transition={{
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {/* Animated pulse ring when listening */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500"
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {isListening ? (
          <Mic className="w-7 h-7 text-white" />
        ) : (
          <MicOff className="w-7 h-7 text-white" />
        )}
      </div>

      {/* Connection indicator */}
      <div
        className={`
        absolute top-0 right-0
        w-3 h-3 rounded-full
        ${isConnected ? "bg-green-500" : "bg-red-500"}
      `}
      />
    </motion.button>
  );
}
