'use client';

import AttachedNFTTable, { type NFTRecord } from '@/components/attachments/AttachedNFTTable';
import { useDonationsNFTList } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

const NFTDonationsPage = () => {
  const { data: nftDonations = null } = useDonationsNFTList();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="impact">Attached NFTs · {nftDonations?.length ?? 0}</SectionEyebrow>
        }
        title="Attached NFT Contributions"
        gradientTitle="signature"
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
        <AttachedNFTTable
          list={(nftDonations ?? []) as NFTRecord[]}
          handleClaim={undefined}
          claimingTokens={[]}
        />
      )}
    </PageShell>
  );
};

export default NFTDonationsPage;
