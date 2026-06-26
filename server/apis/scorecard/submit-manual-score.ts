import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const ScoreResultSchema = z.object({
  id: z.coerce.number(),
  scorer_name: z.string(),
  scored_participant_id: z.coerce.number(),
  context_score: z.coerce.number(),
  configuration: z.coerce.number(),
  consequence: z.coerce.number(),
  credibility: z.coerce.number(),
  close_score: z.coerce.number(),
  completion: z.coerce.number(),
  feedback: z.string().nullable(),
});

export default api({
  name: "SubmitManualScore",
  description: "Registers an ad-hoc demoer by name/role, then submits their 6-category coaching score.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    scorerName: z.string().min(1),
    manualName: z.string().min(1),
    manualRole: z.string().min(1),
    contextScore: z.number().min(1).max(4),
    configuration: z.number().min(1).max(4),
    consequence: z.number().min(1).max(4),
    credibility: z.number().min(1).max(4),
    closeScore: z.number().min(1).max(4),
    completion: z.number().min(1).max(4),
    feedback: z.string().max(200).nullable(),
  }),
  output: z.object({
    score: ScoreResultSchema,
  }),
  async run(ctx, { scorerName, manualName, manualRole, contextScore, configuration, consequence, credibility, closeScore, completion, feedback }) {
    // Split name into first/last (best effort)
    const parts = manualName.trim().split(/\s+/);
    const firstName = parts[0] || manualName;
    const lastName = parts.slice(1).join(" ") || "";

    // Register participant (upsert-style)
    const ParticipantSchema = z.object({ id: z.coerce.number() });
    const participants = await ctx.integrations.db.query(
      `INSERT INTO scorecard_participants (first_name, last_name, role)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ParticipantSchema,
      [firstName, lastName, manualRole],
      { label: "Register manual demoer" }
    );

    const participantId = participants[0].id;

    // Submit score
    const rows = await ctx.integrations.db.query(
      `INSERT INTO scorecard_scores (scorer_name, scored_participant_id, context_score, configuration, consequence, credibility, close_score, completion, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, scorer_name, scored_participant_id, context_score, configuration, consequence, credibility, close_score, completion, feedback`,
      ScoreResultSchema,
      [scorerName, participantId, contextScore, configuration, consequence, credibility, closeScore, completion, feedback],
      { label: "Insert manual coaching score (6-C)" }
    );

    ctx.log.info("Manual score submitted", { scorer: scorerName, demoer: manualName, role: manualRole });
    return { score: rows[0] };
  },
});
