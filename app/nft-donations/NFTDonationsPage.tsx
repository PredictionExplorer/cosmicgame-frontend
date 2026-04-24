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
        title="Attached NFT Contributions"
        subtitle="NFTs attached to gestures by community members across cycles"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Community members can attach their NFTs (ERC-721) to gestures using the advanced options.
        Attached NFTs forward to the participant who receives the Signature Allocation when the
        cycle finalizes, enriching the distribution beyond ETH.
      </p>

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
