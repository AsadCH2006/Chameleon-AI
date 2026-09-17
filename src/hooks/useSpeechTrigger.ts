"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseSpeechTriggerProps {
  triggerPhrase: string;
  isActive: boolean;
  onTriggerDetected: () => void;
}

export function useSpeechTrigger({
  triggerPhrase,
  isActive,
  onTriggerDetected,
}: UseSpeechTriggerProps) {
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListeningRef.current) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          if (transcript.includes(triggerPhrase.toLowerCase().trim())) {
            onTriggerDetected();
            break;
          }
        }
      };

      recognition.onerror = (event: any) => {
        isListeningRef.current = false;
        
        // Quietly handle routine browser timeouts without breaking execution
        if (event.error === "aborted" || event.error === "no-speech") return;

        // Handle network rate-limiting with delayed restart
        if (event.error === "network") {
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            if (isActive) startListening();
          }, 2000);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        if (isActive) {
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            if (isActive && !isListeningRef.current) {
              startListening();
            }
          }, 500);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      isListeningRef.current = false;
    }
  }, [triggerPhrase, isActive, onTriggerDetected]);

  useEffect(() => {
    if (isActive) {
      startListening();
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      isListeningRef.current = false;
    }

    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        isListeningRef.current = false;
      }
    };
  }, [isActive, startListening]);
}