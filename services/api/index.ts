import * as rounds from './rounds';
import * as tokens from './tokens';
import * as staking from './staking';
import * as donations from './donations';
import * as users from './users';
import * as raffle from './raffle';
import * as marketing from './marketing';
import * as system from './system';

const api = {
  ...rounds,
  ...tokens,
  ...staking,
  ...donations,
  ...users,
  ...raffle,
  ...marketing,
  ...system,
};

export default api;
export { cosmicGameBaseUrl } from './client';
export * from './types';
