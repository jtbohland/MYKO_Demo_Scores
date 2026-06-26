import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "SetupScorecardTables",
  description: "Creates scorecard_participants and scorecard_scores tables if they don't exist.",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({ success: z.boolean() }),
  async run(ctx) {
    await ctx.integrations.db.execute(`
      CREATE TABLE IF NOT EXISTS scorecard_participants (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await ctx.integrations.db.execute(`
      CREATE TABLE IF NOT EXISTS scorecard_scores (
        id SERIAL PRIMARY KEY,
        scorer_name VARCHAR(200) NOT NULL,
        scored_participant_id INTEGER NOT NULL REFERENCES scorecard_participants(id),
        clarity INTEGER NOT NULL CHECK (clarity BETWEEN 1 AND 4),
        conversational_tone INTEGER NOT NULL CHECK (conversational_tone BETWEEN 1 AND 4),
        credibility INTEGER NOT NULL CHECK (credibility BETWEEN 1 AND 4),
        close_score INTEGER NOT NULL CHECK (close_score BETWEEN 1 AND 4),
        completion INTEGER NOT NULL DEFAULT 2 CHECK (completion BETWEEN 1 AND 4),
        feedback VARCHAR(200),
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Add completion column to existing tables (safe idempotent migration)
    await ctx.integrations.db.execute(`
      ALTER TABLE scorecard_scores
      ADD COLUMN IF NOT EXISTS completion INTEGER NOT NULL DEFAULT 2 CHECK (completion BETWEEN 1 AND 4)
    `);

    ctx.log.info("Scorecard tables created successfully");
    return { success: true };
  },
});
