"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import plan from "@/data/30days.json";
import { SentenceCard } from "@/components/sentence-card";
import { SpeakingTimer } from "@/components/timer";
import { AIChatMock } from "@/components/ai-chat-mock";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

type PracticeType = "shadowing" | "speaking" | "questions" | "story";

interface DayPlan {
  day: number;
  title: string;
  sentences: string[];
  speakingTask: string;
  practiceType: PracticeType;
}

const TOTAL_DAYS = plan.length;

function getDayFromParams(params: { day?: string }): number {
  const raw = params.day;
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1 || n > TOTAL_DAYS) return 1;
  return n;
}

export default function PracticePage() {
  const params = useParams<{ day?: string }>();
  const router = useRouter();
  const [recognizedText, setRecognizedText] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [memorizedSentences, setMemorizedSentences] = useState<number>(0);

  const dayNumber = getDayFromParams(params ?? {});

  const dayPlan = useMemo<DayPlan | undefined>(
    () => plan.find((d) => d.day === dayNumber) as DayPlan | undefined,
    [dayNumber],
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    transcript,
    start,
    stop,
    listening,
    status,
    error: speechError,
  } = useSpeechRecognition({
    lang: "en-US",
  });

  useEffect(() => {
    setRecognizedText(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!hasMounted || !dayPlan) return;
    const key = "speakingTrainer:completedDays";
    const raw = window.localStorage.getItem(key);
    const completed = raw ? ((JSON.parse(raw) as number[]) ?? []) : [];
    if (!completed.includes(dayPlan.day)) {
      const updated = [...completed, dayPlan.day].sort((a, b) => a - b);
      window.localStorage.setItem(key, JSON.stringify(updated));
    }

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const lastDateKey = "speakingTrainer:lastPracticeDate";
    const streakKey = "speakingTrainer:streak";

    const lastDate = window.localStorage.getItem(lastDateKey);
    const prevStreakRaw = window.localStorage.getItem(streakKey);
    const prevStreak = prevStreakRaw
      ? Number.parseInt(prevStreakRaw, 10) || 0
      : 0;

    let nextStreak = 1;
    if (lastDate === todayStr) {
      nextStreak = prevStreak || 1;
    } else if (lastDate) {
      const prev = new Date(lastDate);
      const diffMs = today.getTime() - prev.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        nextStreak = prevStreak + 1;
      }
    }

    window.localStorage.setItem(lastDateKey, todayStr);
    window.localStorage.setItem(streakKey, String(nextStreak));
  }, [dayPlan, hasMounted]);

  if (!dayPlan) return notFound();

  const practiceLabelMap: Record<PracticeType, string> = {
    shadowing: "Shadowing",
    speaking: "Free speaking",
    questions: "Questions & answers",
    story: "Storytelling",
  };

  const goPrev = () => {
    const prev = Math.max(1, dayPlan.day - 1);
    router.push(`/practice/${prev}`);
  };

  const goNext = () => {
    const next = Math.min(TOTAL_DAYS, dayPlan.day + 1);
    router.push(`/practice/${next}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Day {dayPlan.day} / {TOTAL_DAYS}
          </p>
          <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
            {dayPlan.title}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Mode:{" "}
            <span className="font-medium text-emerald-400">
              {practiceLabelMap[dayPlan.practiceType]}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-9 items-center rounded-full border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-800"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-950 hover:bg-white active:scale-[0.97]"
          >
            Next
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-300">{dayPlan.speakingTask}</p>

      <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={listening ? stop : start}
            className={`inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold text-slate-950 shadow-sm ${
              listening
                ? "bg-rose-400 hover:bg-rose-300"
                : "bg-emerald-500 hover:bg-emerald-400"
            } active:scale-[0.97]`}
          >
            {listening ? "Stop speaking" : "Start speaking"}
          </button>
          <span className="text-[0.7rem] text-slate-400">
            Your speech will be converted to text and compared to today&apos;s
            sentences.
          </span>
        </div>
        <div className="mt-3 min-h-[3.5rem] rounded-xl border border-dashed border-slate-700 bg-slate-900/70 p-2 text-xs text-slate-200">
          {recognizedText || (
            <span className="text-slate-500">
              Speak and your recognized text will appear here.
            </span>
          )}
        </div>
        {status === "unsupported" && (
          <p className="mt-2 text-[0.7rem] text-amber-400">
            Speech recognition is not supported in this browser. Try Chrome or
            Edge on desktop or Android.
          </p>
        )}
        {speechError && (
          <p className="mt-2 text-[0.7rem] text-rose-400">{speechError}</p>
        )}
      </div>

      <div className="mt-2 space-y-3">
        {dayPlan.sentences.map((sentence, index) => (
          <SentenceCard
            key={`${dayPlan.day}-${index}`}
            day={dayPlan.day}
            index={index}
            sentence={sentence}
            recognizedText={recognizedText}
            onMemorizationChange={(count) => {
              setMemorizedSentences((prev) =>
                count >= 10 ? prev + 1 : prev,
              );
            }}
          />
        ))}
      </div>

      <SpeakingTimer />

      <AIChatMock dayTitle={dayPlan.title} />

      <p className="mt-2 text-[0.7rem] text-slate-500">
        Learned sentences today:{" "}
        <span className="font-semibold text-emerald-400">
          {memorizedSentences} / {dayPlan.sentences.length}
        </span>
      </p>
    </div>
  );
}

