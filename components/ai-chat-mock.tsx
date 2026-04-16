"use client";

import { useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const BASE_QUESTIONS: string[] = [
  "How was your day today?",
  "What is one thing you are proud of this week?",
  "What are your plans for tomorrow?",
  "What is one challenge you are facing now?",
  "How do you feel about your English progress?",
];

interface AIChatMockProps {
  dayTitle: string;
}

export function AIChatMock({ dayTitle }: AIChatMockProps) {
  const [index, setIndex] = useState(0);
  const { transcript, start, stop, listening } = useSpeechRecognition({
    lang: "en-US",
  });

  const question = BASE_QUESTIONS[index % BASE_QUESTIONS.length];

  return (
    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            AI speaking simulation
          </p>
          <p className="text-sm font-medium text-slate-50">
            Topic: <span className="text-emerald-400">{dayTitle}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIndex((prev) => prev + 1)}
          className="inline-flex h-8 items-center rounded-full border border-slate-700 bg-slate-900 px-3 text-[0.7rem] font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-800"
        >
          Next question
        </button>
      </div>
      <div className="mt-3 rounded-xl bg-slate-900/90 p-3 text-sm text-slate-100">
        <span className="text-emerald-400">AI: </span>
        {question}
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={listening ? stop : start}
            className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold text-slate-950 shadow-sm ${
              listening
                ? "bg-rose-400 hover:bg-rose-300"
                : "bg-emerald-500 hover:bg-emerald-400"
            } active:scale-[0.97]`}
          >
            {listening ? "Stop answering" : "Answer with your voice"}
          </button>
          <span className="text-[0.7rem] text-slate-500">
            Your answer is transcribed below.
          </span>
        </div>
        <div className="min-h-[3rem] rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-2 text-xs text-slate-300">
          {transcript || (
            <span className="text-slate-500">
              Your answer will appear here in text.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

