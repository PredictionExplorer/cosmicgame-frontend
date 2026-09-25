import { cache } from 'react';

import api from '@/services/api';
import type { CacheWindow } from '@/lib/cacheWindow';

import { seedsDisabled, type QuerySeedEntry } from '../../QuerySeed';

/**
 * The reads behind a participant's profile, each under the query key of the
 * hook `UserStatisticsView` calls for it (hooks/useApiQuery.ts), with the
 * address in its checksummed form, as the page hands it to the view.
 */
const PROFILE_READS: readonly (readonly [
  key: string,
  read: (address: string) => Promise<unknown>,
])[] = [
  ['userInfo', (address) => api.get_user_info(address)],
  ['claimHistoryByUser', (address) => api.get_claim_history_by_user(address)],
  ['userBalance', (address) => api.get_user_balance(address)],
  ['cstTokensByUser', (address) => api.get_cst_tokens_by_user(address)],
  ['stakingCSTActionsByUser', (address) => api.get_staking_cst_actions_by_user(address)],
  ['stakingRWLKActionsByUser', (address) => api.get_staking_rwalk_actions_by_user(address)],
  ['stakingRewardsByUser', (address) => api.get_staking_rewards_by_user(address)],
  [
    'stakingCSTByUserByDeposit',
    (address) => api.get_staking_cst_by_user_by_deposit_rewards(address),
  ],
  ['stakingRWLKMintsByUser', (address) => api.get_staking_rwalk_mints_by_user(address)],
  ['marketingRewardsByUser', (address) => api.get_marketing_rewards_by_user(address)],
  ['claimedDonatedNFTByUser', (address) => api.get_claimed_donated_nft_by_user(address)],
  ['unclaimedDonatedNFTByUser', (address) => api.get_unclaimed_donated_nft_by_user(address)],
  ['donationsERC20ByUser', (address) => api.get_donations_erc20_by_user(address)],
];

export interface ProfileRead {
  /** The client queries the first HTML renders from. */
  seeds: QuerySeedEntry[];
  /**
   * How long the render may be served (`lib/cacheWindow`): a profile is live
   * (every gesture, allocation and anchor adds to it), and one with a read
   * that failed is kept a minute.
   */
  cacheWindow: CacheWindow;
}

/**
 * A participant's profile, read on the server once per render, so its header
 * figures, its NFTs and its ledgers are the first HTML rather than
 * placeholders the browser fills after hydration. Each read is keyed like
 * its hook; an answer of "nothing" (an address with no record) is seeded as
 * the `null` its hook answers, so the empty state is in the HTML too. A
 * failed read seeds nothing, and the browser reads it; nothing is read under
 * the e2e harness, whose browser mocks the API.
 */
export const readProfile = cache(async (address: string): Promise<ProfileRead> => {
  if (seedsDisabled()) return { seeds: [], cacheWindow: 'pending' };
  const reads = await Promise.all(
    PROFILE_READS.map(async ([key, read]): Promise<QuerySeedEntry | null> => {
      try {
        const data = await read(address);
        return { queryKey: [key, address], data, at: Date.now(), absent: data === null };
      } catch {
        return null;
      }
    }),
  );
  const seeds = reads.filter((seed): seed is QuerySeedEntry => seed !== null);
  return { seeds, cacheWindow: seeds.length === PROFILE_READS.length ? 'live' : 'pending' };
});
