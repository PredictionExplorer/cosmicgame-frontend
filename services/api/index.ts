import * as rounds from './rounds';
import * as tokens from './tokens';
import * as anchoring from './anchoring';
import * as donations from './donations';
import * as users from './users';
import * as stellarSelection from './stellarSelection';
import * as marketing from './marketing';
import * as system from './system';
import * as biddingStats from './bidding-stats';

const api = {
  ...rounds,
  ...tokens,
  ...anchoring,
  ...donations,
  ...users,
  ...stellarSelection,
  ...marketing,
  ...system,
  ...biddingStats,
};

export default api;
export { cosmicGameBaseUrl, pagedPath, DEFAULT_API_PAGE_LIMIT } from './client';
export type { ApiPageWindow } from './client';
export * from './types';
