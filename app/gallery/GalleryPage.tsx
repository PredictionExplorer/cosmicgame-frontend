'use client';

import { useState, useEffect } from 'react';

import PaginationGrid from '@/components/nft/PaginationGrid';
import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import type { CSTTokenInfo } from '@/services/api/types';

const GalleryPage = () => {
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<CSTTokenInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const nfts = await api.get_cst_list();
      const sorted = nfts.sort((a, b) => Number(b.TokenId) - Number(a.TokenId));
      setCollection(sorted);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <MainWrapper>
      <div className="flex justify-center items-center flex-wrap">
        <h2 className="text-2xl font-bold text-primary">CosmicSignature</h2>
        &nbsp;
        <h2 className="text-2xl font-bold">NFT Gallery</h2>
      </div>

      <PaginationGrid data={collection} loading={loading} />
    </MainWrapper>
  );
};

export default GalleryPage;
