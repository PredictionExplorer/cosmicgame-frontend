import api from '@/services/api';

import { seedsDisabled, type QuerySeedEntry } from '../../../QuerySeed';

/**
 * The cycle's first read on the server, keyed as `useDonationsBothByRound`
 * is, so the page arrives with its contributions (or its empty state) in the
 * HTML instead of skeleton figures and rows that the answer then resizes. An
 * invalid cycle, the e2e harness or a failed read seeds nothing. Server-only.
 */
export async function readCycleContributionsSeed(round: number): Promise<QuerySeedEntry[]> {
  if (seedsDisabled() || !Number.isInteger(round) || round < 0) return [];
  try {
    const data = await api.get_donations_both_by_round(round);
    return [{ queryKey: ['donationsBothByRound', round], data, at: Date.now() }];
  } catch {
    return [];
  }
}
