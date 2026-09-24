'use client';

import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { ContributionIcon } from '@/lib/conceptIcons';
import { formatAddress } from '@/utils/format';
import { useDonationsWithInfoById } from '@/hooks/useApiQuery';
import { parseContributionNote } from '@/components/contributions/contributionNote';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { TxProofLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton, SkeletonDetailRows } from '@/components/ui/skeleton';

interface EthDonationDetailPageProps {
  id: number;
}

/** A label and its value on one hairline row; the value wraps under the label on phones. */
function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm text-foreground">{children}</dd>
    </div>
  );
}

function BackToAll() {
  const t = useTranslations('ethContribution.detail');
  return (
    <Link href="/eth-contribution" className="link inline-flex items-center gap-1.5 type-body-sm">
      {t('backToAll')}
      <ArrowRight aria-hidden className="size-3.5" />
    </Link>
  );
}

/**
 * One direct ETH contribution. The header leads with what a reader came for
 * — how much, from whom, in which cycle and when — and the body gives the
 * contributor's note as a pull quote, then the on-chain record with its
 * transaction. The note's link is shown, never fetched: opening a record
 * page does not make the visitor's browser call a stranger's server.
 */
const EthDonationDetailPage = ({ id }: EthDonationDetailPageProps) => {
  const t = useTranslations('ethContribution.detail');
  const valid = Number.isInteger(id) && id >= 0;
  const { data, isLoading, isError, refetch } = useDonationsWithInfoById(valid ? id : null);
  const trail = [{ label: t('breadcrumbContributions'), href: '/eth-contribution' }];

  if (!valid) {
    return (
      <LedgerPage
        width="narrow"
        header={<PageHeader section="records" breadcrumbs={trail} title={t('invalidId')} />}
      >
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<ContributionIcon aria-hidden />}
          title={t('invalidIdTitle')}
          description={t('invalidIdDescription')}
          action={<BackToAll />}
        />
      </LedgerPage>
    );
  }

  const pending = isLoading ? <Skeleton className="h-7 w-24" /> : null;
  const figures: PageHeaderFigure[] = [
    {
      id: 'amount',
      label: t('figures.amount'),
      value: data ? <Amount value={data.AmountEth} unit="ETH" /> : pending,
    },
    {
      id: 'from',
      label: t('figures.from'),
      value: data?.DonorAddr ? <AddressChip address={data.DonorAddr} /> : pending,
    },
    {
      id: 'cycle',
      label: t('figures.cycle'),
      value: data ? (
        <Link href={`/eth-contribution/round/${data.RoundNum}`} className="link-quiet">
          {t('cycleValue', { cycle: data.RoundNum })}
        </Link>
      ) : (
        pending
      ),
    },
    {
      id: 'date',
      label: t('figures.date'),
      value: data ? <DateTime timestamp={data.TimeStamp} year="always" /> : pending,
    },
  ];

  const header = (
    <PageHeader
      section="records"
      breadcrumbs={trail}
      title={t('title', { id })}
      subtitle={data ? t('lede', { cycle: data.RoundNum }) : undefined}
      figures={isError || (!isLoading && !data) ? undefined : figures}
    />
  );

  if (isError) {
    return (
      <LedgerPage width="narrow" header={header}>
        <ErrorState headingLevel={2} message={t('loadError')} onRetry={() => void refetch()} />
      </LedgerPage>
    );
  }

  if (isLoading) {
    return (
      <LedgerPage width="narrow" header={header}>
        <SkeletonDetailRows rows={5} />
      </LedgerPage>
    );
  }

  if (!data) {
    return (
      <LedgerPage width="narrow" header={header}>
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<ContributionIcon aria-hidden />}
          title={t('notFoundTitle', { id })}
          description={t('notFoundDescription')}
          action={<BackToAll />}
        />
      </LedgerPage>
    );
  }

  const note = parseContributionNote(data.DataJson);
  const noteHost = note.kind === 'note' && note.url ? new URL(note.url).host : null;

  return (
    <LedgerPage width="narrow" header={header}>
      {note.kind !== 'none' ? (
        <section aria-labelledby="contribution-note">
          <SectionHeader headingId="contribution-note" title={t('noteTitle')} />
          {note.kind === 'note' ? (
            <figure className="border-s-2 border-primary ps-5">
              {note.title ? (
                <p className="type-heading-3 text-foreground [overflow-wrap:anywhere]">
                  {note.title}
                </p>
              ) : null}
              {note.message ? (
                <blockquote className="mt-2 whitespace-pre-line type-body-lg text-foreground [overflow-wrap:anywhere]">
                  {note.message}
                </blockquote>
              ) : null}
              {note.url ? (
                <figcaption className="mt-4">
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    className="link inline-flex max-w-full items-center gap-1 type-body-sm [overflow-wrap:anywhere]"
                  >
                    {noteHost}
                    <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
                    <span className="sr-only">{t('opensInNewTab')}</span>
                  </a>
                </figcaption>
              ) : null}
            </figure>
          ) : (
            <pre className="whitespace-pre-wrap rounded-control bg-surface-sunken p-4 type-hash text-foreground">
              {note.text}
            </pre>
          )}
          <p className="mt-3 type-caption text-subtle">
            {note.kind === 'note' ? t('noteCaption') : t('noteRawCaption')}
          </p>
        </section>
      ) : null}

      <section aria-labelledby="contribution-record">
        <SectionHeader headingId="contribution-record" title={t('recordTitle')} />
        <dl className="divide-y divide-rule-faint border-y border-rule-faint">
          <SpecRow label={t('transactionLabel')}>
            <TxProofLink hash={data.TxHash} className="type-hash">
              {formatAddress(data.TxHash)}
            </TxProofLink>
          </SpecRow>
          <SpecRow label={t('datetimeLabel')}>
            <DateTime timestamp={data.TimeStamp} variant="full" seconds />
          </SpecRow>
          <SpecRow label={t('contributorAddressLabel')}>
            <AddressChip address={data.DonorAddr} variant="plain" display="responsive" />
          </SpecRow>
          <SpecRow label={t('cycleNumberLabel')}>
            <Link
              href={`/eth-contribution/round/${data.RoundNum}`}
              className="link-quiet inline-flex items-center gap-1.5"
            >
              {t('cycleLink', { cycle: data.RoundNum })}
              <ArrowRight aria-hidden className="size-3.5 text-subtle" />
            </Link>
          </SpecRow>
          <SpecRow label={t('recordLabel')}>
            <span className="type-mono">{t('recordValue', { id })}</span>
          </SpecRow>
        </dl>
      </section>
    </LedgerPage>
  );
};

export default EthDonationDetailPage;
