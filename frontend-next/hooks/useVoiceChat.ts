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
  const recognitionRef = useRef<any>(null);

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
      // Stop any ongoing speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      // Stop listening if active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      // Stop WebRTC
      stopConnection();

      // Delete session on server
      await fetch(`http://localhost:8001/api/voice/session/${sessionId}`, {
        method: "DELETE",
      });

      setSessionId(null);
      setIsConnected(false);
      setMessages([]);
      setIsListening(false);
      setIsSpeaking(false);

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

        // Use browser text-to-speech to read the response aloud
        if (data.text && typeof window !== "undefined") {
          setIsSpeaking(true);

          // Check if browser supports speech synthesis
          if ("speechSynthesis" in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Create speech utterance
            const utterance = new SpeechSynthesisUtterance(data.text);
            utterance.lang = "en-US";
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Handle speech end
            utterance.onend = () => {
              setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
              console.error("Speech synthesis error:", event);
              setIsSpeaking(false);
            };

            // Speak the text
            window.speechSynthesis.speak(utterance);
          } else {
            console.warn("Speech synthesis not supported in this browser");
            setIsSpeaking(false);
          }
        }

        // Fallback: Play audio response if available from backend (currently not used)
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
    if (!sessionId || !isConnected) {
      console.error("Cannot start listening: not connected");
      return;
    }

    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      if (onError) {
        onError(
          new Error(
            "Voice input is not supported in your browser. Please use Chrome, Edge, or Safari."
          )
        );
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Voice recognition started");
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Recognized:", transcript);

        // Send the recognized text as a message
        if (transcript) {
          sendTextMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        if (event.error === "not-allowed") {
          if (onError) {
            onError(
              new Error(
                "Microphone access denied. Please allow microphone permissions in your browser."
              )
            );
          }
        }
      };

      recognition.onend = () => {
        console.log("Voice recognition ended");
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsListening(false);
      if (onError) onError(error as Error);
    }
  }, [sessionId, isConnected, sendTextMessage, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
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
