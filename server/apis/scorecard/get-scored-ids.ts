import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const ScoredIdSchema = z.object({
  scored_participant_id: z.coerce.number(),
});

export default api({
  name: "GetScoredIds",
  description: "Returns participant IDs that a given scorer has already scored.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    scorerName: z.string().min(1),
  }),
  output: z.object({
    scoredIds: z.array(z.number()),
  }),
  async run(ctx, { scorerName }) {
    const rows = await ctx.integrations.db.query(
      `SELECT DISTINCT scored_participant_id FROM scorecard_scores WHERE scorer_name = $1 LIMIT 500`,
      ScoredIdSchema,
      [scorerName],
      { label: "Get already-scored participant IDs" }
    );

    return { scoredIds: rows.map((r) => r.scored_participant_id) };
  },
});
