'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import AttachedNFTTable, { type NFTRecord } from '@/components/attachments/AttachedNFTTable';
import { useDonationsNFTList } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';

/** `seoSummary` is the server-rendered page header, the page's only header. */
const NFTDonationsPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('statistics');
  const { data: nftDonations = null } = useDonationsNFTList();

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('attachedNfts.title')}
          subtitle={t('attachedNfts.subtitle')}
        />
      )}

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
