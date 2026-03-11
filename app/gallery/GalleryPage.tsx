'use client';

import { useMemo } from 'react';

import PaginationGrid from '@/components/nft/PaginationGrid';
import { MainWrapper } from '@/components/styled';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCSTList } from '@/hooks/useApiQuery';

const GalleryPage = () => {
  const { data: nfts, isLoading } = useCSTList();

  const collection = useMemo(
    () => [...(nfts ?? [])].sort((a, b) => Number(b.TokenId) - Number(a.TokenId)),
    [nfts],
  );

  return (
    <MainWrapper>
      <PageHeader
        title="NFT Gallery"
        subtitle="Browse all Cosmic Signature NFTs minted across every round"
      />

      <PaginationGrid data={collection} loading={isLoading} />
    </MainWrapper>
  );
};

export default GalleryPage;
