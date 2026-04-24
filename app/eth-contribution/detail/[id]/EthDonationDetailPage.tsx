'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { getExplorerUrl, convertTimestampToDateTime, getMetadata } from '@/utils';

import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { useDonationsWithInfoById } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

interface EthDonationDetailPageProps {
  id: number;
}

const EthDonationDetailPage = ({ id }: EthDonationDetailPageProps) => {
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

  if (id < 0) {
    return (
      <MainWrapper>
        <div className={cn(detailPanelClass, 'mx-auto max-w-lg p-8 text-center')}>
          <p className="font-display text-lg font-semibold text-foreground">
            Invalid Contribution Id
          </p>
        </div>
      </MainWrapper>
    );
  }

  if (loading) {
    return (
      <MainWrapper className="max-sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Direct ETH Contribution Detail"
            subtitle="Loading contribution…"
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'ETH contributions', href: '/eth-contribution' },
              { label: `#${id}` },
            ]}
            className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
            align="left"
          />
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainWrapper>
    );
  }

  if (!donationInfo) {
    return (
      <MainWrapper className="max-sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Direct ETH Contribution Detail"
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'ETH contributions', href: '/eth-contribution' },
              { label: `#${id}` },
            ]}
            className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
            align="left"
          />
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="font-medium text-foreground">Contribution not found.</p>
          </div>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Direct ETH Contribution Detail"
          subtitle={`Contribution #${id}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'ETH contributions', href: '/eth-contribution' },
            { label: `#${id}` },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        <SectionCard
          sectionId="eth-donation-core"
          title="Contribution"
          description="On-chain contribution record and cycle context."
        >
          <DefinitionList>
            <DetailRow label="Contribution datetime">
              <a
                href={getExplorerUrl('tx', donationInfo.TxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={detailLinkClass}
              >
                {convertTimestampToDateTime(donationInfo.TimeStamp)}
              </a>
              <span className="mt-1 block text-xs text-muted-foreground">
                Opens the transaction on the block explorer
              </span>
            </DetailRow>
            <DetailRow label="Contributor address">
              <Link
                href={`/user/${donationInfo.DonorAddr}`}
                className={cn(detailLinkClass, 'font-mono text-[13px] break-all')}
              >
                {donationInfo.DonorAddr}
              </Link>
            </DetailRow>
            <DetailRow label="Cycle number">
              <Link href={`/allocation/${donationInfo.RoundNum}`} className={detailLinkClass}>
                Cycle {donationInfo.RoundNum}
              </Link>
            </DetailRow>
            <DetailRow label="Amount">
              <span className="font-mono tabular-nums">
                {donationInfo.AmountEth.toFixed(2)} ETH
              </span>
            </DetailRow>
          </DefinitionList>
        </SectionCard>

        {dataJson ? (
          <SectionCard
            sectionId="eth-donation-json"
            title="Contributor message"
            description="Structured fields from the contribution payload."
          >
            <DefinitionList>
              <DetailRow label="Title">{dataJson.title ?? '—'}</DetailRow>
              <DetailRow label="Message">{dataJson.message ?? '—'}</DetailRow>
              <DetailRow label="URL">
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
            title="Link preview"
            description="Metadata fetched from the contributor URL."
          >
            <DefinitionList>
              {metaData?.description ? (
                <DetailRow label="Meta description">{metaData.description}</DetailRow>
              ) : null}
              {metaData?.Keywords ? (
                <DetailRow label="Meta keywords">{metaData.Keywords}</DetailRow>
              ) : null}
            </DefinitionList>
          </SectionCard>
        ) : null}

        {metaData?.image ? (
          <SectionCard
            sectionId="eth-donation-meta-image"
            title="Meta image"
            description="Open Graph or social preview image."
          >
            <div className="px-4 pb-5 pt-2 sm:px-5">
              <Image
                src={metaData.image}
                width={1200}
                height={675}
                alt="Meta image"
                className="h-auto w-full rounded-lg border border-white/[0.06]"
                unoptimized
              />
            </div>
          </SectionCard>
        ) : null}
      </div>
    </MainWrapper>
  );
};

export default EthDonationDetailPage;
