"use client";

import { useState, useCallback, useRef } from "react";
import { useWebRTC } from "./useWebRTC";

export interface VoiceChatMessage {
  id: string;
  type: "user" | "assistant";
  text: string;
  audio?: string;
  timestamp: Date;
}

export interface UseVoiceChatOptions {
  onMessage?: (message: VoiceChatMessage) => void;
  onError?: (error: Error) => void;
}

export interface UseVoiceChatReturn {
  sessionId: string | null;
  messages: VoiceChatMessage[];
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  startSession: (language?: string, voice?: string) => Promise<void>;
  endSession: () => Promise<void>;
  sendTextMessage: (text: string, context?: any) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  setDetectionResults: (results: any) => Promise<void>;
}

export function useVoiceChat({
  onMessage,
  onError,
}: UseVoiceChatOptions = {}): UseVoiceChatReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // WebRTC connection
  const { connectionState, startConnection, stopConnection } = useWebRTC({
    sessionId: sessionId || "",
    onTrack: (track) => {
      console.log("Received audio track:", track);
      // Handle incoming audio
    },
    onError: (error) => {
      console.error("WebRTC error:", error);
      if (onError) onError(error);
    },
  });

  // Start new session
  const startSession = useCallback(
    async (language: string = "en-IN", voice: string = "meera") => {
      try {
        console.log("Starting voice session...");

        // Create session on server
        const response = await fetch(
          "http://localhost:8001/api/voice/session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language,
              voice,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const data = await response.json();
        setSessionId(data.session_id);
        setIsConnected(true);

        console.log("Session created:", data.session_id);

        // Start WebRTC connection
        await startConnection();
      } catch (error) {
        console.error("Error starting session:", error);
        if (onError) onError(error as Error);
      }
    },
    [startConnection, onError]
  );

  // End session
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Stop WebRTC
      stopConnection();

      // Delete session on server
      await fetch(`http://localhost:8001/api/voice/session/${sessionId}`, {
        method: "DELETE",
      });

      setSessionId(null);
      setIsConnected(false);
      setMessages([]);

      console.log("Session ended");
    } catch (error) {
      console.error("Error ending session:", error);
      if (onError) onError(error as Error);
    }
  }, [sessionId, stopConnection, onError]);

  // Send text message
  const sendTextMessage = useCallback(
    async (text: string, context?: any) => {
      if (!sessionId) {
        console.warn("No active session");
        return;
      }

      try {
        // Add user message
        const userMessage: VoiceChatMessage = {
          id: Date.now().toString(),
          type: "user",
          text,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        if (onMessage) onMessage(userMessage);

        // Send to server
        const response = await fetch("http://localhost:8001/api/voice/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            text,
            context,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();

        // Add assistant text response
        const assistantMessage: VoiceChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          text: data.text || "No response received",
          timestamp: new Date(),
        };

        // Play audio response if available
        if (data.audio && data.audio.length > 0) {
          setIsSpeaking(true);

          // Convert base64 to audio and play
          const audioBlob = base64ToBlob(data.audio, "audio/wav");
          const audioUrl = URL.createObjectURL(audioBlob);

          if (!audioRef.current) {
            audioRef.current = new Audio();
          }

          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };

          await audioRef.current.play();
          assistantMessage.audio = audioUrl;
        }

        setMessages((prev) => [...prev, assistantMessage]);
        if (onMessage) onMessage(assistantMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        if (onError) onError(error as Error);
      }
    },
    [sessionId, onMessage, onError]
  );

  // Set detection results as context
  const setDetectionResults = useCallback(
    async (results: any) => {
      if (!sessionId) return;

      try {
        await fetch("http://localhost:8001/api/voice/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            detection_id: results.id || "unknown",
            ai_score: results.ai_score || 0,
            human_score: results.human_score || 0,
            features: results.features || {},
          }),
        });

        console.log("Detection results set");
      } catch (error) {
        console.error("Error setting detection results:", error);
        if (onError) onError(error as Error);
      }
    },
    [sessionId, onError]
  );

  // Start listening (voice input)
  const startListening = useCallback(() => {
    setIsListening(true);
    // TODO: Implement voice recognition
    console.log("Started listening");
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    // TODO: Stop voice recognition
    console.log("Stopped listening");
  }, []);

  return {
    sessionId,
    messages,
    isConnected,
    isListening,
    isSpeaking,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
    setDetectionResults,
  };
}

// Helper function
function base64ToBlob(base64: string, type: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}
