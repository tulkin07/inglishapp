interface ProgressBarProps {
  currentDay: number;
  totalDays: number;
}

export function ProgressBar({ currentDay, totalDays }: ProgressBarProps) {
  const clamped = Math.min(Math.max(currentDay, 0), totalDays);
  const percent = totalDays === 0 ? 0 : Math.round((clamped / totalDays) * 100);

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Day {currentDay} / {totalDays}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800/80">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

