import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { Typography } from '@mui/material';

import NFTTrait from '../../components/nft/NFTTrait';
import { MainWrapper } from '../../components/styled';
import { cosmicGameBaseUrl } from '../../services/api';
import { getAssetsUrl } from '../../utils';
import { createOpenGraphProps } from '../../utils/seo';

interface DetailProps {
  tokenId: number;
  title: string;
  description: string;
  openGraphData: Array<{ property?: string; name?: string; content: string }>;
}

// Detail component that renders NFTTrait inside a styled MainWrapper
const Detail = ({ tokenId }: DetailProps) => {
  if (tokenId < 0) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Token Id</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper
      maxWidth={false}
      style={{
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <NFTTrait tokenId={tokenId} />
    </MainWrapper>
  );
};

// Server-side props function to fetch token data for SSR
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Extract tokenId from URL params
  const idParam = context.params!.id;
  const tokenId = Array.isArray(idParam) ? idParam[0] : idParam;

  const title = `Token #${tokenId} | Cosmic Signature Token`;
  const description = `Discover the unique attributes and ownership history of Cosmic Signature Token #${tokenId}, an exclusive digital collectible from the Cosmic Signature game.`;

  const { data } = await axios.get(`${cosmicGameBaseUrl}cst/info/${tokenId}`);
  const fileName = `0x${data.TokenInfo.Seed}`;
  const imageUrl = getAssetsUrl(`cosmicsignature/${fileName}.png`);

  return {
    props: {
      ...createOpenGraphProps(title, description, imageUrl),
      tokenId: parseInt(tokenId as string, 10),
    },
  };
}

export default Detail;
