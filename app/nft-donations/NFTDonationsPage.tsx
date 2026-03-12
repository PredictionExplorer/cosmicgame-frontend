'use client';

import { MainWrapper } from '@/components/styled';
import DonatedNFTTable, { type NFTRecord } from '@/components/donations/DonatedNFTTable';
import { useDonationsNFTList } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';

const NFTDonationsPage = () => {
  const { data: nftDonations = null } = useDonationsNFTList();

  return (
    <MainWrapper>
      <PageHeader
        title="NFT Donations"
        subtitle="NFTs donated to the prize pool by community members"
      />

      {nftDonations === null ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
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
