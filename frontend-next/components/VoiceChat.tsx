"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { VoiceChatMessage } from "@/hooks/useVoiceChat";

export interface VoiceChatProps {
  messages: VoiceChatMessage[];
  isConnected: boolean;
  isSpeaking: boolean;
  onSendMessage: (text: string) => void;
}

export default function VoiceChat({
  messages,
  isConnected,
  isSpeaking,
  onSendMessage,
}: VoiceChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input && input.value.trim()) {
      onSendMessage(input.value);
      input.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className={`
            w-3 h-3 rounded-full
            ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}
          `}
          />
          <span className="font-medium text-gray-700">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {isSpeaking && (
          <motion.div
            className="flex items-center gap-2 text-orange-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-medium">Speaking...</span>
          </motion.div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <VolumeX className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                max-w-[80%] px-4 py-2 rounded-lg
                ${
                  message.type === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }
              `}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isConnected ? "Type your message..." : "Connect first..."
            }
            disabled={!isConnected}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: You can also use voice input by clicking the microphone button
        </p>
      </form>
    </div>
  );
}
