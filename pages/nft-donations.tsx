import React from 'react';
import { Typography } from '@mui/material';
import { GetServerSideProps } from 'next';

import { MainWrapper } from '../components/styled';
import DonatedNFTTable, { type NFTRecord } from '../components/donations/DonatedNFTTable';
import { createOpenGraphProps } from '../utils/seo';
import { useDonationsNFTList } from '../hooks/useApiQuery';

/**
 * NFTDonations: A page component that fetches and displays NFT donations.
 */
const NFTDonations = () => {
  const { data: nftDonations = null } = useDonationsNFTList();

  return (
    <MainWrapper>
      {/* Page Title */}
      <Typography variant="h4" color="primary" gutterBottom textAlign="center" mb={4}>
        NFT Donations
      </Typography>

      {/* Conditionally render loading text or the DonatedNFTTable */}
      {nftDonations === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <DonatedNFTTable
          list={(nftDonations ?? []) as NFTRecord[]}
          handleClaim={undefined}
          claimingTokens={[]}
        />
      )}
    </MainWrapper>
  );
};

/**
 * getServerSideProps: Adds SEO metadata for the NFT Donations page.
 */
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps('NFT Donations | Cosmic Signature', 'NFT Donations'),
});

export default NFTDonations;
