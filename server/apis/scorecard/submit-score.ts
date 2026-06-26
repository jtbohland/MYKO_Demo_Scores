import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const ScoreResultSchema = z.object({
  id: z.coerce.number(),
  scorer_name: z.string(),
  scored_participant_id: z.coerce.number(),
  clarity: z.coerce.number(),
  conversational_tone: z.coerce.number(),
  credibility: z.coerce.number(),
  close_score: z.coerce.number(),
  completion: z.coerce.number(),
  feedback: z.string().nullable(),
});

export default api({
  name: "SubmitScore",
  description: "Submits a coaching score for a participant across 5 categories plus feedback.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    scorerName: z.string().min(1),
    scoredParticipantId: z.number(),
    clarity: z.number().min(1).max(4),
    conversationalTone: z.number().min(1).max(4),
    credibility: z.number().min(1).max(4),
    closeScore: z.number().min(1).max(4),
    completion: z.number().min(1).max(4),
    feedback: z.string().max(200).nullable(),
  }),
  output: z.object({
    score: ScoreResultSchema,
  }),
  async run(ctx, { scorerName, scoredParticipantId, clarity, conversationalTone, credibility, closeScore, completion, feedback }) {
    const rows = await ctx.integrations.db.query(
      `INSERT INTO scorecard_scores (scorer_name, scored_participant_id, clarity, conversational_tone, credibility, close_score, completion, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, scorer_name, scored_participant_id, clarity, conversational_tone, credibility, close_score, completion, feedback`,
      ScoreResultSchema,
      [scorerName, scoredParticipantId, clarity, conversationalTone, credibility, closeScore, completion, feedback],
      { label: "Insert coaching score" }
    );

    ctx.log.info("Score submitted", { scorer: scorerName, participantId: scoredParticipantId });
    return { score: rows[0] };
  },
});
