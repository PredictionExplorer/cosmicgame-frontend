'use client';

import NFTTrait from '@/components/nft/NFTTrait';
import { MainWrapper } from '@/components/styled';

const DetailPage = ({ tokenId }: { tokenId: number }) => {
  if (tokenId < 0) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Invalid Token Id</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="max-w-none px-0">
      <NFTTrait tokenId={tokenId} />
    </MainWrapper>
  );
};

export default DetailPage;
