"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseWebRTCOptions {
  sessionId: string;
  onTrack?: (track: MediaStreamTrack) => void;
  onError?: (error: Error) => void;
}

export interface UseWebRTCReturn {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  startConnection: () => Promise<void>;
  stopConnection: () => void;
  sendAudio: (audioData: Blob) => void;
}

export function useWebRTC({
  sessionId,
  onTrack,
  onError,
}: UseWebRTCOptions): UseWebRTCReturn {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");

  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Initialize peer connection
  const initializePeerConnection = useCallback(async () => {
    try {
      // Create peer connection with Google STUN server (free)
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
        console.log("Connection state:", pc.connectionState);
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log("New ICE candidate:", event.candidate);

          // Send ICE candidate to server
          try {
            await fetch("http://localhost:8001/api/voice/webrtc/ice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionId,
                candidate: event.candidate,
              }),
            });
          } catch (error) {
            console.error("Error sending ICE candidate:", error);
          }
        }
      };

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        const stream = event.streams[0];
        setRemoteStream(stream);

        if (onTrack) {
          onTrack(event.track);
        }
      };

      pcRef.current = pc;
      setPeerConnection(pc);

      return pc;
    } catch (error) {
      console.error("Error initializing peer connection:", error);
      if (onError) onError(error as Error);
      throw error;
    }
  }, [sessionId, onTrack, onError]);

  // Start connection
  const startConnection = useCallback(async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setLocalStream(stream);
      console.log("Got local stream");

      // Initialize peer connection
      const pc = await initializePeerConnection();

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log("Added track:", track.kind);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Created offer, sending to server...");

      // Send offer to server and get answer
      const response = await fetch(
        "http://localhost:8001/api/voice/webrtc/offer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            offer: {
              type: offer.type,
              sdp: offer.sdp,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send offer");
      }

      const { answer } = await response.json();

      // Set remote description (answer)
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      console.log("WebRTC connection established");
    } catch (error) {
      console.error("Error starting connection:", error);
      if (onError) onError(error as Error);
    }
  }, [sessionId, initializePeerConnection, onError]);

  // Stop connection
  const stopConnection = useCallback(() => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
      setPeerConnection(null);
    }

    setRemoteStream(null);
    setConnectionState("closed");

    console.log("Connection stopped");
  }, [localStream]);

  // Send audio data
  const sendAudio = useCallback((audioData: Blob) => {
    // TODO: Implement audio data sending
    // This would typically involve data channels or server relay
    console.log("Sending audio data:", audioData.size, "bytes");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConnection();
    };
  }, [stopConnection]);

  return {
    peerConnection,
    localStream,
    remoteStream,
    connectionState,
    startConnection,
    stopConnection,
    sendAudio,
  };
}
