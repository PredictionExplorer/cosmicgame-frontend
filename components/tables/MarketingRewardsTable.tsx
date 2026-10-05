'use client';

import {
  OutreachAllocationsTable,
  type OutreachAllocationsTableProps,
} from '@/components/tables/OutreachAllocationsTable';

export type { MarketingReward } from '@/components/tables/OutreachAllocationsTable';

/**
 * One contributor's Outreach Reserve allocations: the outreach ledger
 * without its contributor column (see `OutreachAllocationsTable`). The
 * outreach address page passes `title` ("Allocations"); a participant's
 * profile shows it under its own "Outreach allocations" section heading.
 */
const MarketingRewardsTable = (props: Omit<OutreachAllocationsTableProps, 'showContributor'>) => (
  <OutreachAllocationsTable {...props} />
);

export default MarketingRewardsTable;
