import { GetServerSidePropsContext } from 'next';
import { getAddress, isAddress } from 'viem';
import axios from 'axios';

import UserStatisticsView from '../../components/UserStatisticsView';
import { logoImgUrl } from '../../utils';
import { cosmicGameBaseUrl } from '../../services/api';

const UserPage = ({ address }: { address: string }) => {
  return <UserStatisticsView address={address} isOwnProfile={false} />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;

  if (isAddress(address!.toLowerCase())) {
    address = getAddress(address!.toLowerCase());
    try {
      const { data } = await axios.get(`${cosmicGameBaseUrl}user/info/${address}`);
      if (!data || !data.Bids?.length) {
        address = 'Invalid Address';
      }
    } catch {
      address = 'Invalid Address';
    }
  } else {
    address = 'Invalid Address';
  }

  const title = `Information for User ${address} | Cosmic Signature`;
  const description = `Information for User ${address}`;

  const openGraphData = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: logoImgUrl },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: logoImgUrl },
  ];

  return {
    props: { title, description, openGraphData, address },
  };
}

export default UserPage;
