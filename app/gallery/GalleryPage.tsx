'use client';

import { useMemo } from 'react';

import PaginationGrid from '@/components/nft/PaginationGrid';
import { MainWrapper } from '@/components/styled';
import { useCSTList } from '@/hooks/useApiQuery';

const GalleryPage = () => {
  const { data: nfts, isLoading } = useCSTList();

  const collection = useMemo(
    () => [...(nfts ?? [])].sort((a, b) => Number(b.TokenId) - Number(a.TokenId)),
    [nfts],
  );

  return (
    <MainWrapper>
      <div className="flex justify-center items-center flex-wrap">
        <h2 className="text-2xl font-bold text-primary">CosmicSignature</h2>
        &nbsp;
        <h2 className="text-2xl font-bold">NFT Gallery</h2>
      </div>

      <PaginationGrid data={collection} loading={isLoading} />
    </MainWrapper>
  );
};

export default GalleryPage;
