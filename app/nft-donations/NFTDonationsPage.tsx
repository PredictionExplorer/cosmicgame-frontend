'use client';

import { MainWrapper } from '@/components/styled';
import DonatedNFTTable, { type NFTRecord } from '@/components/donations/DonatedNFTTable';
import { useDonationsNFTList } from '@/hooks/useApiQuery';

const NFTDonationsPage = () => {
  const { data: nftDonations = null } = useDonationsNFTList();

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-8">NFT Donations</h4>

      {nftDonations === null ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
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
