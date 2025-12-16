"use client";

import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";

interface ProtectedFeatureProps {
  children: React.ReactNode;
  featureName: string;
}

export function ProtectedFeature({
  children,
  featureName,
}: ProtectedFeatureProps) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="glass-effect rounded-2xl p-12 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-2xl p-12 text-center border-2 border-orange-200"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6"
        >
          <Lock className="w-16 h-16 text-orange-500 mx-auto" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {featureName} Detection
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          This feature is available for authenticated users only. Sign in with
          your Google account to unlock {featureName.toLowerCase()} detection.
        </p>
        <SignInButton mode="modal">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-xl transition-all"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google to Continue
          </motion.button>
        </SignInButton>
        <p className="text-sm text-gray-500 mt-4">
          ✨ Free access to all detection features
        </p>
      </motion.div>
    );
  }

  return <>{children}</>;
}
