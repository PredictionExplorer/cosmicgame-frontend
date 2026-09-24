import { cache } from 'react';

import {
  get_staking_cst_actions,
  get_staking_cst_rewards,
  get_staking_rwalk_actions,
  get_staking_rwalk_mints_global,
} from '@/services/api/anchoring';
import {
  get_charity_cg_deposits,
  get_charity_voluntary,
  get_charity_withdrawals,
  get_donations_both,
  get_donations_nft_list,
} from '@/services/api/donations';
import { get_marketing_rewards } from '@/services/api/marketing';
import { get_claim_history, get_dashboard_info, get_round_list } from '@/services/api/rounds';
import {
  COORDINATION_EVENTS_END_ID,
  coordinationStartId,
  get_system_events,
  get_system_modelist,
} from '@/services/api/system';
import { get_named_nfts, get_used_rwlk_nfts } from '@/services/api/tokens';

/**
 * Server reads behind the public data pages' headers.
 *
 * Each read resolves once per request (React `cache()`), so the header's
 * figures and the client seed (`PublicDataQuerySeed`) share one upstream
 * request. A read never rejects: a failure resolves to `data: null`, which
 * marks only the figures built from it as unknown. `at` is when the data
 * arrived — the time a snapshot stamp shows.
 */
export interface TimedRead<T> {
  data: T | null;
  /** When the read resolved (epoch ms). */
  at: number;
}

function timedRead<T>(read: () => Promise<T>): () => Promise<TimedRead<T>> {
  return cache(async () => {
    try {
      const data = await read();
      return { data, at: Date.now() };
    } catch {
      return { data: null, at: Date.now() };
    }
  });
}

export const readDashboard = timedRead(() => get_dashboard_info());
export const readRoundList = timedRead(() => get_round_list());
export const readClaimHistory = timedRead(() => get_claim_history());
export const readAnchorCstActions = timedRead(() => get_staking_cst_actions());
export const readAnchorRwalkActions = timedRead(() => get_staking_rwalk_actions());
export const readAnchorEthDeposits = timedRead(() => get_staking_cst_rewards());
export const readAnchorStellarImprints = timedRead(() => get_staking_rwalk_mints_global());
export const readMarketingRewards = timedRead(() => get_marketing_rewards());
export const readDirectContributions = timedRead(() => get_donations_both());
export const readAttachedNfts = timedRead(() => get_donations_nft_list());
export const readNamedNfts = timedRead(() => get_named_nfts());
export const readUsedRwlkNfts = timedRead(() => get_used_rwlk_nfts());
export const readPublicGoodsDeposits = timedRead(() => get_charity_cg_deposits());
export const readVoluntaryPublicGoods = timedRead(() => get_charity_voluntary());
export const readPublicGoodsRetrievals = timedRead(() => get_charity_withdrawals());
export const readSystemModes = timedRead(() => get_system_modelist());

/** The coordination events the /coordination-changes table lists. */
export const readCoordinationEvents = cache(async () => {
  const modes = await readSystemModes();
  if (modes.data === null) return { data: null, at: modes.at, startId: 0 };
  const startId = coordinationStartId(modes.data);
  try {
    const data = await get_system_events(startId, COORDINATION_EVENTS_END_ID);
    return { data, at: Date.now(), startId };
  } catch {
    return { data: null, at: Date.now(), startId };
  }
});
