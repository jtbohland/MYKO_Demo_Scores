import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TimerDisplay from "./TimerDisplay";
import ScoreCategory from "./ScoreCategory";
import ConfettiLauncher from "./ConfettiLauncher";

type Participant = {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
};

type LeaderboardEntry = {
  participant_id: number;
  first_name: string;
  last_name: string;
  role: string;
  total_points: number;
  demo_count: number;
};

type Props = {
  participants: Participant[];
  scorerName: string;
  scorerId: number;
  scoredParticipantIds: number[];
  leaderboard: LeaderboardEntry[];
  onSubmitScore: (data: {
    scoredParticipantId: number;
    contextScore: number;
    configuration: number;
    consequence: number;
    credibility: number;
    closeScore: number;
    completion: number;
    feedback: string | null;
  }) => Promise<void>;
  onSubmitManualScore: (data: {
    manualName: string;
    manualRole: string;
    contextScore: number;
    configuration: number;
    consequence: number;
    credibility: number;
    closeScore: number;
    completion: number;
    feedback: string | null;
  }) => Promise<void>;
  submitting: boolean;
  onScoringActiveChange?: (active: boolean) => void;
};

type Phase = "idle" | "demo" | "scoring_gate" | "feedback";

const DEMO_SECONDS = 300; // 5 minutes
const FEEDBACK_SECONDS = 60; // 1 minute

const ROLES = [
  "[INSERT ROLE 1]",
  "[INSERT ROLE 2]",
  "[INSERT ROLE 3]",
  "[INSERT ROLE 4]",
  "[INSERT ROLE 5]",
  "[INSERT ROLE 6]",
  "[INSERT ROLE 7]",
  "[INSERT ROLE 8]",
];

const DEBRIEF_QUESTIONS = [
  {
    emoji: "💪",
    question: "What's one moment during the demo where you felt most confident — and why did that moment land so well?",
  },
  {
    emoji: "🔄",
    question: "If you could replay one part of the demo, what would you do differently and what would that look like?",
  },
  {
    emoji: "🎯",
    question: "What's one piece of feedback from today that you'll carry into your next demo?",
  },
];

const COMPLETION_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Needs Work", emoji: "🔴" },
  2: { label: "Getting There", emoji: "🟠" },
  3: { label: "Solid", emoji: "🟡" },
  4: { label: "Nailed It", emoji: "🟢" },
};

/**
 * Compute the auto-score for Completion based on how long the demo lasted.
 * Rubric (5-min timer = 300s):
 *   4 — Nailed It:    3:00–4:30 (180s–270s used)
 *   3 — Solid:        2:30–2:59 (150s–179s) or 4:31–4:59 (271s–299s)
 *   2 — Getting There: 2:00–2:29 (120s–149s) or 5:00 / buzzer (≥300s)
 *   1 — Needs Work:   under 2:00 (<120s)
 */
function computeCompletionScore(demoUsedSeconds: number): number {
  if (demoUsedSeconds >= 180 && demoUsedSeconds <= 270) return 4;
  if ((demoUsedSeconds >= 150 && demoUsedSeconds <= 179) || (demoUsedSeconds >= 271 && demoUsedSeconds <= 299)) return 3;
  if ((demoUsedSeconds >= 120 && demoUsedSeconds <= 149) || demoUsedSeconds >= 300) return 2;
  return 1; // under 2:00
}

function playBuzzer() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Audio may be blocked
  }
}

