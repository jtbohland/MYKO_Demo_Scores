import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const LeaderboardEntrySchema = z.object({
  participant_id: z.coerce.number(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string(),
  total_points: z.coerce.number(),
  demo_count: z.coerce.number(),
});

export default api({
  name: "GetLeaderboard",
  description: "Fetches leaderboard data grouped by role with total points per participant.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    leaderboard: z.array(LeaderboardEntrySchema),
  }),
  async run(ctx) {
    const leaderboard = await ctx.integrations.db.query(
      `SELECT
        p.id AS participant_id,
        p.first_name,
        p.last_name,
        p.role,
        COALESCE(SUM(s.context_score + s.configuration + s.consequence + s.credibility + s.close_score + s.completion), 0) AS total_points,
        COUNT(s.id) AS demo_count
       FROM scorecard_participants p
       LEFT JOIN scorecard_scores s ON s.scored_participant_id = p.id
       GROUP BY p.id, p.first_name, p.last_name, p.role
       HAVING COUNT(s.id) > 0
       ORDER BY total_points DESC
       LIMIT 200`,
      LeaderboardEntrySchema,
      [],
      { label: "Fetch leaderboard rankings" }
    );

    return { leaderboard };
  },
});
