import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicClient, http, isAddress, type Address } from 'viem';

import { activeChain } from '@/config/chains';
import { networkConfig } from '@/config/networks';
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
import {
  get_banned_bids,
  get_claim_history,
  get_dashboard_info,
  get_round_list,
} from '@/services/api/rounds';
import {
  COORDINATION_EVENTS_END_ID,
  coordinationStartId,
  get_system_events,
  get_system_modelist,
} from '@/services/api/system';
import { get_cst_list, get_named_nfts, get_used_rwlk_nfts } from '@/services/api/tokens';

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

/** How long a shared read serves every request before one of them refreshes it. */
const SHARED_READ_SECONDS = 60;

/**
 * A read shared across requests through Next's data cache as well: every
 * request within `SHARED_READ_SECONDS` of it gets the same answer (then one
 * request refreshes it while the others still get the last one). For reads a
 * dynamic route makes on every request (/allocation-finalized reads the query
 * string), and a prerender makes once per locale. `at` stays the time the
 * data was read, not the time it was served. A failed read is not cached.
 */
function sharedTimedRead<T>(key: string, read: () => Promise<T>): () => Promise<TimedRead<T>> {
  const shared = unstable_cache(
    async () => ({ data: await read(), at: Date.now() }),
    ['public-data', key],
    { revalidate: SHARED_READ_SECONDS },
  );
  return cache(async () => {
    try {
      return await shared();
    } catch {
      return { data: null, at: Date.now() };
    }
  });
}

export const readDashboard = timedRead(() => get_dashboard_info());
export const readRoundList = sharedTimedRead('round-list', () => get_round_list());
export const readClaimHistory = sharedTimedRead('claim-history', () => get_claim_history());
export const readAnchorCstActions = timedRead(() => get_staking_cst_actions());
export const readAnchorRwalkActions = timedRead(() => get_staking_rwalk_actions());
export const readAnchorEthDeposits = timedRead(() => get_staking_cst_rewards());
export const readAnchorStellarImprints = timedRead(() => get_staking_rwalk_mints_global());
export const readMarketingRewards = timedRead(() => get_marketing_rewards());
export const readDirectContributions = timedRead(() => get_donations_both());
export const readAttachedNfts = timedRead(() => get_donations_nft_list());
export const readNamedNfts = timedRead(() => get_named_nfts());
/** Every imprinted Signature (the gallery's list, `useCSTList`). */
export const readCollection = timedRead(() => get_cst_list());
export const readUsedRwlkNfts = timedRead(() => get_used_rwlk_nfts());
export const readPublicGoodsDeposits = timedRead(() => get_charity_cg_deposits());
export const readVoluntaryPublicGoods = timedRead(() => get_charity_voluntary());
export const readPublicGoodsRetrievals = timedRead(() => get_charity_withdrawals());
export const readSystemModes = timedRead(() => get_system_modelist());
/**
 * The gestures whose messages moderation has hidden (`useGestureModeration`
 * reads the same list): a server render that shows a message checks it
 * here first, so a hidden message never reaches the HTML.
 */
export const readHiddenGestures = timedRead(() => get_banned_bids());

/** How long the header waits for the chain before it shows a figure as unavailable. */
const CHAIN_READ_TIMEOUT_MS = 5_000;

/** `owner()` of an OpenZeppelin `Ownable` contract, the one read the header needs. */
const OWNABLE_ABI = [
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/** `nextTokenId()` of the Random Walk NFT contract: how many have been imprinted. */
const NEXT_TOKEN_ID_ABI = [
  {
    type: 'function',
    name: 'nextTokenId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/** A public client for one short, bounded read, or null when no RPC is configured. */
function chainClient() {
  if (!networkConfig.rpcUrl) return null;
  return createPublicClient({
    chain: activeChain,
    transport: http(networkConfig.rpcUrl, { timeout: CHAIN_READ_TIMEOUT_MS, retryCount: 1 }),
  });
}

/**
 * The protocol contract's owner, read from the chain: the only address that
 * can change its parameters, or the zero address once ownership has been
 * renounced. The contract's address comes from the dashboard read.
 */
export const readGameOwner = cache(async (): Promise<TimedRead<Address>> => {
  const game = (await readDashboard()).data?.ContractAddrs?.CosmicGameAddr;
  const client = chainClient();
  if (!game || !isAddress(game) || !client) return { data: null, at: Date.now() };
  try {
    const owner = await client.readContract({
      address: game,
      abi: OWNABLE_ABI,
      functionName: 'owner',
    });
    return { data: owner, at: Date.now() };
  } catch {
    return { data: null, at: Date.now() };
  }
});

/**
 * How many Random Walk NFTs have been imprinted, read from the Random Walk
 * contract (token ids start at 0, so the next id is the count). The
 * contract's address comes from the dashboard read.
 */
export const readRandomWalkImprinted = cache(async (): Promise<TimedRead<number>> => {
  const randomWalk = (await readDashboard()).data?.ContractAddrs?.RandomWalkAddr;
  const client = chainClient();
  if (!randomWalk || !isAddress(randomWalk) || !client) return { data: null, at: Date.now() };
  try {
    const next = await client.readContract({
      address: randomWalk,
      abi: NEXT_TOKEN_ID_ABI,
      functionName: 'nextTokenId',
    });
    return { data: Number(next), at: Date.now() };
  } catch {
    return { data: null, at: Date.now() };
  }
});

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
