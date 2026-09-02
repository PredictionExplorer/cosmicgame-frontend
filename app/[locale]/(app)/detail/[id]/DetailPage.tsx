'use client';

import { useTranslations } from 'next-intl';

import type { CosmicSignatureMetadata } from '@/lib/nftMetadata';
import NFTTrait from '@/components/nft/NFTTrait';
import { PageShell } from '@/components/ui/page-shell';

interface DetailPageProps {
  tokenId: number;
  /** Server-rendered metadata document (`null` when the origin has none). */
  initialMetadata?: CosmicSignatureMetadata | null;
}

const DetailPage = ({ tokenId, initialMetadata }: DetailPageProps) => {
  const t = useTranslations('detail');

  if (tokenId < 0) {
    return (
      <PageShell variant="form">
        <p className="text-lg font-semibold">{t('invalid.title')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="detail" backdrop="signature" className="max-w-none px-0">
      <NFTTrait tokenId={tokenId} initialMetadata={initialMetadata} />
    </PageShell>
  );
};

export default DetailPage;
