import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const ParticipantSchema = z.object({
  id: z.coerce.number(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string(),
});

export default api({
  name: "GetParticipants",
  description: "Fetches all registered participants for the scorecard event.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    participants: z.array(ParticipantSchema),
  }),
  async run(ctx) {
    const participants = await ctx.integrations.db.query(
      `SELECT id, first_name, last_name, role
       FROM scorecard_participants
       ORDER BY first_name, last_name
       LIMIT 500`,
      ParticipantSchema,
      [],
      { label: "Fetch all participants" }
    );

    return { participants };
  },
});
