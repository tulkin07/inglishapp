"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "speakingTrainer:theme";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial: Theme = saved ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-200 shadow-sm hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]"
      aria-label="Toggle dark mode"
    >
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[0.7rem]"
        aria-hidden="true"
      >
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="hidden sm:inline">
        {isDark ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}

