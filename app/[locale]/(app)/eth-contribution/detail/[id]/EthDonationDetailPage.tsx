'use client';

import { ArrowRight, ArrowUpRight, Link2Off, SearchX } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { formatAddress, formatCount } from '@/utils/format';
import { useDonationsWithInfoById } from '@/hooks/useApiQuery';
import { parseContributionNote } from '@/components/contributions/contributionNote';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { RecordRow } from '@/components/detail-page/RecordRow';
import { TxProofLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton, SkeletonDetailRows } from '@/components/ui/skeleton';

interface EthDonationDetailPageProps {
  id: number;
}

/** The way back to the ledger: a 44px row on phones, a text link from `sm`. */
function BackToAll() {
  const t = useTranslations('ethContribution.detail');
  return (
    <Link
      href="/eth-contribution"
      className="link inline-flex min-h-11 items-center gap-1.5 type-body-sm sm:min-h-6"
    >
      {t('backToAll')}
      <ArrowRight aria-hidden className="size-3.5" />
    </Link>
  );
}

/**
 * One direct ETH contribution. The header leads with what a reader came for
 * — how much, from whom, in which cycle and when, each said once on the
 * page — and the body gives the contributor's note as a pull quote, then the
 * on-chain record: its transaction and id. The note's link is shown, never
 * fetched: opening a record page does not make the visitor's browser call a
 * stranger's server.
 */
const EthDonationDetailPage = ({ id }: EthDonationDetailPageProps) => {
  const t = useTranslations('ethContribution.detail');
  const tCycle = useTranslations('ethContribution.cycle');
  const locale = useLocale();
  const valid = Number.isInteger(id) && id >= 0;
  const { data, isLoading, isError, refetch } = useDonationsWithInfoById(valid ? id : null);
  const trail = [{ label: t('breadcrumbContributions'), href: '/eth-contribution' }];

  // The states (an invalid link, a missing record, a failed read) stand on the
  // full content width, centred under the header, not in the record's column.
  if (!valid) {
    return (
      <LedgerPage
        header={<PageHeader section="records" breadcrumbs={trail} title={t('invalidId')} />}
      >
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<Link2Off aria-hidden />}
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
      // The contributor as hex at the figure's own size, not a 12px chip.
      id: 'from',
      label: t('figures.from'),
      value: data?.DonorAddr ? <AddressChip address={data.DonorAddr} variant="plain" /> : pending,
      size: 'md',
    },
    {
      id: 'cycle',
      label: t('figures.cycle'),
      value: data ? (
        // "Cycle 7", as a cycle reads everywhere; the link says where it leads
        // ("All contributions in cycle 7"), which a title attribute did not announce.
        <Link
          href={`/eth-contribution/round/${data.RoundNum}`}
          aria-label={t('cycleLink', { cycle: data.RoundNum })}
          title={t('cycleLink', { cycle: data.RoundNum })}
          className="link-quiet"
        >
          {tCycle('cycleLabel', { cycle: formatCount(data.RoundNum, locale) })}
        </Link>
      ) : (
        pending
      ),
    },
    {
      id: 'date',
      label: t('figures.date'),
      value: data ? <DateTime timestamp={data.TimeStamp} year="always" /> : pending,
      size: 'md',
    },
  ];

  // A record that does not exist is not titled as if it did. The server
  // answers a missing record with a 404; when its read failed, the figures
  // hold their place until the client read answers.
  const notFound = !data && !isLoading && !isError;
  const header = (
    <PageHeader
      section="records"
      breadcrumbs={trail}
      title={notFound ? t('notFoundHeading') : t('title', { id })}
      subtitle={data ? t('lede', { cycle: data.RoundNum }) : undefined}
      figures={isError || notFound ? undefined : figures}
    />
  );

  if (notFound) {
    return (
      <LedgerPage header={header}>
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<SearchX aria-hidden />}
          title={t('notFoundTitle', { id })}
          description={t('notFoundDescription')}
          action={<BackToAll />}
        />
      </LedgerPage>
    );
  }

  if (isError) {
    return (
      <LedgerPage header={header}>
        <ErrorState headingLevel={2} message={t('loadError')} onRetry={() => void refetch()} />
      </LedgerPage>
    );
  }

  if (!data) {
    return (
      <LedgerPage width="narrow" header={header}>
        <SkeletonDetailRows rows={2} />
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
          <RecordRow label={t('transactionLabel')}>
            <TxProofLink hash={data.TxHash} className="type-hash">
              {formatAddress(data.TxHash)}
            </TxProofLink>
          </RecordRow>
          <RecordRow label={t('recordLabel')}>
            <span className="type-mono">{t('recordValue', { id })}</span>
          </RecordRow>
        </dl>
      </section>
    </LedgerPage>
  );
};

export default EthDonationDetailPage;
