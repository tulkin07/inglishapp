"use client";

import { useEffect, useState } from "react";

const COMPLETED_KEY = "speakingTrainer:completedDays";
const LAST_PRACTICE_DATE_KEY = "speakingTrainer:lastPracticeDate";
const REMINDER_SENT_KEY = "speakingTrainer:reminderSentDate";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

function isTodayCompleted(): boolean {
  if (typeof window === "undefined") return false;
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastPractice = window.localStorage.getItem(LAST_PRACTICE_DATE_KEY);

  if (lastPractice === todayStr) {
    // User practiced at least once today
    return true;
  }

  // Fallback: if any day completed today via completedDays, we still use lastPracticeDate
  const rawCompleted = window.localStorage.getItem(COMPLETED_KEY);
  if (!rawCompleted) return false;
  try {
    const days = JSON.parse(rawCompleted) as number[];
    return Array.isArray(days) && days.length > 0 && lastPractice === todayStr;
  } catch {
    return false;
  }
}

function scheduleForNinePM(callback: () => void) {
  const now = new Date();
  const target = new Date();
  target.setHours(21, 0, 0, 0);

  if (target.getTime() <= now.getTime()) {
    // 21:00 already passed today – schedule for tomorrow
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();
  return window.setTimeout(callback, delay);
}

export function DailyReminder() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
    const stored = window.localStorage.getItem("speakingTrainer:remindersEnabled");
    setEnabled(stored === "true");
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted") return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const maybeNotify = () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const reminderSentFor = window.localStorage.getItem(REMINDER_SENT_KEY);
      if (reminderSentFor === todayStr) {
        // Already reminded today
        scheduleForNinePM(maybeNotify);
        return;
      }

      if (!isTodayCompleted()) {
        // Show notification
        try {
          new Notification("Speaking Trainer", {
            body: "You haven’t completed today’s speaking practice yet. Take 5 minutes now.",
            tag: "speaking-trainer-daily",
          });
          window.localStorage.setItem(REMINDER_SENT_KEY, todayStr);
        } catch {
          // ignore
        }
      }

      // Schedule next reminder check (tomorrow 21:00)
      scheduleForNinePM(maybeNotify);
    };

    // If it's already after 21:00 today and incomplete, fire once quickly
    const now = new Date();
    const afterNine =
      now.getHours() > 21 || (now.getHours() === 21 && now.getMinutes() >= 0);
    if (afterNine && !isTodayCompleted()) {
      maybeNotify();
    } else {
      scheduleForNinePM(maybeNotify);
    }
  }, [enabled, permission]);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      if (result === "granted") {
        setEnabled(true);
        window.localStorage.setItem("speakingTrainer:remindersEnabled", "true");
      }
    } catch {
      setPermission("denied");
    }
  };

  if (permission === "unsupported") {
    return null;
  }

  if (!enabled || permission !== "granted") {
    return (
      <button
        type="button"
        onClick={requestPermission}
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.97]"
      >
        Enable 21:00 reminder
      </button>
    );
  }

  return null;
}

