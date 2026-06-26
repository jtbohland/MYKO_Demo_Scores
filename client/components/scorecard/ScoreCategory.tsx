type Props = {
  label: string;
  description: string;
  value: number | null;
  onChange: (val: number) => void;
};

const SCORE_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Needs Work", emoji: "🔴" },
  2: { label: "Getting There", emoji: "🟠" },
  3: { label: "Solid", emoji: "🟡" },
  4: { label: "Nailed It", emoji: "🟢" },
};

export default function ScoreCategory({ label, description, value, onChange }: Props) {
  return (
    <div className="py-3 border-b border-border/50 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{label}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {[1, 2, 3, 4].map((score) => {
            const isSelected = value === score;
            return (
              <button
                key={score}
                onClick={() => onChange(score)}
                className={`
                  w-10 h-10 rounded-lg text-sm font-bold transition-all duration-150
                  ${isSelected
                    ? score === 1
                      ? "bg-red-500 text-white shadow-md scale-110"
                      : score === 2
                        ? "bg-orange-500 text-white shadow-md scale-110"
                        : score === 3
                          ? "bg-yellow-500 text-white shadow-md scale-110"
                          : "bg-green-500 text-white shadow-md scale-110"
                    : "bg-secondary hover:bg-accent text-foreground border border-border"
                  }
                `}
                title={SCORE_LABELS[score].label}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>
      {value && (
        <p className="text-xs mt-1.5 text-muted-foreground flex items-center gap-1">
          <span>{SCORE_LABELS[value].emoji}</span>
          <span>{SCORE_LABELS[value].label}</span>
        </p>
      )}
    </div>
  );
}
