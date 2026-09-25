'use client';

import {
  OutreachAllocationsTable,
  type OutreachAllocationsTableProps,
} from '@/components/tables/OutreachAllocationsTable';

export type { MarketingReward } from '@/components/tables/OutreachAllocationsTable';

/**
 * Every Outreach Reserve allocation, newest first, each linked to its
 * contributor's outreach history: the outreach ledger with its contributor
 * column (see `OutreachAllocationsTable`).
 */
export const GlobalMarketingRewardsTable = (
  props: Omit<OutreachAllocationsTableProps, 'showContributor'>,
) => <OutreachAllocationsTable {...props} showContributor />;
