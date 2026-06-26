import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const ParticipantSchema = z.object({
  id: z.coerce.number(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string(),
});

export default api({
  name: "RegisterParticipant",
  description: "Registers a new participant with name and role for the demo scorecard event.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.string().min(1),
  }),
  output: z.object({
    participant: ParticipantSchema,
  }),
  async run(ctx, { firstName, lastName, role }) {
    const rows = await ctx.integrations.db.query(
      `INSERT INTO scorecard_participants (first_name, last_name, role)
       VALUES ($1, $2, $3)
       RETURNING id, first_name, last_name, role`,
      ParticipantSchema,
      [firstName, lastName, role],
      { label: "Register new participant" }
    );

    ctx.log.info("Participant registered", { name: `${firstName} ${lastName}`, role });
    return { participant: rows[0] };
  },
});
