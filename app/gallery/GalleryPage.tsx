'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import PaginationGrid from '@/components/nft/PaginationGrid';
import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import type { CSTTokenInfo } from '@/services/api/types';

/* ------------------------------------------------------------------
  Page Component: Gallery
  Renders a page showing the CosmicSignature NFT Gallery. The page:
    1) Fetches gallery data (client-side) from an API upon mount.
    2) Sorts the NFT list by descending TokenId.
    3) Passes the sorted data to the PaginationGrid component for display.
------------------------------------------------------------------ */
const GalleryPage = () => {
  // Local loading state to show a loading indicator while fetching data.
  const [loading, setLoading] = useState(true);

  // Collection state to store the fetched array of NFT objects.
  const [collection, setCollection] = useState<CSTTokenInfo[]>([]);

  /*
    useEffect: On component mount, fetch NFT list from the server
    via our api service. Sort the NFTs (descending by TokenId), and
    store them in local state.
  */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch all NFT items from the API endpoint.
      const nfts = await api.get_cst_list();

      // Sort them descending by TokenId.
      const sorted = nfts.sort((a, b) => Number(b.TokenId) - Number(a.TokenId));

      // Update state and turn off loading.
      setCollection(sorted);
      setLoading(false);
    };

    // Invoke the async function defined above.
    fetchData();
  }, []);

  return (
    <MainWrapper>
      {/* Page Header */}
      <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap">
        <Typography variant="h4" component="span" color="primary">
          CosmicSignature
        </Typography>
        &nbsp;
        <Typography variant="h4" component="span">
          NFT Gallery
        </Typography>
      </Box>

      {/*
        Renders the fetched NFT collection in a paginated grid.
        The grid handles searching and pagination internally.
      */}
      <PaginationGrid data={collection} loading={loading} />
    </MainWrapper>
  );
};

export default GalleryPage;
