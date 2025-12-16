"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Project Name */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-orange-500" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              AK's Detector
            </h1>
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
