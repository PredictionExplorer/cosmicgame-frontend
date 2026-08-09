'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, getMetadata } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useDonationsWithInfoById } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';
import { formatFixed } from '@/utils/format';

interface EthDonationDetailPageProps {
  id: number;
}

const EthDonationDetailPage = ({ id }: EthDonationDetailPageProps) => {
  const locale = useLocale();
  const t = useTranslations('ethContribution');
  const { data: rawDonationInfo, isLoading: loading } = useDonationsWithInfoById(id);
  const donationInfo =
    (rawDonationInfo as {
      TxHash: string;
      TimeStamp: number;
      DonorAddr: string;
      RoundNum: number;
      AmountEth: number;
      DataJson?: string;
      [key: string]: unknown;
    } | null) ?? null;

  const [dataJson, setDataJson] = useState<{
    title?: string;
    message?: string;
    url?: string;
  } | null>(null);
  const [metaData, setMetaData] = useState<{
    description?: string;
    Keywords?: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    if (!donationInfo) return;
    if (!donationInfo.DataJson) return;

    try {
      const jsonData = JSON.parse(String(donationInfo.DataJson));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDataJson(jsonData);
      getMetadata(jsonData.url).then(setMetaData);
    } catch {
      // JSON parse error - ignore
    }
  }, [donationInfo]);

  if (!Number.isInteger(id) || id < 0) {
    return (
      <PageShell variant="data" backdrop="signature">
        <div className={cn(detailPanelClass, 'mx-auto max-w-lg p-8 text-center')}>
          <p className="font-display text-lg font-semibold text-foreground">
            {t('detail.invalidId')}
          </p>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title={t('detail.title')}
            subtitle={t('detail.loadingSubtitle')}
            breadcrumbs={[
              { label: t('detail.breadcrumbHome'), href: '/' },
              { label: t('detail.breadcrumbContributions'), href: '/eth-contribution' },
              { label: `#${id}` },
            ]}
            className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
            align="left"
          />
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">{t('detail.loading')}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!donationInfo) {
    return (
      <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title={t('detail.title')}
            breadcrumbs={[
              { label: t('detail.breadcrumbHome'), href: '/' },
              { label: t('detail.breadcrumbContributions'), href: '/eth-contribution' },
              { label: `#${id}` },
            ]}
            className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
            align="left"
          />
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="font-medium text-foreground">{t('detail.notFound')}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={t('detail.title')}
          subtitle={t('detail.subtitle', { id })}
          breadcrumbs={[
            { label: t('detail.breadcrumbHome'), href: '/' },
            { label: t('detail.breadcrumbContributions'), href: '/eth-contribution' },
            { label: `#${id}` },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        <SectionCard
          sectionId="eth-donation-core"
          title={t('detail.contributionTitle')}
          description={t('detail.contributionDescription')}
        >
          <DefinitionList>
            <DetailRow label={t('detail.datetimeLabel')}>
              <a
                href={getExplorerUrl('tx', donationInfo.TxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={detailLinkClass}
              >
                <HydrationSafeDateTime timestamp={donationInfo.TimeStamp} locale={locale} />
              </a>
              <span className="mt-1 block text-xs text-muted-foreground">
                {t('detail.explorerHelp')}
              </span>
            </DetailRow>
            <DetailRow label={t('detail.contributorAddressLabel')}>
              <Link
                href={`/user/${donationInfo.DonorAddr}`}
                className={cn(detailLinkClass, 'font-mono text-[13px] break-all')}
              >
                {donationInfo.DonorAddr}
              </Link>
            </DetailRow>
            <DetailRow label={t('detail.cycleNumberLabel')}>
              <Link href={`/allocation/${donationInfo.RoundNum}`} className={detailLinkClass}>
                {t('detail.cycleValue', { cycle: donationInfo.RoundNum })}
              </Link>
            </DetailRow>
            <DetailRow label={t('detail.amountLabel')}>
              <span className="font-mono tabular-nums">
                {formatFixed(donationInfo.AmountEth, 2)} ETH
              </span>
            </DetailRow>
          </DefinitionList>
        </SectionCard>

        {dataJson ? (
          <SectionCard
            sectionId="eth-donation-json"
            title={t('detail.messageTitle')}
            description={t('detail.messageDescription')}
          >
            <DefinitionList>
              <DetailRow label={t('detail.titleLabel')}>{dataJson.title ?? '—'}</DetailRow>
              <DetailRow label={t('detail.messageLabel')}>{dataJson.message ?? '—'}</DetailRow>
              <DetailRow label={t('detail.urlLabel')}>
                {dataJson.url ? (
                  <a
                    href={dataJson.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(detailLinkClass, 'break-all')}
                  >
                    {dataJson.url}
                  </a>
                ) : (
                  '—'
                )}
              </DetailRow>
            </DefinitionList>
          </SectionCard>
        ) : null}

        {metaData?.description || metaData?.Keywords ? (
          <SectionCard
            sectionId="eth-donation-meta-text"
            title={t('detail.linkPreviewTitle')}
            description={t('detail.linkPreviewDescription')}
          >
            <DefinitionList>
              {metaData?.description ? (
                <DetailRow label={t('detail.metaDescriptionLabel')}>
                  {metaData.description}
                </DetailRow>
              ) : null}
              {metaData?.Keywords ? (
                <DetailRow label={t('detail.metaKeywordsLabel')}>{metaData.Keywords}</DetailRow>
              ) : null}
            </DefinitionList>
          </SectionCard>
        ) : null}

        {metaData?.image ? (
          <SectionCard
            sectionId="eth-donation-meta-image"
            title={t('detail.metaImageTitle')}
            description={t('detail.metaImageDescription')}
          >
            <div className="px-4 pb-5 pt-2 sm:px-5">
              <Image
                src={metaData.image}
                width={1200}
                height={675}
                alt={t('detail.metaImageAlt')}
                className="h-auto w-full rounded-lg border border-white/[0.06]"
                unoptimized
              />
            </div>
          </SectionCard>
        ) : null}
      </div>
    </PageShell>
  );
};

export default EthDonationDetailPage;
