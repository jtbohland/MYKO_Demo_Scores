import { useMemo } from "react";

type Props = {
  seconds: number;
  label: string;
  totalSeconds: number;
};

export default function TimerDisplay({ seconds, label, totalSeconds }: Props) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${minutes}:${secs.toString().padStart(2, "0")}`;

  const colorClass = useMemo(() => {
    if (seconds <= 60) return "text-red-500";
    if (seconds <= 120) return "text-yellow-500";
    return "text-foreground";
  }, [seconds]);

  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;

  return (
    <div className="text-center space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`text-5xl font-mono font-bold tabular-nums transition-colors duration-500 ${colorClass}`}>
        {timeStr}
      </p>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
