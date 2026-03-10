'use client';

import { Typography } from '@mui/material';

import { MainWrapper } from '@/components/styled';
import DonatedNFTTable, { type NFTRecord } from '@/components/donations/DonatedNFTTable';
import { useDonationsNFTList } from '@/hooks/useApiQuery';

/**
 * NFTDonationsPage: A page component that fetches and displays NFT donations.
 */
const NFTDonationsPage = () => {
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

export default NFTDonationsPage;
