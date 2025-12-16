"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Key,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface APIKeyStatus {
  gemini: {
    configured: boolean;
    required_for: string;
    get_key_url: string;
    instructions: string;
  };
  sarvam: {
    configured: boolean;
    required_for: string;
    get_key_url: string;
    instructions: string;
  };
  fallback_mode: {
    gemini?: string;
    sarvam?: string;
  };
}

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysConfigured?: () => void;
}

export default function APIKeyModal({
  isOpen,
  onClose,
  onKeysConfigured,
}: APIKeyModalProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [sarvamKey, setSarvamKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<APIKeyStatus | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch API key status
  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch(
        "http://localhost:8001/api/voice/api-keys/status"
      );
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch API key status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!geminiKey && !sarvamKey) {
      setError("Please provide at least one API key");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8001/api/voice/api-keys/configure",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gemini_api_key: geminiKey || undefined,
            sarvam_api_key: sarvamKey || undefined,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `Successfully configured: ${result.updated.join(
            ", "
          )}. You can now use voice features!`
        );
        setGeminiKey("");
        setSarvamKey("");

        // Refresh status
        await fetchStatus();

        // Notify parent
        if (onKeysConfigured) {
          setTimeout(() => {
            onKeysConfigured();
          }, 2000);
        }
      } else if (result.errors && result.errors.length > 0) {
        setError(
          `Errors: ${result.errors
            .map((e: any) => `${e.service}: ${e.error}`)
            .join(", ")}`
        );
      }
    } catch (err) {
      setError("Failed to configure API keys. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Key className="w-7 h-7" />
                  Configure API Keys
                </h2>
                <p className="text-orange-100 mt-1 text-sm">
                  Free API keys for enhanced voice features
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {statusLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                {/* Current Status */}
                {status && (
                  <div className="mb-6 space-y-3">
                    <h3 className="font-semibold text-gray-800">
                      Current Status:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <StatusCard
                        name="Gemini AI"
                        configured={status.gemini.configured}
                        fallback={status.fallback_mode.gemini}
                      />
                      <StatusCard
                        name="Sarvam AI"
                        configured={status.sarvam.configured}
                        fallback={status.fallback_mode.sarvam}
                      />
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Gemini Section */}
                  {status && !status.gemini.configured && (
                    <APIKeySection
                      title="Gemini API Key (Google AI)"
                      description={status.gemini.required_for}
                      instructions={status.gemini.instructions}
                      getKeyUrl={status.gemini.get_key_url}
                      value={geminiKey}
                      onChange={setGeminiKey}
                      placeholder="AIza..."
                      icon="🤖"
                    />
                  )}

                  {/* Sarvam Section */}
                  {status && !status.sarvam.configured && (
                    <APIKeySection
                      title="Sarvam AI API Key"
                      description={status.sarvam.required_for}
                      instructions={status.sarvam.instructions}
                      getKeyUrl={status.sarvam.get_key_url}
                      value={sarvamKey}
                      onChange={setSarvamKey}
                      placeholder="sarvam_..."
                      icon="🎙️"
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    >
                      {status?.gemini.configured && status?.sarvam.configured
                        ? "Close"
                        : "Skip for Now"}
                    </button>
                    {(!status?.gemini.configured ||
                      !status?.sarvam.configured) && (
                      <button
                        type="submit"
                        disabled={loading || (!geminiKey && !sarvamKey)}
                        className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Configuring...
                          </>
                        ) : (
                          "Save API Keys"
                        )}
                      </button>
                    )}
                  </div>
                </form>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your API keys are stored temporarily
                    in memory and are never saved permanently. You'll need to
                    re-enter them if you restart the server.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Status Card Component
function StatusCard({
  name,
  configured,
  fallback,
}: {
  name: string;
  configured: boolean;
  fallback?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg border-2 ${
        configured
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {configured ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        )}
        <span className="font-medium text-gray-800">{name}</span>
      </div>
      <p className="text-sm text-gray-600">
        {configured ? "✓ Configured" : fallback || "Not configured"}
      </p>
    </div>
  );
}

// API Key Section Component
function APIKeySection({
  title,
  description,
  instructions,
  getKeyUrl,
  value,
  onChange,
  placeholder,
  icon,
}: {
  title: string;
  description: string;
  instructions: string;
  getKeyUrl: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: string;
}) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <a
          href={getKeyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          Get Key
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="mb-3 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-line">
        {instructions}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );
}
