'use client';

import { Typography } from '@mui/material';

import NFTTrait from '@/components/nft/NFTTrait';
import { MainWrapper } from '@/components/styled';

const DetailPage = ({ tokenId }: { tokenId: number }) => {
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

export default DetailPage;
