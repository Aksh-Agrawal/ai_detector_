"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

export function LoginButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

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
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName || "User"}
              className="w-10 h-10 rounded-full border-2 border-green-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <span className="text-base font-medium text-gray-800">
            {displayName}
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              <SignOutButton>
                <button
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </SignOutButton>
            </motion.div>
          )}
        </AnimatePresence>
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
