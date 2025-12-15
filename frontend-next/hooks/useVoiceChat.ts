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
  currentLanguage: string;
  startSession: (language?: string, voice?: string) => Promise<void>;
  endSession: () => Promise<void>;
  sendTextMessage: (text: string, context?: any) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  setDetectionResults: (results: any) => Promise<void>;
  toggleLanguage: () => void;
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
  const [currentLanguage, setCurrentLanguage] = useState<string>("en-IN");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    async (language?: string, voice: string = "meera") => {
      try {
        // Auto-detect language from browser if not specified
        let detectedLanguage = language;
        if (!detectedLanguage) {
          const browserLang = navigator.language.toLowerCase();
          if (browserLang.includes("hi")) {
            detectedLanguage = "hi-IN";
          } else {
            detectedLanguage = "en-IN";
          }
        }
        setCurrentLanguage(detectedLanguage);
        console.log(
          `Starting voice session with language: ${detectedLanguage}`
        );

        // Create session on server
        const response = await fetch(
          "http://localhost:8001/api/voice/session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language: detectedLanguage,
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

        // Try Sarvam AI TTS first (if available), fallback to browser TTS
        let usedSarvam = false;

        if (data.text && typeof window !== "undefined") {
          // Try to get Sarvam AI TTS audio
          try {
            console.log("Attempting Sarvam AI TTS...");
            const ttsResponse = await fetch(
              "http://localhost:8001/api/voice/tts",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: data.text,
                  language: "en-IN",
                  voice: "anushka", // Sarvam AI female voice
                }),
              }
            );

            if (ttsResponse.ok) {
              const ttsData = await ttsResponse.json();
              console.log("Sarvam TTS response:", {
                hasAudio: !!ttsData.audio,
                audioLength: ttsData.audio?.length,
              });

              if (ttsData.audio && ttsData.audio.length > 0) {
                setIsSpeaking(true);
                usedSarvam = true;

                // Convert base64 to audio and play
                const audioBlob = base64ToBlob(ttsData.audio, "audio/wav");
                const audioUrl = URL.createObjectURL(audioBlob);

                if (!audioRef.current) {
                  audioRef.current = new Audio();
                }

                audioRef.current.src = audioUrl;
                audioRef.current.onended = () => {
                  setIsSpeaking(false);
                  URL.revokeObjectURL(audioUrl);
                };

                audioRef.current.onerror = (e) => {
                  console.error("Audio playback error:", e);
                  setIsSpeaking(false);
                  URL.revokeObjectURL(audioUrl);
                };

                await audioRef.current.play();
                assistantMessage.audio = audioUrl;
                console.log("✅ Using Sarvam AI voice");
              }
            } else {
              const errorText = await ttsResponse.text();
              console.error(
                "Sarvam TTS failed:",
                ttsResponse.status,
                errorText
              );
            }
          } catch (error) {
            console.error("Sarvam TTS error:", error);
          }
        }

        // Fallback: Use browser text-to-speech if Sarvam not available
        if (!usedSarvam && data.text && typeof window !== "undefined") {
          console.log("⚠️ Falling back to browser speech synthesis");
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
            console.log("Using browser speech synthesis");
          } else {
            console.warn("Speech synthesis not supported in this browser");
            setIsSpeaking(false);
          }
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

  // Start listening (voice input with Sarvam AI STT support)
  const startListening = useCallback(async () => {
    if (!sessionId || !isConnected) {
      console.error("Cannot start listening: not connected");
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create MediaRecorder to capture audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log(`Total chunks: ${audioChunksRef.current.length}`);

        // Combine audio chunks
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        console.log(`Audio blob size: ${audioBlob.size} bytes`);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1] || "";
          console.log(`Base64 audio length: ${base64Audio.length}`);

          try {
            // Try Sarvam AI STT first (supports Hindi and other Indian languages)
            console.log("📤 Sending audio to Sarvam AI STT...");
            const sttResponse = await fetch(
              "http://localhost:8001/api/voice/stt",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  session_id: sessionId,
                  audio: base64Audio,
                  language: currentLanguage, // Auto-detected: en-IN or hi-IN
                }),
              }
            );

            if (sttResponse.ok) {
              const sttData = await sttResponse.json();
              const transcript = sttData.text || "";
              console.log("✅ Sarvam STT transcribed:", transcript);

              if (transcript) {
                sendTextMessage(transcript);
              } else {
                console.warn("Empty transcript received");
              }
            } else {
              const errorText = await sttResponse.text();
              console.error(
                "❌ Sarvam STT failed:",
                sttResponse.status,
                errorText
              );

              // Fallback to browser speech recognition
              console.log("⚠️ Falling back to browser speech recognition");
              useBrowserSpeechRecognition();
            }
          } catch (error) {
            console.error("STT error:", error);
            // Fallback to browser speech recognition
            useBrowserSpeechRecognition();
          }
        };

        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsListening(true);
      console.log("🎤 Recording started - click mic button again to stop...");

      // Auto-stop after 30 seconds as safety measure
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          console.log("⏱️ Auto-stopping recording after 30 seconds");
          mediaRecorderRef.current.stop();
          setIsListening(false);
        }
      }, 30000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (onError) {
        onError(error as Error);
      }

      // Fallback to browser speech recognition if mic access fails
      console.log("⚠️ Mic access failed, using browser speech recognition");
      useBrowserSpeechRecognition();
    }
  }, [sessionId, isConnected, sendTextMessage, onError]);

  // Browser speech recognition fallback
  const useBrowserSpeechRecognition = useCallback(() => {
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
      recognition.lang = currentLanguage; // Use current language (en-IN or hi-IN)

      recognition.onstart = () => {
        console.log(
          `🎤 Browser voice recognition started (${currentLanguage})`
        );
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
  }, [sendTextMessage, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    // Stop MediaRecorder if active
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      console.log("🛑 Recording stopped");
    }

    // Stop browser speech recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
    console.log("Stopped listening");
  }, []);

  // Toggle language between English and Hindi
  const toggleLanguage = useCallback(() => {
    const newLanguage = currentLanguage === "hi-IN" ? "en-IN" : "hi-IN";
    setCurrentLanguage(newLanguage);
    console.log(`Language toggled to: ${newLanguage}`);
  }, [currentLanguage]);

  return {
    sessionId,
    messages,
    isConnected,
    isListening,
    isSpeaking,
    currentLanguage,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
    setDetectionResults,
    toggleLanguage,
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
