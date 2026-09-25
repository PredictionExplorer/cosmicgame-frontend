'use client';

import UserStatisticsView from '@/components/UserStatisticsView';

/** A participant's public profile; `address` is null when the URL does not hold one. */
const UserPage = ({ address }: { address: string | null }) => {
  return <UserStatisticsView address={address} isOwnProfile={false} />;
};

export default UserPage;
