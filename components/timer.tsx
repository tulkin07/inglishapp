"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  minutesOptions?: number[];
}

export function SpeakingTimer({ minutesOptions = [1, 2, 3, 5] }: TimerProps) {
  const [duration, setDuration] = useState(minutesOptions[0] * 60);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, remaining]);

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Speaking timer
          </span>
          <span className="font-mono text-2xl font-semibold text-emerald-400">
            {minutes}:{seconds}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-full border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100"
            value={duration}
            onChange={(e) => {
              setRunning(false);
              setDuration(Number(e.target.value));
            }}
          >
            {minutesOptions.map((m) => (
              <option key={m} value={m * 60}>
                {m} min
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRunning((prev) => !prev)}
            className="inline-flex h-8 items-center rounded-full bg-emerald-500 px-3 text-xs font-semibold text-emerald-950 shadow-sm hover:bg-emerald-400 active:scale-[0.97]"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(duration);
            }}
            className="inline-flex h-8 items-center rounded-full border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="mt-2 text-[0.7rem] text-slate-500">
        Speak continuously until the timer ends. Focus on flow, not perfection.
      </p>
    </div>
  );
}

