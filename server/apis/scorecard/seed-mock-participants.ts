import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const MOCK_PARTICIPANTS = [
  { first: "Demo", last: "Lovato", role: "[INSERT ROLE 1]" },
  { first: "Portia", last: "Lander", role: "[INSERT ROLE 1]" },
  { first: "Anna", last: "Lytics", role: "[INSERT ROLE 1]" },
  { first: "Amp", last: "Litude", role: "[INSERT ROLE 2]" },
  { first: "Dash", last: "Boardman", role: "[INSERT ROLE 2]" },
  { first: "Metric", last: "Maven", role: "[INSERT ROLE 2]" },
  { first: "Doug", last: "Firwood", role: "[INSERT ROLE 3]" },
  { first: "Will", last: "Amette", role: "[INSERT ROLE 3]" },
  { first: "Cas", last: "Cadia", role: "[INSERT ROLE 3]" },
  { first: "Rose", last: "Gardener", role: "[INSERT ROLE 4]" },
  { first: "Sal", last: "Monberry", role: "[INSERT ROLE 4]" },
  { first: "Sandy", last: "Rivers", role: "[INSERT ROLE 4]" },
  { first: "Pitch", last: "Deckson", role: "[INSERT ROLE 5]" },
  { first: "Con", last: "Version", role: "[INSERT ROLE 5]" },
  { first: "Blaze", last: "Trailman", role: "[INSERT ROLE 5]" },
  { first: "Craig", last: "Terlake", role: "[INSERT ROLE 6]" },
  { first: "Tim", last: "Berline", role: "[INSERT ROLE 6]" },
  { first: "Skip", last: "Stumptown", role: "[INSERT ROLE 6]" },
  { first: "Page", last: "Turner", role: "[INSERT ROLE 7]" },
  { first: "Chart", last: "Topson", role: "[INSERT ROLE 7]" },
  { first: "Reed", last: "Forester", role: "[INSERT ROLE 7]" },
  { first: "Voo", last: "Doughnut", role: "[INSERT ROLE 8]" },
  { first: "Pixel", last: "Pioneer", role: "[INSERT ROLE 8]" },
  { first: "Click", last: "Funnelman", role: "[INSERT ROLE 8]" },
  { first: "Coho", last: "Silverman", role: "[INSERT ROLE 8]" },
];

export default api({
  name: "SeedMockParticipants",
  description: "Seeds 25 mock participants for end-to-end testing.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    inserted: z.number(),
  }),
  async run(ctx) {
    let inserted = 0;
    for (const p of MOCK_PARTICIPANTS) {
      await ctx.integrations.db.query(
        `INSERT INTO scorecard_participants (first_name, last_name, role)
         SELECT $1::text, $2::text, $3::text
         WHERE NOT EXISTS (
           SELECT 1 FROM scorecard_participants
           WHERE first_name = $1::text AND last_name = $2::text
         )`,
        z.object({}),
        [p.first, p.last, p.role],
        { label: `Seed ${p.first} ${p.last}` }
      );
      inserted++;
    }
    ctx.log.info(`Seeded ${inserted} mock participants`);
    return { inserted };
  },
});
