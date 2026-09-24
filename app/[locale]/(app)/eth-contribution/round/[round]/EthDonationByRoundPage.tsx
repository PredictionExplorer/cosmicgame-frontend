'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Link2Off } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { formatCount } from '@/utils/format';
import { useDashboardInfo, useDonationsBothByRound } from '@/hooks/useApiQuery';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import EthDonationTable, { type EthDonation } from '@/components/tables/EthDonationTable';
import { Amount } from '@/components/ui/amount';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface EthDonationByRoundPageProps {
  round: number;
}

/** Distinct contributor addresses, case-insensitively. */
function countContributors(rows: readonly EthDonation[]): number {
  return new Set(rows.map((row) => row.DonorAddr.toLowerCase())).size;
}

/**
 * One cycle's direct ETH contributions: the count, total and contributors in
 * the header, the neighbouring cycles one step away, the cycle's own page
 * (its allocation, or the live cycle), and the ledger in one reading column
 * (a cycle's ledger is always short). A cycle without contributions says so
 * once, in the ledger, in the past tense once the cycle has closed.
 */
const EthDonationByRoundPage = ({ round }: EthDonationByRoundPageProps) => {
  const t = useTranslations('ethContribution.cycle');
  const locale = useLocale();
  const valid = Number.isInteger(round) && round >= 0;
  const { data, isLoading, isError, refetch } = useDonationsBothByRound(valid ? round : -1);
  const { data: dashboard } = useDashboardInfo(undefined, { poll: false });
  const liveCycle = typeof dashboard?.CurRoundNum === 'number' ? dashboard.CurRoundNum : null;
  const trail = [{ label: t('breadcrumbContributions'), href: '/eth-contribution' }];

  if (!valid) {
    return (
      <LedgerPage
        header={<PageHeader section="records" breadcrumbs={trail} title={t('invalidNumber')} />}
      >
        <EmptyState
          variant="page"
          headingLevel={2}
          icon={<Link2Off aria-hidden />}
          title={t('invalidTitle')}
          description={t('invalidDescription')}
          action={
            <Link
              href="/eth-contribution"
              className="link inline-flex min-h-11 items-center gap-1.5 sm:min-h-6"
            >
              {t('breadcrumbContributions')}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        />
      </LedgerPage>
    );
  }

  const rows = (data ?? []) as EthDonation[];
  const ready = !isLoading && !isError;
  const pending = isLoading ? <Skeleton className="h-7 w-20" /> : null;
  const total = rows.reduce(
    (sum, row) => sum + (Number.isFinite(row.AmountEth) ? row.AmountEth : 0),
    0,
  );
  const figures: PageHeaderFigure[] = [
    {
      id: 'count',
      label: t('figures.count'),
      value: ready ? formatCount(rows.length, locale) : pending,
    },
    {
      id: 'total',
      label: t('figures.total'),
      value: ready ? <Amount value={total} unit="ETH" /> : pending,
    },
    {
      id: 'contributors',
      label: t('figures.contributors'),
      value: ready ? formatCount(countContributors(rows), locale) : pending,
    },
  ];

  // The neighbours that exist: never below cycle 0, never past the live cycle.
  const previous = round > 0 ? round - 1 : null;
  const next = liveCycle === null || round < liveCycle ? round + 1 : null;
  const isLive = liveCycle !== null && round === liveCycle;
  const cycleHref = isLive ? '/current-cycle' : `/allocation/${round}`;

  const neighbours = (
    <nav aria-label={t('otherCycles')} className="flex flex-wrap items-center gap-2">
      {previous !== null ? (
        <Link
          href={`/eth-contribution/round/${previous}`}
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'px-3' })}
        >
          <ChevronLeft aria-hidden />
          <span className="sr-only">{t('previous')}: </span>
          {t('cycleLabel', { cycle: previous })}
        </Link>
      ) : null}
      {next !== null ? (
        <Link
          href={`/eth-contribution/round/${next}`}
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'px-3' })}
        >
          <span className="sr-only">{t('next')}: </span>
          {t('cycleLabel', { cycle: next })}
          <ChevronRight aria-hidden />
        </Link>
      ) : null}
    </nav>
  );

  // An empty ledger says so itself; three zeros above it would say it again.
  const empty = ready && rows.length === 0;
  const closed = liveCycle !== null && round < liveCycle;

  const header = (
    <PageHeader
      section="records"
      breadcrumbs={trail}
      title={t('title', { cycle: round })}
      subtitle={t('lede', { cycle: round })}
      figures={empty ? undefined : figures}
      actions={neighbours}
      meta={
        liveCycle !== null && round <= liveCycle ? (
          <Link
            href={cycleHref}
            className="link-quiet inline-flex min-h-11 items-center gap-1.5 text-muted-foreground sm:min-h-6"
          >
            {isLive ? t('viewLive') : t('viewAllocation', { cycle: round })}
            <ArrowRight aria-hidden className="size-3.5 text-subtle" />
          </Link>
        ) : undefined
      }
    />
  );

  return (
    <LedgerPage width="narrow" header={header}>
      <EthDonationTable
        list={rows}
        showCycle={false}
        loading={isLoading}
        error={isError ? t('loadError') : undefined}
        onRetry={() => void refetch()}
        emptyDescription={t(closed ? 'emptyDescriptionPast' : 'emptyDescription', {
          cycle: round,
        })}
      />
    </LedgerPage>
  );
};

export default EthDonationByRoundPage;
