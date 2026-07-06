'use client';

import NFTTrait from '@/components/nft/NFTTrait';
import { PageShell } from '@/components/ui/page-shell';

const DetailPage = ({ tokenId }: { tokenId: number }) => {
  if (tokenId < 0) {
    return (
      <PageShell variant="form">
        <p className="text-lg font-semibold">Invalid Token Id</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="detail" backdrop="signature" className="max-w-none px-0">
      <NFTTrait tokenId={tokenId} />
    </PageShell>
  );
};

export default DetailPage;
