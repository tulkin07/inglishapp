"use client";

import { useEffect, useState } from "react";
import { diffSentence, TokenDiff } from "@/utils/speech";
import { useTTS } from "@/hooks/useTTS";

interface SentenceCardProps {
  day: number;
  index: number;
  sentence: string;
  recognizedText: string;
  onMemorizationChange?: (count: number) => void;
}

const MEMO_KEY_PREFIX = "speakingTrainer:memorization";

export function SentenceCard({
  day,
  index,
  sentence,
  recognizedText,
  onMemorizationChange,
}: SentenceCardProps) {
  const storageKey = `${MEMO_KEY_PREFIX}:${day}:${index}`;
  const [repeatCount, setRepeatCount] = useState(0);
  const [expectedTokens, setExpectedTokens] = useState<TokenDiff[]>([]);
  const [extraTokens, setExtraTokens] = useState<TokenDiff[]>([]);
  const { speak } = useTTS();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      setRepeatCount(parsed);
      // Notify parent once on mount for persisted value
      onMemorizationChange?.(parsed);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!recognizedText) {
      setExpectedTokens([]);
      setExtraTokens([]);
      return;
    }
    const diff = diffSentence(sentence, recognizedText);
    setExpectedTokens(diff.expectedTokens);
    setExtraTokens(diff.extraTokens);
  }, [sentence, recognizedText]);

  const handleRepeat = () => {
    setRepeatCount((prev) => {
      const next = Math.min(prev + 1, 10);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, String(next));
      }
      onMemorizationChange?.(next);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-slate-50">{sentence}</p>
          {expectedTokens.length > 0 && (
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {expectedTokens.map((t, i) => (
                <span
                  key={`${t.word}-${i}`}
                  className={
                    t.status === "correct"
                      ? "text-emerald-400"
                      : "text-rose-400 underline decoration-rose-500/50"
                  }
                >
                  {t.word}{" "}
                </span>
              ))}
            </p>
          )}
          {extraTokens.length > 0 && (
            <p className="mt-1 text-[0.7rem] text-amber-400">
              Extra words:{" "}
              {extraTokens.map((t, i) => (
                <span key={`${t.word}-${i}`} className="mr-1">
                  {t.word}
                </span>
              ))}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => speak(sentence)}
          className="inline-flex h-9 items-center rounded-full bg-slate-800 px-3 text-xs font-medium text-slate-100 hover:bg-slate-700 active:scale-[0.97]"
        >
          Play
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRepeat}
            className="inline-flex h-7 items-center rounded-full bg-emerald-500/90 px-3 text-[0.7rem] font-semibold text-emerald-950 hover:bg-emerald-400 active:scale-[0.97]"
          >
            Repeat shadowing
          </button>
          <span className="text-[0.7rem]">
            {repeatCount} / 10 repetitions
          </span>
        </div>
        <span className="text-[0.7rem] text-slate-500">
          Aim for 10 clean repetitions.
        </span>
      </div>
    </div>
  );
}

