import { cache } from 'react';

import { get_round_info } from '@/services/api/rounds';
import { get_cst_info } from '@/services/api/tokens';

import { seedsDisabled, type QuerySeedEntry } from '../QuerySeed';

async function settle<T>(read: () => Promise<T>): Promise<{ data: T | null; at: number }> {
  try {
    return { data: await read(), at: Date.now() };
  } catch {
    // A cycle the API holds no record of (400) or a failed read: the client asks again.
    return { data: null, at: Date.now() };
  }
}

/**
 * The server reads behind one finalized cycle's record: the cycle
 * (`useRoundInfo`) and its Signature's seed (`useCSTInfo`), keyed like the
 * client hooks, so the first HTML already holds the record and its art and
 * nothing moves when the page hydrates. Nothing is read under the e2e
 * harness, whose seeds are off (the browser mocks win there).
 */
export const readFinalizedCycleSeeds = cache(async (cycle: number): Promise<QuerySeedEntry[]> => {
  if (seedsDisabled()) return [];
  const round = await settle(() => get_round_info(cycle));
  const seeds: QuerySeedEntry[] = [
    { queryKey: ['roundInfo', cycle], data: round.data, at: round.at },
  ];
  const tokenId = round.data?.TokenId;
  if (typeof tokenId === 'number' && tokenId >= 0) {
    const token = await settle(() => get_cst_info(tokenId));
    seeds.push({ queryKey: ['cstInfo', tokenId], data: token.data, at: token.at });
  }
  return seeds;
});
