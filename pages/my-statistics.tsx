import { GetServerSideProps } from 'next';

import { useActiveWeb3React } from '../hooks/web3';
import UserStatisticsView from '../components/UserStatisticsView';
import { createOpenGraphProps } from '../utils/seo';

const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  return <UserStatisticsView address={account ?? null} isOwnProfile={true} />;
};

export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps(
    'My Statistics | Cosmic Signature',
    "Track your performance with Cosmic Signature's My Statistics page. View detailed bid history, stake status, rewards, and more. Stay informed and optimize your participation in our blockchain ecosystem.",
  ),
});

export default MyStatistics;
