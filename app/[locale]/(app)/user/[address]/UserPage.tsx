'use client';

import UserStatisticsView from '@/components/UserStatisticsView';
import { DataTableWidth } from '@/components/ui/data-table';

/**
 * A profile stacks short ledgers (gestures, outreach) with wide ones
 * (allocations, anchoring): every one runs the full width, so they share
 * one right edge.
 */
const UserPage = ({ address }: { address: string }) => {
  return (
    <DataTableWidth value="fill">
      <UserStatisticsView address={address} isOwnProfile={false} />
    </DataTableWidth>
  );
};

export default UserPage;
