'use client';

import UserStatisticsView from '@/components/UserStatisticsView';
import { DataTableWidth } from '@/components/ui/data-table';

/**
 * A participant's public profile; `address` is null when the URL does not
 * hold one. The profile stacks short ledgers (gestures, outreach) with wide
 * ones (allocations, anchoring): every one runs the full width, so they share
 * one right edge.
 */
const UserPage = ({ address }: { address: string | null }) => {
  return (
    <DataTableWidth value="fill">
      <UserStatisticsView address={address} isOwnProfile={false} />
    </DataTableWidth>
  );
};

export default UserPage;
