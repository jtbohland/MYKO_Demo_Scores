import SetupScorecardTables from './scorecard/setup-tables.js';
import RegisterParticipant from './scorecard/register-participant.js';
import GetParticipants from './scorecard/get-participants.js';
import SubmitScore from './scorecard/submit-score.js';
import GetLeaderboard from './scorecard/get-leaderboard.js';
import SubmitManualScore from './scorecard/submit-manual-score.js';
import GetScoredIds from './scorecard/get-scored-ids.js';
import SeedMockParticipants from './scorecard/seed-mock-participants.js';

const apis = {
  SetupScorecardTables,
  RegisterParticipant,
  GetParticipants,
  SubmitScore,
  GetLeaderboard,
  SubmitManualScore,
  GetScoredIds,
  SeedMockParticipants,
} as const;

export default apis;

export type ApiRegistry = typeof apis;
