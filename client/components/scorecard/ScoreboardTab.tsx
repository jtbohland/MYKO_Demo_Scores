import { useMemo } from "react";
import LeaderboardCard from "./LeaderboardCard";

type LeaderboardEntry = {
  participant_id: number;
  first_name: string;
  last_name: string;
  role: string;
  total_points: number;
  demo_count: number;
};

type Props = {
  leaderboard: LeaderboardEntry[];
  fetching: boolean;
};

const ROLE_BOARDS = [
  {
    role: "[INSERT ROLE 1]",
    colors: {
      headerBg: "bg-gradient-to-r from-blue-500 to-blue-700",
      headerText: "text-white",
      accentBg: "bg-blue-50",
      accentText: "text-blue-700",
      badge: "text-blue-700 bg-blue-100",
    },
  },
  {
    role: "[INSERT ROLE 2]",
    colors: {
      headerBg: "bg-gradient-to-r from-emerald-500 to-emerald-700",
      headerText: "text-white",
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-700",
      badge: "text-emerald-700 bg-emerald-100",
    },
  },
  {
    role: "[INSERT ROLE 3]",
    colors: {
      headerBg: "bg-gradient-to-r from-purple-500 to-purple-700",
      headerText: "text-white",
      accentBg: "bg-purple-50",
      accentText: "text-purple-700",
      badge: "text-purple-700 bg-purple-100",
    },
  },
  {
    role: "[INSERT ROLE 4]",
    colors: {
      headerBg: "bg-gradient-to-r from-orange-400 to-orange-600",
      headerText: "text-white",
      accentBg: "bg-orange-50",
      accentText: "text-orange-700",
      badge: "text-orange-700 bg-orange-100",
    },
  },
  {
    role: "[INSERT ROLE 5]",
    colors: {
      headerBg: "bg-gradient-to-r from-rose-500 to-rose-700",
      headerText: "text-white",
      accentBg: "bg-rose-50",
      accentText: "text-rose-700",
      badge: "text-rose-700 bg-rose-100",
    },
  },
  {
    role: "[INSERT ROLE 6]",
    colors: {
      headerBg: "bg-gradient-to-r from-cyan-500 to-cyan-700",
      headerText: "text-white",
      accentBg: "bg-cyan-50",
      accentText: "text-cyan-700",
      badge: "text-cyan-700 bg-cyan-100",
    },
  },
  {
    role: "[INSERT ROLE 7]",
    colors: {
      headerBg: "bg-gradient-to-r from-amber-400 to-amber-600",
      headerText: "text-white",
      accentBg: "bg-amber-50",
      accentText: "text-amber-700",
      badge: "text-amber-700 bg-amber-100",
    },
  },
  {
    role: "[INSERT ROLE 8]",
    colors: {
      headerBg: "bg-gradient-to-r from-indigo-500 to-indigo-700",
      headerText: "text-white",
      accentBg: "bg-indigo-50",
      accentText: "text-indigo-700",
      badge: "text-indigo-700 bg-indigo-100",
    },
  },
];

const OVERALL_RANK_EMOJIS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export default function ScoreboardTab({ leaderboard, fetching }: Props) {
  const grouped = useMemo(() => {
    const map: Record<string, LeaderboardEntry[]> = {};
    for (const entry of leaderboard) {
      if (!map[entry.role]) map[entry.role] = [];
      map[entry.role].push(entry);
    }
    return map;
  }, [leaderboard]);

  const overallSorted = useMemo(
    () => [...leaderboard].sort((a, b) => b.total_points - a.total_points),
    [leaderboard]
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          🏅 Live Leaderboards
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Scores update in real time — climb to the top! 🔥
        </p>
        {fetching && (
          <p className="text-xs text-blue-400 mt-1 animate-pulse font-medium">
            ✨ Refreshing scores...
          </p>
        )}
      </div>

      {/* Role-specific tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ROLE_BOARDS.map((board) => (
          <LeaderboardCard
            key={board.role}
            title={board.role}
            entries={grouped[board.role] ?? []}
            colorScheme={board.colors}
          />
        ))}
      </div>

      {/* Overall Scoreboard — full width */}
      <div className="rounded-2xl overflow-hidden shadow-xl border-0 bg-white">
        <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-900 shadow-md">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            🌟 Overall Scoreboard
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            {overallSorted.length} {overallSorted.length === 1 ? "competitor" : "competitors"} across all roles
          </p>
        </div>
        <div className="p-3 space-y-1.5">
          {overallSorted.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8 italic">
              No scores yet — be the first! 🚀
            </p>
          ) : (
            overallSorted.map((entry, idx) => {
              const isTopTen = idx < 10;
              return (
                <div
                  key={entry.participant_id}
                  className={`
                    flex items-center justify-between px-4 py-2.5 rounded-lg transition-all
                    ${isTopTen ? "bg-gradient-to-r from-blue-50/80 to-indigo-50/80" : "hover:bg-secondary/50"}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base w-8 text-center shrink-0">
                      {isTopTen ? OVERALL_RANK_EMOJIS[idx] : `${idx + 1}.`}
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`truncate block ${
                          isTopTen
                            ? `font-bold text-blue-800 ${idx < 3 ? "text-base" : "text-sm"}`
                            : "text-sm text-foreground"
                        }`}
                      >
                        {entry.first_name} {entry.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.role}</span>
                    </div>
                  </div>
                  <span
                    className={`
                      shrink-0 tabular-nums font-mono rounded-full px-2.5 py-0.5
                      ${isTopTen
                        ? `font-extrabold text-blue-700 bg-blue-100 ${idx < 3 ? "text-lg" : "text-base"}`
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
    </div>
  );
}
