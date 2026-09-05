'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import AttachedNFTTable, { type NFTRecord } from '@/components/attachments/AttachedNFTTable';
import { useDonationsNFTList } from '@/hooks/useApiQuery';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

const NFTDonationsPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data: nftDonations = null } = useDonationsNFTList();

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}
      {seoSummary ? (
        <div className="mb-8">
          <SectionEyebrow tone="impact">
            {t('attachedNfts.eyebrow', {
              count: (nftDonations?.length ?? 0).toLocaleString(locale),
            })}
          </SectionEyebrow>
        </div>
      ) : (
        <PageHeader
          align="left"
          eyebrow={
            <SectionEyebrow tone="impact">
              {t('attachedNfts.eyebrow', {
                count: (nftDonations?.length ?? 0).toLocaleString(locale),
              })}
            </SectionEyebrow>
          }
          title={t('attachedNfts.title')}
          titleLevel={2}
          subtitle={t('attachedNfts.subtitle')}
        />
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('attachedNfts.description')}
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
