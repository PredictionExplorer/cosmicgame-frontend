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
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Community members can donate their NFTs (ERC-721) to the Cosmic Signature prize pool using
        the advanced bidding options. Donated NFTs are awarded to the main prize winner at the end
        of each round, enriching the rewards beyond ETH.
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
