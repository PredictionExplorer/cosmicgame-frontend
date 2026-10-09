import { getAddress, isAddress } from 'viem';

import { sameAddress } from '@/utils/format';

import { readMarketingRewards } from '../../publicDataReads';
import { seedsDisabled, type QuerySeedEntry } from '../../QuerySeed';

/**
 * The contributor page's reads on the server, from one read of every
 * outreach allocation (shared with /marketing): the whole list, which ranks
 * the contributor, and their own allocations under the key
 * `useMarketingRewardsByUser` reads. The page then arrives with its figures
 * and rows in the HTML instead of skeletons. An invalid address, the e2e
 * harness or a failed read seeds nothing. Server-only.
 */
export async function readOutreachAddressSeeds(rawAddress: string): Promise<QuerySeedEntry[]> {
  const lower = rawAddress.toLowerCase();
  if (seedsDisabled() || !isAddress(lower)) return [];
  const address = getAddress(lower);
  const read = await readMarketingRewards();
  if (read.data === null) return [];
  const own = read.data.filter((reward) => sameAddress(reward.MarketerAddr, address));
  return [
    { queryKey: ['marketingRewards'], data: read.data, at: read.at },
    { queryKey: ['marketingRewardsByUser', address], data: own, at: read.at },
  ];
}
