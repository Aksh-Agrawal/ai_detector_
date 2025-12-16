"use client";

import { motion } from "framer-motion";
import { LogIn, LogOut, User } from "lucide-react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export function LoginButton() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="px-4 py-2 bg-gray-200 rounded-lg animate-pulse">
        Loading...
      </div>
    );
  }

  if (isSignedIn) {
    const displayName =
      user?.fullName?.split(" ")[0] ||
      user?.primaryEmailAddress?.emailAddress?.split("@")[0];

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
          <User className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {displayName}
          </span>
        </div>
        <SignOutButton>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
      >
        <LogIn className="w-5 h-5" />
        Sign in with Google
      </motion.button>
    </SignInButton>
  );
}
