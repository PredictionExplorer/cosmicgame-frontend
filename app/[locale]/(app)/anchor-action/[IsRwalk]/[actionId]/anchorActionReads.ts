import { cache } from 'react';

import {
  get_staking_cst_actions_info,
  get_staking_rwalk_actions_info,
} from '@/services/api/anchoring';
import { get_cst_info } from '@/services/api/tokens';

import { seedsDisabled, type QuerySeedEntry } from '../../../QuerySeed';

import type { AnchorActionParams } from './params';

/** The client hook's query key for one action's record, by collection. */
export function anchorActionQueryKey({ isRwalk, actionId }: AnchorActionParams) {
  return [isRwalk ? 'stakingRWLKActionsInfo' : 'stakingCSTActionsInfo', actionId] as const;
}

/**
 * The server reads behind one anchor action's record, keyed like the client
 * hooks, so the first HTML is the record (the plate, the wall label, the
 * record and the timeline) rather than a skeleton that fills after
 * hydration: the action (`useCSTAnchorActionInfo` or
 * `useRWLKAnchorActionInfo`) and, for a Cosmic Signature, the token
 * (`useCSTInfo`: its name, cycle and seed). No record is seeded as the
 * `null` its hook answers, so the missing-record state is the server HTML
 * too. A failed read seeds nothing; nothing is read under the e2e harness.
 */
export const readAnchorActionSeeds = cache(
  async (params: AnchorActionParams): Promise<QuerySeedEntry[]> => {
    if (seedsDisabled()) return [];
    const read = params.isRwalk ? get_staking_rwalk_actions_info : get_staking_cst_actions_info;
    let info: Awaited<ReturnType<typeof read>>;
    try {
      info = await read(params.actionId);
    } catch {
      return [];
    }
    const seeds: QuerySeedEntry[] = [
      { queryKey: [...anchorActionQueryKey(params)], data: info, at: Date.now(), absent: !info },
    ];
    const tokenId = info?.Stake?.TokenId;
    if (!params.isRwalk && typeof tokenId === 'number' && tokenId >= 0) {
      try {
        const token = await get_cst_info(tokenId);
        seeds.push({ queryKey: ['cstInfo', tokenId], data: token, at: Date.now() });
      } catch {
        // The plate reads its seed on the client.
      }
    }
    return seeds;
  },
);
