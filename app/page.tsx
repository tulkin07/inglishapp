import Link from "next/link";
import plan from "@/data/30days.json";
import { ProgressBar } from "@/components/progress-bar";

type Day = (typeof plan)[number];

function getLocalProgress(totalDays: number) {
  if (typeof window === "undefined") {
    return { completedDays: 0, streak: 0, currentDay: 1 };
  }
  const raw = window.localStorage.getItem("speakingTrainer:completedDays");
  const completed = raw ? (JSON.parse(raw) as number[]) : [];
  const completedDays = completed.length;
  const currentDay =
    completedDays >= totalDays ? totalDays : Math.min(completedDays + 1, totalDays);

  const streakRaw = window.localStorage.getItem("speakingTrainer:streak");
  const streak = streakRaw ? Number.parseInt(streakRaw, 10) || 0 : 0;

  return { completedDays, streak, currentDay };
}

export default function Home() {
  const totalDays = plan.length;
  let summary: { completedDays: number; streak: number; currentDay: number } = {
    completedDays: 0,
    streak: 0,
    currentDay: 1,
  };

  if (typeof window !== "undefined") {
    summary = getLocalProgress(totalDays);
  }

  const currentDayData: Day | undefined = plan.find(
    (d) => d.day === summary.currentDay,
  );

  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      <section className="rounded-3xl border border-slate-800 bg-background/80 p-5 sm:p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Your 30 day journey
        </p>
        <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
          Train your speaking muscle every day.
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Follow the daily plan, shadow sentences, and get instant feedback on
          your pronunciation and fluency.
        </p>
        <div className="mt-4 space-y-4">
          <ProgressBar
            currentDay={summary.completedDays}
            totalDays={totalDays}
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-300">
            <span className="rounded-full border border-slate-300/70 bg-background px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
              Streak:{" "}
              <span className="font-semibold text-emerald-400">
                {summary.streak} days
              </span>
            </span>
            <span className="rounded-full border border-slate-300/70 bg-background px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
              Current focus:{" "}
              <span className="font-semibold text-sky-400">
                Day {currentDayData?.day}: {currentDayData?.title}
              </span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/practice/${summary.currentDay}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-emerald-400 active:scale-[0.97]"
            >
              Start today&apos;s practice
            </Link>
            <Link
              href="/practice/1"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-background px-5 text-xs font-medium text-slate-800 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            >
              View plan from day 1
            </Link>
            <Link
              href="/vocab"
              className="inline-flex h-11 items-center justify-center rounded-full border border-sky-300 bg-sky-50 px-5 text-xs font-medium text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900/60"
            >
              Mening so&apos;zlarim
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-background p-4 dark:border-slate-800 dark:bg-slate-950/70">
          <h3 className="text-sm font-semibold">
            Speaking modes
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Switch between shadowing, free speaking, questions, and storytelling
            depending on the day&apos;s focus.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-background p-4 dark:border-slate-800 dark:bg-slate-950/70">
          <h3 className="text-sm font-semibold">
            Easy memorization
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Repeat key sentences up to 10 times, track which ones you have
            mastered, and reuse them in new contexts.
          </p>
        </div>
      </section>
    </div>
  );
}
