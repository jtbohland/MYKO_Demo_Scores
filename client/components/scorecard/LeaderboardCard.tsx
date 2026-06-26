type LeaderboardEntry = {
  participant_id: number;
  first_name: string;
  last_name: string;
  total_points: number;
  demo_count: number;
};

type Props = {
  title: string;
  entries: LeaderboardEntry[];
  colorScheme: {
    headerBg: string;
    headerText: string;
    accentBg: string;
    accentText: string;
    badge: string;
  };
};

const RANK_EMOJIS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

export default function LeaderboardCard({ title, entries, colorScheme }: Props) {
  const sorted = [...entries].sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border-0 bg-white">
      {/* Header */}
      <div className={`px-5 py-4 ${colorScheme.headerBg} shadow-md`}>
        <h3 className={`font-extrabold text-lg ${colorScheme.headerText} flex items-center gap-2`}>
          🏆 {title}
        </h3>
        <p className={`text-xs ${colorScheme.headerText} opacity-80 font-medium`}>
          {sorted.length} {sorted.length === 1 ? "competitor" : "competitors"}
        </p>
      </div>

      {/* Entries */}
      <div className="p-3 space-y-1.5">
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8 italic">
            No scores yet — be the first! 🚀
          </p>
        ) : (
          sorted.map((entry, idx) => {
            const isTopFive = idx < 5;
            return (
              <div
                key={entry.participant_id}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg transition-all
                  ${isTopFive ? `${colorScheme.accentBg}` : "hover:bg-secondary/50"}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base w-7 text-center shrink-0">
                    {isTopFive ? RANK_EMOJIS[idx] : `${idx + 1}.`}
                  </span>
                  <span
                    className={`truncate ${
                      isTopFive
                        ? `font-bold ${colorScheme.accentText} ${idx === 0 ? "text-base" : "text-sm"}`
                        : "text-sm text-foreground"
                    }`}
                  >
                    {entry.first_name} {entry.last_name}
                  </span>
                </div>
                <span
                  className={`
                    shrink-0 tabular-nums font-mono rounded-full px-2.5 py-0.5
                    ${isTopFive
                      ? `font-extrabold ${colorScheme.badge} ${idx === 0 ? "text-lg" : "text-base"}`
                      : "text-sm text-muted-foreground bg-secondary"
                    }
                  `}
                >
                  {entry.total_points}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
