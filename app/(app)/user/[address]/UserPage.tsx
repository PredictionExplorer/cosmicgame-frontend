'use client';

import UserStatisticsView from '@/components/UserStatisticsView';

const UserPage = ({ address }: { address: string }) => {
  return <UserStatisticsView address={address} isOwnProfile={false} />;
};

export default UserPage;
