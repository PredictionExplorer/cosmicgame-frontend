import { GetServerSideProps } from 'next';

import { useActiveWeb3React } from '../hooks/web3';
import UserStatisticsView from '../components/UserStatisticsView';
import { logoImgUrl } from '../utils';

const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  return <UserStatisticsView address={account ?? null} isOwnProfile={true} />;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = 'My Statistics | Cosmic Signature';
  const description =
    "Track your performance with Cosmic Signature's My Statistics page. View detailed bid history, stake status, rewards, and more. Stay informed and optimize your participation in our blockchain ecosystem.";

  const openGraphData = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: logoImgUrl },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default MyStatistics;
