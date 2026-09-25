import { cache } from 'react';

import {
  get_staking_cst_actions_by_user,
  get_staking_rewards_by_user_by_token_details,
} from '@/services/api/anchoring';
import { get_cst_info } from '@/services/api/tokens';
import { participantAddress } from '@/components/winnings/participantAddress';

import { seedsDisabled, type QuerySeedEntry } from '../../../QuerySeed';

async function settle<T>(read: () => Promise<T>): Promise<{ data: T | null; at: number }> {
  try {
    return { data: await read(), at: Date.now() };
  } catch {
    // A failed read seeds nothing: the client asks again.
    return { data: null, at: Date.now() };
  }
}

/**
 * The server reads behind one anchored NFT's distributions page: its deposits
 * for the anchor-holder (`useAnchorDistributionsByUserByTokenDetails`), the
 * anchor-holder's anchor actions (`useCSTAnchorActionsByUser`: where this
 * NFT's anchor stands) and the NFT itself (`useCSTInfo`: its name, cycle and
 * the plate's seed), keyed like the client hooks. The first HTML is then the page as the browser shows it:
 * with its figure strip, or, for an NFT with no deposit yet, without one, so
 * the plate and the ledger never jump up when the answer arrives. Nothing is
 * read under the e2e harness, whose seeds are off, or for a segment that is
 * not an address and a token id: only a checksummed address reaches the
 * upstream path.
 */
export const readTokenDistributionSeeds = cache(
  async (rawAddress: string, tokenId: number): Promise<QuerySeedEntry[]> => {
    const address = participantAddress(rawAddress);
    if (seedsDisabled() || address === null || !Number.isSafeInteger(tokenId) || tokenId < 0) {
      return [];
    }
    const [deposits, actions, token] = await Promise.all([
      settle(() => get_staking_rewards_by_user_by_token_details(address, tokenId)),
      settle(() => get_staking_cst_actions_by_user(address)),
      settle(() => get_cst_info(tokenId)),
    ]);
    return [
      {
        queryKey: ['stakingRewardsByUserByToken', address, tokenId],
        data: deposits.data,
        at: deposits.at,
      },
      {
        queryKey: ['stakingCSTActionsByUser', address],
        data: actions.data,
        at: actions.at,
      },
      { queryKey: ['cstInfo', tokenId], data: token.data, at: token.at },
    ];
  },
);
