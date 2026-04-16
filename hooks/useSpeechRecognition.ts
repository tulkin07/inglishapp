"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for browser speech recognition so TypeScript can compile
type BrowserSpeechRecognition = any;
type BrowserSpeechRecognitionEvent = any;
type BrowserSpeechRecognitionErrorEvent = any;

type Status = "idle" | "listening" | "unsupported" | "error";

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
}

export interface UseSpeechRecognitionResult {
  status: Status;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const { lang = "en-US", continuous = false } = options;
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setStatus("unsupported");
      return;
    }

    const recognition: BrowserSpeechRecognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setStatus("listening");
      setError(null);
    };

    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text.trim());
    };

    recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
      setStatus("error");
      setError(event.error || "Speech recognition error");
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang, continuous]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setTranscript("");
      recognitionRef.current.start();
    } catch {
      // ignore repeated starts
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setStatus("idle");
  }, []);

  return {
    status,
    listening: status === "listening",
    transcript,
    error,
    start,
    stop,
    reset,
  };
}

