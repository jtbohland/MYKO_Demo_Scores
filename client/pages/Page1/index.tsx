import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useApiData } from "@/hooks/useApiData";
import { queryClient } from "@superblocksteam/library";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegistrationScreen from "@/components/scorecard/RegistrationScreen";
import AppHeader from "@/components/scorecard/AppHeader";
import InstructionsTab from "@/components/scorecard/InstructionsTab";
import ScorecardTab from "@/components/scorecard/ScorecardTab";
import ScoreboardTab from "@/components/scorecard/ScoreboardTab";

const STORAGE_KEY = "scorecard_registered_user";

type RegisteredUser = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
};

function loadSavedUser(): RegisteredUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveUser(user: RegisteredUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
}

export default function Page1Component() {
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(loadSavedUser);
  const [tablesReady, setTablesReady] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  const [scoringActive, setScoringActive] = useState(false);

  // Setup tables on first load
  const { run: setupTables } = useApi("SetupScorecardTables");
  const { run: registerParticipant, loading: registering } = useApi("RegisterParticipant");
  const { run: submitScore, loading: submittingScore } = useApi("SubmitScore");
  const { run: submitManualScore, loading: submittingManual } = useApi("SubmitManualScore");

  const scorerFullName = registeredUser
    ? `${registeredUser.firstName} ${registeredUser.lastName}`
    : "";

  // Load participants (for the scorecard dropdown)
  const {
    data: participantsData,
    loading: loadingParticipants,
  } = useApiData("GetParticipants", {}, { enabled: tablesReady });

  // Load which participants this scorer already scored
  const {
    data: scoredIdsData,
    refetch: refetchScoredIds,
  } = useApiData("GetScoredIds", { scorerName: scorerFullName }, {
    enabled: tablesReady && !!scorerFullName,
  });

  // Load leaderboard (auto-refresh every 10s for real-time feel)
  const {
    data: leaderboardData,
    fetching: fetchingLeaderboard,
  } = useApiData("GetLeaderboard", {}, {
    enabled: tablesReady,
    refetchInterval: 10000,
  });

  // Setup tables once
  useEffect(() => {
    let mounted = true;
    setupTables({}).then(() => {
      if (mounted) setTablesReady(true);
    }).catch(() => {
      if (mounted) {
        toast.error("Failed to initialize — please refresh");
        setTablesReady(true);
      }
    });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegister = useCallback(
    async (data: { firstName: string; lastName: string; role: string }) => {
      try {
        const result = await registerParticipant({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
        if (result?.participant) {
          const user: RegisteredUser = {
            id: result.participant.id,
            firstName: result.participant.first_name,
            lastName: result.participant.last_name,
            role: result.participant.role,
          };
          setRegisteredUser(user);
          saveUser(user);
          toast.success(`Welcome, ${data.firstName}! 🎉 Let's go!`);
        }
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Registration failed: " + message);
      }
    },
    [registerParticipant]
  );

  const handleSubmitScore = useCallback(
    async (data: {
      scoredParticipantId: number;
      clarity: number;
      conversationalTone: number;
      credibility: number;
      closeScore: number;
      completion: number;
      feedback: string | null;
    }) => {
      if (!registeredUser) return;
      try {
        await submitScore({
          scorerName: scorerFullName,
          scoredParticipantId: data.scoredParticipantId,
          clarity: data.clarity,
          conversationalTone: data.conversationalTone,
          credibility: data.credibility,
          closeScore: data.closeScore,
          completion: data.completion,
          feedback: data.feedback,
        });
        toast.success("Scores submitted! 🚀 Check the leaderboard!");
        await refetchScoredIds();
        await queryClient.invalidateQueries("GetLeaderboard");
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Failed to submit: " + message);
        throw error;
      }
    },
    [registeredUser, scorerFullName, submitScore, refetchScoredIds]
  );

  const handleSubmitManualScore = useCallback(
    async (data: {
      manualName: string;
      manualRole: string;
      clarity: number;
      conversationalTone: number;
      credibility: number;
      closeScore: number;
      completion: number;
      feedback: string | null;
    }) => {
      if (!registeredUser) return;
      try {
        await submitManualScore({
          scorerName: scorerFullName,
          manualName: data.manualName,
          manualRole: data.manualRole,
          clarity: data.clarity,
          conversationalTone: data.conversationalTone,
          credibility: data.credibility,
          closeScore: data.closeScore,
          completion: data.completion,
          feedback: data.feedback,
        });
        toast.success("Scores submitted! 🚀 Check the leaderboard!");
        await refetchScoredIds();
        await queryClient.invalidateQueries("GetLeaderboard");
        await queryClient.invalidateQueries("GetParticipants");
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Failed to submit: " + message);
        throw error;
      }
    },
    [registeredUser, scorerFullName, submitManualScore, refetchScoredIds]
  );

  // ---------- REGISTRATION SCREEN ----------
  if (!registeredUser) {
    return (
      <div className="min-h-full overflow-auto">
        <RegistrationScreen onRegister={handleRegister} loading={registering} />
      </div>
    );
  }

  // ---------- MAIN APP ----------
  const submitting = submittingScore || submittingManual;

  return (
    <div className="min-h-full flex flex-col overflow-auto bg-background">
      <AppHeader
        participantName={`${registeredUser.firstName} ${registeredUser.lastName}`}
        participantRole={registeredUser.role}
      />

      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={(v) => { if (!scoringActive || v === "scorecard") setActiveTab(v); }} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-12 bg-white shadow-md border-0 rounded-xl">
              <TabsTrigger
                value="instructions"
                disabled={scoringActive}
                className={`text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg ${scoringActive ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                📖 Instructions
              </TabsTrigger>
              <TabsTrigger value="scorecard" className="text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg">
                📝 Scorecard
              </TabsTrigger>
              <TabsTrigger
                value="scoreboard"
                disabled={scoringActive}
                className={`text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg ${scoringActive ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                🏅 Score Board
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="mt-6">
              <InstructionsTab />
            </TabsContent>

            <TabsContent value="scorecard" className="mt-6">
              {loadingParticipants ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading participants...
                </div>
              ) : (
                <ScorecardTab
                  participants={participantsData?.participants ?? []}
                  scorerName={scorerFullName}
                  scorerId={registeredUser.id}
                  scoredParticipantIds={scoredIdsData?.scoredIds ?? []}
                  leaderboard={leaderboardData?.leaderboard ?? []}
                  onSubmitScore={handleSubmitScore}
                  onSubmitManualScore={handleSubmitManualScore}
                  submitting={submitting}
                  onScoringActiveChange={setScoringActive}
                />
              )}
            </TabsContent>

            <TabsContent value="scoreboard" className="mt-6">
              <ScoreboardTab
                leaderboard={leaderboardData?.leaderboard ?? []}
                fetching={fetchingLeaderboard}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
