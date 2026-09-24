import type { ReactNode } from 'react';

import { COORDINATION_EVENTS_END_ID } from '@/services/api/system';

import type { SeoSummaryRoute } from './PublicDataRouteSeoSummary';
import {
  readAttachedNfts,
  readCoordinationEvents,
  readDirectContributions,
  readMarketingRewards,
  readNamedNfts,
  readPublicGoodsDeposits,
  readPublicGoodsRetrievals,
  readRoundList,
  readSystemModes,
  readUsedRwlkNfts,
  readVoluntaryPublicGoods,
} from './publicDataReads';
import { QuerySeed, type QuerySeedEntry } from './QuerySeed';

/**
 * The client queries each route's page reads, seeded from the same server
 * reads as its header (one request each, see publicDataReads). The keys must
 * match the hooks in hooks/useApiQuery.ts.
 */
async function getRouteSeeds(route: SeoSummaryRoute): Promise<QuerySeedEntry[]> {
  const seed = async (
    queryKey: QuerySeedEntry['queryKey'],
    read: () => Promise<{ data: unknown; at: number }>,
  ): Promise<QuerySeedEntry[]> => {
    const { data, at } = await read();
    return [{ queryKey, data, at }];
  };

  switch (route) {
    case 'allocation':
      return seed(['roundList'], readRoundList);
    case 'marketing':
      return seed(['marketingRewards'], readMarketingRewards);
    case 'eth-contribution':
      return seed(['donationsBoth'], readDirectContributions);
    case 'attached-nfts':
      return seed(['donationsNFTList'], readAttachedNfts);
    case 'named-nfts':
      return seed(['namedNFTs'], readNamedNfts);
    case 'used-rwlk-nfts':
      return seed(['usedRWLKNFTs'], readUsedRwlkNfts);
    case 'public-goods-contributions-cg':
      return seed(['charityCGDeposits'], readPublicGoodsDeposits);
    case 'public-goods-contributions-voluntary':
      return seed(['charityVoluntary'], readVoluntaryPublicGoods);
    case 'public-goods-retrievals':
      return seed(['charityWithdrawals'], readPublicGoodsRetrievals);
    case 'coordination-changes': {
      const [modes, events] = await Promise.all([readSystemModes(), readCoordinationEvents()]);
      return [
        { queryKey: ['systemModelist'], data: modes.data, at: modes.at },
        {
          queryKey: ['systemEvents', events.startId, COORDINATION_EVENTS_END_ID],
          data: events.data,
          at: events.at,
        },
      ];
    }
    // These pages seed their own reads in their page.tsx (anchoring: its four ledgers;
    // allocation-finalized: the cycle the URL names, or the index), or read contract state
    // on the client (imprint).
    case 'anchoring':
    case 'imprint':
    case 'allocation-finalized':
      return [];
  }
}

/**
 * Hands a public data page's server reads to its client queries, so the ISR
 * HTML already contains the list and the page never shows a spinner for data
 * the server just read (F209). Each entry is dated to its read.
 */
export async function PublicDataQuerySeed({
  route,
  children,
}: {
  route: SeoSummaryRoute;
  children: ReactNode;
}) {
  return <QuerySeed seeds={await getRouteSeeds(route)}>{children}</QuerySeed>;
}
