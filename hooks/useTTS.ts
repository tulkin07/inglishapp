"use client";

import { useCallback, useEffect, useState } from "react";

type TTSStatus = "idle" | "speaking" | "paused" | "unsupported";

export interface UseTTSResult {
  status: TTSStatus;
  speak: (text: string, lang?: string) => void;
  cancel: () => void;
}

export function useTTS(): UseTTSResult {
  const [status, setStatus] = useState<TTSStatus>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) {
      setStatus("unsupported");
    }
  }, []);

  const speak = useCallback((text: string, lang = "en-US") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  return { status, speak, cancel };
}

