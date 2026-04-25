import * as rounds from './rounds';
import * as tokens from './tokens';
import * as anchoring from './anchoring';
import * as donations from './donations';
import * as users from './users';
import * as stellarSelection from './stellarSelection';
import * as marketing from './marketing';
import * as system from './system';

const api = {
  ...rounds,
  ...tokens,
  ...anchoring,
  ...donations,
  ...users,
  ...stellarSelection,
  ...marketing,
  ...system,
};

export default api;
export { cosmicGameBaseUrl } from './client';
export * from './types';