export default function ScorecardTab({
  participants,
  scorerName,
  scorerId,
  scoredParticipantIds,
  leaderboard,
  onSubmitScore,
  onSubmitManualScore,
  submitting,
  onScoringActiveChange,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [demoSeconds, setDemoSeconds] = useState(DEMO_SECONDS);
  const [feedbackSeconds, setFeedbackSeconds] = useState(FEEDBACK_SECONDS);
  const [contextScore, setContextScore] = useState<number | null>(null);
  const [configurationScore, setConfigurationScore] = useState<number | null>(null);
  const [consequenceScore, setConsequenceScore] = useState<number | null>(null);
  const [credibility, setCredibility] = useState<number | null>(null);
  const [closeScore, setCloseScore] = useState<number | null>(null);
  const [completionScore, setCompletionScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [feedbackTimerDone, setFeedbackTimerDone] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedParticipant = useMemo(
    () => participants.find((p) => p.id === selectedParticipantId),
    [participants, selectedParticipantId]
  );

  const scoredDisplayName = useMemo(() => {
    if (isManualEntry) return manualName || "Manual Entry";
    if (selectedParticipant) return `${selectedParticipant.first_name} ${selectedParticipant.last_name}`;
    return "";
  }, [isManualEntry, manualName, selectedParticipant]);

  const scoredRole = useMemo(() => {
    if (isManualEntry) return manualRole;
    if (selectedParticipant) return selectedParticipant.role;
    return "";
  }, [isManualEntry, manualRole, selectedParticipant]);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = participants.filter((p) => p.id !== scorerId);
    if (q) {
      list = list.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
      );
    }
    return list;
  }, [participants, searchQuery, scorerId]);

  const alreadyScoredSet = useMemo(() => new Set(scoredParticipantIds), [scoredParticipantIds]);

  const canBegin = isManualEntry
    ? manualName.trim().length > 0 && manualRole.length > 0
    : selectedParticipantId !== null;

  // All 5 manual scores filled (completion is auto, so not included)
  const allManualScored = contextScore !== null && configurationScore !== null && consequenceScore !== null && credibility !== null && closeScore !== null;
  // All 6 scores including completion
  const allSixScored = allManualScored && completionScore !== null;

  const sessionComplete = scoreSubmitted && feedbackTimerDone;

  // Notify parent when scoring session is active (for tab locking)
  const scoringActive = phase !== "idle" && !sessionComplete;
  const prevScoringActive = useRef(scoringActive);
  useEffect(() => {
    if (scoringActive !== prevScoringActive.current) {
      prevScoringActive.current = scoringActive;
      onScoringActiveChange?.(scoringActive);
    }
  }, [scoringActive, onScoringActiveChange]);

  // Compute total score for final screen
  const totalScore = useMemo(() => {
    if (!allSixScored) return 0;
    return (contextScore ?? 0) + (configurationScore ?? 0) + (consequenceScore ?? 0) + (credibility ?? 0) + (closeScore ?? 0) + (completionScore ?? 0);
  }, [contextScore, configurationScore, consequenceScore, credibility, closeScore, completionScore, allSixScored]);

  // Leaderboard position data for final screen
  const leaderboardPositions = useMemo(() => {
    // Find the scored participant's ID
    const targetId = isManualEntry ? null : selectedParticipantId;
    if (!targetId && !isManualEntry) return { roleRank: 0, overallRank: 0 };

    // Overall rank
    const overallSorted = [...leaderboard].sort((a, b) => b.total_points - a.total_points);
    const overallIdx = targetId
      ? overallSorted.findIndex((e) => e.participant_id === targetId)
      : -1;

    // Role rank
    const roleSorted = overallSorted.filter((e) => e.role === scoredRole);
    const roleIdx = targetId
      ? roleSorted.findIndex((e) => e.participant_id === targetId)
      : -1;

    return {
      roleRank: roleIdx >= 0 ? roleIdx + 1 : roleSorted.length + 1,
      overallRank: overallIdx >= 0 ? overallIdx + 1 : overallSorted.length + 1,
    };
  }, [leaderboard, selectedParticipantId, isManualEntry, scoredRole]);

  // Show debrief when all 5 scores are filled OR on submit
  useEffect(() => {
    if (allSixScored && !showDebrief) {
      setShowDebrief(true);
    }
  }, [allSixScored, showDebrief]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------- DEMO TIMER ----------
  useEffect(() => {
    if (phase !== "demo") return;
    intervalRef.current = setInterval(() => {
      setDemoSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          playBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // When demo timer hits 0 → auto-compute completion + transition
  useEffect(() => {
    if (phase !== "demo" || demoSeconds !== 0) return;
    // Buzzer: used all 240s
    const score = computeCompletionScore(DEMO_SECONDS);
    setCompletionScore(score);
    if (allManualScored) {
      setPhase("feedback");
      setFeedbackSeconds(FEEDBACK_SECONDS);
    } else {
      setPhase("scoring_gate");
    }
  }, [phase, demoSeconds, allManualScored]);

  // ---------- FEEDBACK TIMER ----------
  useEffect(() => {
    if (phase !== "feedback") return;
    const id = setInterval(() => {
      setFeedbackSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // When feedback timer hits 0 → mark done + auto-submit if needed
  useEffect(() => {
    if (phase !== "feedback" || feedbackSeconds !== 0) return;
    setFeedbackTimerDone(true);
    if (!scoreSubmitted) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, feedbackSeconds]);

  // ---------- HANDLERS ----------
  const handleBeginTimer = useCallback(() => {
    if (!canBegin) return;
    setPhase("demo");
    setDemoSeconds(DEMO_SECONDS);
  }, [canBegin]);

  const handleStopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Compute completion based on how much time was used
    const timeUsed = DEMO_SECONDS - demoSeconds;
    const score = computeCompletionScore(timeUsed);
    setCompletionScore(score);
    setPhase("feedback");
    setFeedbackSeconds(FEEDBACK_SECONDS);
  }, [demoSeconds]);

  const handleScoringGateContinue = useCallback(() => {
    setShowDebrief(true);
    setPhase("feedback");
    setFeedbackSeconds(FEEDBACK_SECONDS);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!contextScore || !configurationScore || !consequenceScore || !credibility || !closeScore || !completionScore) return;
    try {
      if (isManualEntry) {
        await onSubmitManualScore({
          manualName: manualName.trim(),
          manualRole: manualRole,
          contextScore,
          configuration: configurationScore,
          consequence: consequenceScore,
          credibility,
          closeScore,
          completion: completionScore,
          feedback: feedback.trim() || null,
        });
      } else if (selectedParticipantId) {
        await onSubmitScore({
          scoredParticipantId: selectedParticipantId,
          contextScore,
          configuration: configurationScore,
          consequence: consequenceScore,
          credibility,
          closeScore,
          completion: completionScore,
          feedback: feedback.trim() || null,
        });
      }
      setScoreSubmitted(true);
      setShowDebrief(true);
    } catch {
      // Error handled by parent toast
    }
  }, [selectedParticipantId, isManualEntry, manualName, manualRole, contextScore, configurationScore, consequenceScore, credibility, closeScore, completionScore, feedback, onSubmitScore, onSubmitManualScore]);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setSelectedParticipantId(null);
    setSearchQuery("");
    setIsManualEntry(false);
    setManualName("");
    setManualRole("");
    setDemoSeconds(DEMO_SECONDS);
    setFeedbackSeconds(FEEDBACK_SECONDS);
    setContextScore(null);
    setConfigurationScore(null);
    setConsequenceScore(null);
    setCredibility(null);
    setCloseScore(null);
    setCompletionScore(null);
    setFeedback("");
    setScoreSubmitted(false);
    setFeedbackTimerDone(false);
    setShowDebrief(false);
  }, []);

  // ==========================================
  // SESSION COMPLETE — score summary + position
  // ==========================================
  if (sessionComplete) {
    // Score color: red (1) → orange → yellow → green (24)
    const scoreHue = Math.round((totalScore / 24) * 130);
    const scoreColor = `hsl(${scoreHue}, 80%, 42%)`;
    const scoreGradientFrom = `hsl(${Math.max(0, scoreHue - 15)}, 85%, 45%)`;
    const scoreGradientTo = `hsl(${Math.min(130, scoreHue + 15)}, 85%, 38%)`;

    // Role rank: gold (#1), silver (#2), bronze (#3), black otherwise
    const roleRankColor =
      leaderboardPositions.roleRank === 1
        ? "#D4A017"
        : leaderboardPositions.roleRank === 2
          ? "#9CA3AF"
          : leaderboardPositions.roleRank === 3
            ? "#CD7F32"
            : "#1a1a1a";
    const roleRankEmoji =
      leaderboardPositions.roleRank === 1
        ? "🥇"
        : leaderboardPositions.roleRank === 2
          ? "🥈"
          : leaderboardPositions.roleRank === 3
            ? "🥉"
            : "";

    // Overall rank: green spectrum for top 10
    const overallInTop10 = leaderboardPositions.overallRank <= 10;
    const overallColor = overallInTop10
      ? `hsl(130, 75%, ${25 + ((10 - leaderboardPositions.overallRank) / 9) * 30}%)`
      : "#1a1a1a";

    // Achievement badges — additive across categories
    // Score tier (everyone gets exactly one) — max 24
    const got80 = totalScore >= 20;             // 80%+ of 24
    const got60 = totalScore >= 15 && totalScore <= 19; // 60-79%
    const gotDebut = totalScore <= 14;          // ≤59%

    // Role tier
    const gotTop3Role = leaderboardPositions.roleRank <= 3;

    // Overall tier (best one only)
    const rank = leaderboardPositions.overallRank;
    const gotTop10Overall = rank <= 10;
    const gotTop25Overall = rank >= 11 && rank <= 25;
    const gotTop50Overall = rank >= 26 && rank <= 50;
    const gotTop100Overall = rank >= 51 && rank <= 100;

    // All-three bonus: 80%+ AND top 3 role AND top 10 overall
    const gotAll3 = got80 && gotTop3Role && gotTop10Overall;

    // Build badge list (additive across categories)
    const badges: { emoji: string; label: string }[] = [];
    if (gotAll3) badges.push({ emoji: "🔥", label: "ALL THREE!" });
    // Score tier badge
    if (got80) badges.push({ emoji: "💯", label: "80% Club" });
    else if (got60) badges.push({ emoji: "👏", label: "Great effort!" });
    else if (gotDebut) badges.push({ emoji: "✅", label: "Demo Debut 🎬" });
    // Role badge
    if (gotTop3Role) badges.push({ emoji: "🏆", label: "Top 3 in Role" });
    // Overall badge (best tier)
    if (gotTop10Overall) badges.push({ emoji: "⭐", label: "Top 10 Overall" });
    else if (gotTop25Overall) badges.push({ emoji: "🎉", label: "Top 25 Overall" });
    else if (gotTop50Overall) badges.push({ emoji: "👍🏼", label: "Top 50 Overall" });
    else if (gotTop100Overall) badges.push({ emoji: "🙌🏽", label: "Top 100 Overall" });

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Confetti launcher */}
        <ConfettiLauncher
          badges={badges}
          gotAll3={gotAll3}
        />

        <div className="text-center space-y-4">
          {/* Achievement badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {badges.map((b) => (
              <span key={b.emoji + b.label} className="text-5xl animate-bounce" style={{ animationDelay: `${badges.indexOf(b) * 150}ms` }}>
                {b.emoji}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {badges.map((b) => (
              <span key={b.label} className="text-xs font-bold uppercase tracking-wider bg-white/80 text-slate-600 px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 italic max-w-sm mx-auto leading-snug">
            Scores and badges are based on standings at time of submission. The Score Board is live — your position may shift as more demos are scored!
          </p>

          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            {scoredDisplayName}
          </h2>
          <div
            className="text-8xl font-black leading-tight"
            style={{
              background: `linear-gradient(135deg, ${scoreGradientFrom}, ${scoreGradientTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: scoreColor,
            }}
          >
            {totalScore}
          </div>
          <p className="text-slate-500 text-lg font-semibold">out of 24</p>
        </div>

        <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-slate-600">
              Current position on <strong className="text-blue-700">{scoredRole}</strong> Score Board ={" "}
              <span className="text-2xl font-extrabold" style={{ color: roleRankColor }}>
                {roleRankEmoji} #{leaderboardPositions.roleRank}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              Overall ={" "}
              <span className="text-2xl font-extrabold" style={{ color: overallColor }}>
                #{leaderboardPositions.overallRank}
              </span>
            </p>
          </div>
        </Card>

        {/* Swap roles callout */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-900 leading-relaxed">
            <span className="text-lg">🫵🏼</span>{" "}
            <strong>Your turn!</strong> If you were the scorer, you&apos;re up next to demo.
            Swap places with your partner, get set up, and have them score you!
          </p>
        </div>

        <Button
          onClick={handleReset}
          size="lg"
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg rounded-xl"
        >
          🔄 Score Another Demo
        </Button>
        <p className="text-center text-xs text-slate-400 leading-snug px-4">
          In a team of 3? Only one person should score the next presenter — tap above when it&apos;s your turn to be the scorer.
        </p>
      </div>
    );
  }

  // ==========================================
  // MAIN SCORECARD FLOW
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Before You Begin */}
      <Card className="p-5 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <span className="text-sm">📋</span>
          </div>
          <h3 className="font-extrabold text-blue-800">Before You Begin</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          This is a safe space to practice. Give honest, constructive feedback.
          Focus on what went well and one area to improve. Remember: we&apos;re all here to learn and get better together!
        </p>
      </Card>

      {/* Who Are You Scoring? */}
      <Card className="p-5 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <span className="text-sm">👤</span>
          </div>
          <h3 className="font-extrabold text-blue-800">Who Are You Scoring?</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Select the person delivering the demo
        </p>

        {!isManualEntry ? (
          <div className="relative" ref={dropdownRef}>
            <Input
              placeholder="🔍 Search by name..."
              value={
                selectedParticipant
                  ? `${selectedParticipant.first_name} ${selectedParticipant.last_name}`
                  : searchQuery
              }
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedParticipantId(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="bg-secondary/50"
              disabled={phase !== "idle"}
            />
            {showDropdown && phase === "idle" && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                <button
                  className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors text-sm border-b border-border text-primary font-medium"
                  onClick={() => {
                    setIsManualEntry(true);
                    setShowDropdown(false);
                    setSelectedParticipantId(null);
                    setSearchQuery("");
                  }}
                >
                  ✏️ Can&apos;t find your demoer? Type it in manually
                </button>

                {filteredParticipants.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No participants found
                  </div>
                ) : (
                  filteredParticipants.map((p) => {
                    const isScored = alreadyScoredSet.has(p.id);
                    return (
                      <button
                        key={p.id}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between text-sm ${
                          isScored
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-accent cursor-pointer"
                        }`}
                        onClick={() => {
                          if (isScored) return;
                          setSelectedParticipantId(p.id);
                          setSearchQuery("");
                          setShowDropdown(false);
                        }}
                        disabled={isScored}
                      >
                        <div>
                          <span className={`font-medium ${isScored ? "line-through" : ""}`}>
                            {p.first_name} {p.last_name}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.role}</p>
                        </div>
                        {isScored && (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            ✅ Scored
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Type demoer's full name..."
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="bg-secondary/50"
              disabled={phase !== "idle"}
            />
            <Select value={manualRole} onValueChange={setManualRole} disabled={phase !== "idle"}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select their role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {phase === "idle" && (
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  setIsManualEntry(false);
                  setManualName("");
                  setManualRole("");
                }}
              >
                ← Back to participant list
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Begin Timer (idle only) */}
      {phase === "idle" && (
        <Button
          onClick={handleBeginTimer}
          disabled={!canBegin}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg rounded-xl"
        >
          ▶️ Begin Timer — Let&apos;s Go!
        </Button>
      )}

      {/* Timer + Coach Card */}
      {(phase === "demo" || phase === "scoring_gate" || phase === "feedback") && (
        <>
          {/* Timer Display — sticky so it stays visible while scrolling */}
          <div className="sticky top-0 z-50">
          <Card className="p-6 border-0 shadow-lg bg-white/95 backdrop-blur-sm rounded-2xl ring-1 ring-blue-200/50">
            {phase === "demo" ? (
              <>
                <TimerDisplay seconds={demoSeconds} label="⏱️ Demo Time Remaining" totalSeconds={DEMO_SECONDS} />
                <Button
                  variant="outline"
                  className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleStopTimer}
                  disabled={!allManualScored}
                >
                  {allManualScored
                    ? "⏹️ Stop Timer — Demo Complete"
                    : "🔒 Complete all 5 scores to stop timer"
                  }
                </Button>
              </>
            ) : phase === "scoring_gate" ? (
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
                  <span className="text-3xl">⚠️</span>
                  <h3 className="font-bold text-yellow-800 mt-2 text-lg">
                    Almost There — Finish Your Scores!
                  </h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    Time&apos;s up on the demo, but your scorecard isn&apos;t complete yet.
                    Fill in all 5 categories below, then continue to the feedback round.
                  </p>
                </div>
                <Button
                  onClick={handleScoringGateContinue}
                  disabled={!allManualScored}
                  className="w-full h-12 font-bold"
                >
                  {allManualScored ? "✅ Scores Complete — Start Feedback Timer" : "🔒 Fill in all 5 scores to continue"}
                </Button>
              </div>
            ) : (
              <>
                <TimerDisplay seconds={feedbackSeconds} label="💬 Feedback Time" totalSeconds={FEEDBACK_SECONDS} />
                <p className="text-center text-xs text-muted-foreground mt-2">
                  {scoreSubmitted
                    ? feedbackSeconds > 0
                      ? "✅ Scores locked in! Use this time to discuss feedback together."
                      : "⏰ Time's up! Great session."
                    : "Share your coaching feedback now — scores auto-submit when time's up!"
                  }
                </p>
              </>
            )}
          </Card>
          </div>

          {/* Submitted Banner */}
          {scoreSubmitted && !feedbackTimerDone && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h4 className="font-bold text-green-800">Scores Submitted &amp; Locked!</h4>
                <p className="text-sm text-green-700">
                  Your scorecard is saved. Use the remaining time to discuss feedback with <strong>{scoredDisplayName}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Debrief questions — shown after all 5 scores filled OR on submit OR on scoring gate continue */}
          {showDebrief && (
            <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-base">💬</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-blue-800">Debrief Questions</h3>
                  <p className="text-xs text-slate-500">Great conversation starters for your feedback chat</p>
                </div>
              </div>
              <div className="space-y-3">
                {DEBRIEF_QUESTIONS.map((dq, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white/70 rounded-xl p-3 shadow-sm border border-white/80">
                    <span className="text-xl flex-shrink-0 mt-0.5">{dq.emoji}</span>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{dq.question}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Coach Scorecard */}
          <Card className={`p-5 border-0 shadow-lg rounded-2xl transition-all ${
            scoreSubmitted
              ? "bg-slate-50 border border-slate-200 opacity-80"
              : "bg-white"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <span className="text-sm">📝</span>
              </div>
              <h3 className="font-extrabold text-blue-800">Coach Scorecard</h3>
              {scoreSubmitted && (
                <span className="ml-auto text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  🔒 Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-1">
              You&apos;re Scoring: <strong className="text-blue-700">{scoredDisplayName}</strong>
              {scoredRole && (
                <span className="text-slate-400 ml-1">· {scoredRole}</span>
              )}
            </p>
            <p className="text-xs text-slate-400 mb-4 italic">
              1 = Needs Work 🔴 · 2 = Getting There 🟠 · 3 = Solid 🟡 · 4 = Nailed It 🟢
            </p>

            <div className="space-y-0">
              <ScoreCategory
                label="Context"
                description="Explain the why"
                value={contextScore}
                onChange={scoreSubmitted ? () => {} : setContextScore}
              />
              <ScoreCategory
                label="Configuration"
                description="Show the agent setup; select a trace"
                value={configurationScore}
                onChange={scoreSubmitted ? () => {} : setConfigurationScore}
              />
              <ScoreCategory
                label="Consequence"
                description="Explain the outcome"
                value={consequenceScore}
                onChange={scoreSubmitted ? () => {} : setConsequenceScore}
              />
              <ScoreCategory
                label="Credibility"
                description="Sound credible"
                value={credibility}
                onChange={scoreSubmitted ? () => {} : setCredibility}
              />
              <ScoreCategory
                label="Close"
                description="Close with a value statement"
                value={closeScore}
                onChange={scoreSubmitted ? () => {} : setCloseScore}
              />

              {/* Completion — auto-scored, always locked */}
              <div className="py-3 border-b border-border/50 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      Completion
                      <span className="text-xs font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Auto</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Finishes within the expected time window and lands the pitch cleanly before the buzzer.</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {[1, 2, 3, 4].map((score) => {
                      const isSelected = completionScore === score;
                      return (
                        <div
                          key={score}
                          className={`
                            w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center
                            ${isSelected
                              ? score === 1
                                ? "bg-red-500 text-white shadow-md scale-110"
                                : score === 2
                                  ? "bg-orange-500 text-white shadow-md scale-110"
                                  : score === 3
                                    ? "bg-yellow-500 text-white shadow-md scale-110"
                                    : "bg-green-500 text-white shadow-md scale-110"
                              : "bg-secondary/50 text-muted-foreground border border-border/50 opacity-40"
                            }
                          `}
                        >
                          {score}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {completionScore && (
                  <p className="text-xs mt-1.5 text-muted-foreground flex items-center gap-1">
                    <span>{COMPLETION_LABELS[completionScore].emoji}</span>
                    <span>{COMPLETION_LABELS[completionScore].label}</span>
                    <span className="text-slate-400 ml-1">— auto-scored based on demo duration</span>
                  </p>
                )}
                {!completionScore && (
                  <p className="text-xs mt-1.5 text-slate-400 italic flex items-center gap-1">
                    🔒 Fills automatically when the timer stops or runs out
                  </p>
                )}
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-600">
                💡 Quick Feedback
              </label>
              <Textarea
                placeholder="What went well? One tip to level up..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 200))}
                className="bg-secondary/50 resize-none"
                rows={3}
                disabled={scoreSubmitted}
              />
              <p className="text-xs text-muted-foreground text-right">
                {feedback.length}/200
              </p>
            </div>

            {/* Submit Button */}
            {!scoreSubmitted ? (
              <Button
                className="w-full mt-4 h-12 text-base font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
                disabled={!allSixScored || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "🚀 Submit Scores"}
              </Button>
            ) : (
              <div className="w-full mt-4 h-12 flex items-center justify-center text-sm font-bold text-green-700 bg-green-50 rounded-xl border border-green-200">
                ✅ Scores Submitted — Card Locked
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
