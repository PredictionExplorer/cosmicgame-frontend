'use client';

import { useActiveWeb3React } from '@/hooks/web3';
import UserStatisticsView from '@/components/UserStatisticsView';

const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  return <UserStatisticsView address={account ?? null} isOwnProfile={true} />;
};

export default MyStatistics;
