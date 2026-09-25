'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAmount } from '@/utils/format';
import { useFormat } from '@/hooks/useFormat';
import { useHydrated } from '@/hooks/useHydrated';
import { useCTStatistics, useDashboardInfo } from '@/hooks/useApiQuery';
import type { DashboardInfo } from '@/services/api/types';
import { Amount } from '@/components/ui/amount';
import { DateTime, useTimeZoneLabel } from '@/components/ui/date-time';
import { ErrorState } from '@/components/ui/error-state';
import { LiveStatus } from '@/components/ui/live-status';
import { SkeletonDetailRows, SkeletonTable } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { SiteLink } from '@/components/layout/SiteLink';
import { SectionShell } from '@/components/statistics/SectionShell';
import { StatisticsGroup } from '@/components/statistics/StatisticsGroup';
import { StatisticsItem } from '@/components/statistics/StatisticsItem';
import { DefinitionsDisclosure } from '@/components/statistics/DefinitionsDisclosure';
import { ReserveSplit } from '@/components/statistics/ReserveSplit';

import { allocationsWalletEth } from './allocationsWallet';
import { CycleRhythm } from './CycleRhythm';
import { STATISTICS_SECTIONS, type StatisticsSectionDef } from './statistics-sections';

type SectionKey = StatisticsSectionDef['messageKey'];

/**
 * One row of the section index: the page's name over what it covers, its
 * key figure on the right, and an arrow. The whole row is the link; rows are
 * divided by hairlines like a ledger, with the same inset as a table cell.
 * On a phone the figure moves under the description. The row prefetches its
 * page on hover or focus, not on sight (each page carries its own charts).
 */
function SectionEntry({ section, figure }: { section: StatisticsSectionDef; figure: ReactNode }) {
  const t = useTranslations('statistics');
  return (
    <li className="border-b border-rule-faint">
      <SiteLink
        href={section.href}
        kind="internal"
        prefetch="intent"
        className={cn(
          'group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1.5 px-4 py-4 no-underline sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:py-5',
          'focus-ring-inset transition-colors duration-fast hover:bg-surface',
        )}
      >
        <span className="col-start-1 row-start-1 min-w-0">
          <span className="block type-title text-foreground">
            {t(`navigation.${section.messageKey}.label`)}
          </span>
          <span className="mt-0.5 block type-body-sm text-muted-foreground">
            {t(`hub.index.${section.messageKey}`)}
          </span>
        </span>
        <span className="col-start-1 row-start-2 type-figure-sm text-foreground sm:col-start-2 sm:row-start-1 sm:text-right">
          {figure}
        </span>
        <ArrowRight
          aria-hidden
          className="col-start-2 row-span-2 row-start-1 size-4 shrink-0 text-subtle transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none sm:col-start-3 sm:row-span-1"
        />
      </SiteLink>
    </li>
  );
}

/**
 * A moment in UTC, as every other page prints it (the same opening reads the
 * same here and on the current cycle), with the zone named inline so the
 * figure never needs a caption: "Aug 12, 00:38 UTC".
 */
function LocalMoment({ timestamp }: { timestamp: number }) {
  const zone = useTimeZoneLabel();
  return (
    <DateTime timestamp={timestamp}>
      {(value) => (
        <>
          {value} <span className="text-subtle">{zone}</span>
        </>
      )}
    </DateTime>
  );
}

/** The dashboard's all-time totals, with the gesture total the typed shape leaves out. */
type MainStatsWire = DashboardInfo['MainStats'] & { TotalBids?: number };

/**
 * Each section page's key figure for the index, from the dashboard the hub
 * already reads: a count in words ("37 participants"), or the unknown dash.
 */
function sectionFigures(
  data: DashboardInfo,
  cstSupply: number | null | undefined,
  t: ReturnType<typeof useTranslations>,
  unknown: ReactNode,
  locale: string,
): Record<Exclude<SectionKey, 'overview'>, ReactNode> {
  const main = data.MainStats as MainStatsWire;
  const count = (key: string, value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : t(`hub.figures.${key}`, { count: numeric });
  };
  const cstAnchored = toFiniteNumber(main.StakeStatisticsCST?.TotalTokensStaked);
  const rwlkAnchored = toFiniteNumber(main.StakeStatisticsRWalk?.TotalTokensStaked);
  return {
    participation: count('participants', main.NumUniqueBidders),
    tokens:
      cstSupply === undefined
        ? null
        : cstSupply === null
          ? unknown
          : t('hub.figures.supply', {
              amount: formatAmount(cstSupply, { unit: 'CST', context: 'hero', locale }),
            }),
    anchoring: count(
      'anchored',
      cstAnchored === null || rwlkAnchored === null ? null : cstAnchored + rwlkAnchored,
    ),
    activity: count('gestures', main.TotalBids),
    performance: count('cycles', data.CurRoundNum),
  };
}

/** Pages a reader of the hub goes on to, listed once at its end. */
const RELATED_LINKS = [
  { href: '/how-it-works', key: 'howItWorks' },
  { href: '/contracts', key: 'contracts' },
  { href: '/faq', key: 'faq' },
] as const;

/**
 * Statistics hub body, under the header's figures (the active cycle and its
 * gestures, allocations distributed, NFTs imprinted, the contract balance):
 * this cycle's pulse and where its reserve goes, the section pages as an
 * index with a key figure each, the protocol economy as three spec sheets
 * with one Definitions disclosure, and the related pages last, so the
 * section tabs sit right under the header's figures. No figure repeats the
 * header. The dashboard is read after hydration only: the server renders the
 * skeleton, and the first client render must match it.
 */
const StatisticsHubPanel = () => {
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const hydrated = useHydrated();
  const dashboard = useDashboardInfo();
  const { isError, refetch } = dashboard;
  const data = hydrated ? dashboard.data : undefined;
  const isLoading = !hydrated || dashboard.isLoading;
  const ctStatistics = useCTStatistics();
  const cstSupply = ctStatistics.isLoading
    ? undefined
    : toFiniteNumber(ctStatistics.data?.TotalSupplyEth);

  if (isLoading) {
    return (
      <div data-testid="statistics-hub-loading" className="space-y-12">
        <SkeletonDetailRows rows={3} />
        <SkeletonTable rows={5} columns={2} />
      </div>
    );
  }

  // A failed background poll keeps the last reading (TanStack Query sets
  // isError but keeps data): the error replaces the hub only when nothing
  // ever loaded, and a stale reading says so beside the cycle's title.
  if (!data) {
    return (
      <ErrorState
        headingLevel={2}
        title={t('hub.loadErrorTitle')}
        message={t('hub.loadErrorMessage')}
        onRetry={() => refetch()}
      />
    );
  }

  const main = data.MainStats;
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const figures = sectionFigures(data, cstSupply, t, unknown, format.locale);
  const eth = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : <Amount value={numeric} unit="ETH" />;
  };
  const cst = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : <Amount value={numeric} unit="CST" />;
  };
  const count = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : format.count(numeric);
  };
  /** A caption that counts records ("8 transactions"), only when the count was read. */
  const countCaption = (key: string, value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? undefined : t(key, { count: numeric });
  };
  const opened = toFiniteNumber(data.TsRoundStart);
  const wallet = allocationsWalletEth(main);
  const pendingRecipients = toFiniteNumber(main.NumWinnersWithPendingRaffleWithdrawal) ?? 0;
  const metric = (key: string) => t(`metrics.${key}.label`);
  const definition = (key: string) => ({
    term: t(`metrics.${key}.label`),
    definition: t(`metrics.${key}.tooltip`),
  });

  return (
    <div data-testid="statistics-hub" className="space-y-12 sm:space-y-16">
      <SectionShell
        title={t('hub.cycle.title', { cycle: data.CurRoundNum })}
        description={isError ? <LiveStatus variant="inline" /> : undefined}
        actions={
          <Link
            href="/current-cycle"
            className="link-quiet group inline-flex min-h-11 items-center gap-1.5 type-label text-foreground sm:min-h-8"
          >
            {t('hub.cycle.open')}
            <ArrowRight
              aria-hidden
              className="size-3.5 text-subtle transition-colors duration-fast group-hover:text-foreground"
            />
          </Link>
        }
      >
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <dl className="min-w-0 self-start border-t border-rule">
            <StatisticsItem
              title={t('hub.cycle.opened')}
              value={opened && opened > 0 ? <LocalMoment timestamp={opened} /> : count(null)}
            />
            <StatisticsItem
              title={metric('ethInGesturesCurrentCycle')}
              value={eth(data.CurRoundStats?.TotalEthInBidsEth)}
            />
            <StatisticsItem
              title={metric('cstConsumedCurrentCycle')}
              value={cst(data.CurRoundStats?.TotalCstInBidsEth)}
            />
          </dl>
          <CycleRhythm />
        </div>
        <div className="mt-10 border-t border-rule-faint pt-8">
          <h3 className="type-title text-foreground">{t('hub.cycle.splitTitle')}</h3>
          <p className="mt-1 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
            {t('hub.cycle.splitDescription')}
          </p>
          <ReserveSplit data={data} className="mt-5" />
        </div>
      </SectionShell>

      <SectionShell title={t('hub.exploreTitle')}>
        <nav aria-label={t('hub.exploreAria')}>
          <ul className="border-t border-rule">
            {STATISTICS_SECTIONS.map((section) => (
              <SectionEntry
                key={section.slug}
                section={section}
                figure={figures[section.messageKey as Exclude<SectionKey, 'overview'>]}
              />
            ))}
          </ul>
        </nav>
      </SectionShell>

      <SectionShell title={t('hub.protocolEconomyTitle')}>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-3">
          <StatisticsGroup title={t('groups.allocationEconomy.label')}>
            <StatisticsItem
              title={metric('totalSignatureAllocationsDistributed')}
              value={eth(data.TotalPrizesPaidAmountEth)}
            />
            {/* The Allocations Wallet's two tracks, then what left it across both: same scope. */}
            <StatisticsItem
              title={metric('stellarSelectionEthDeposited')}
              value={eth(wallet.stellarDeposited)}
            />
            <StatisticsItem
              title={metric('chronoWarriorEthDeposited')}
              value={eth(wallet.chronoDeposited)}
            />
            <StatisticsItem
              title={metric('allocationsWalletEthRetrieved')}
              value={eth(wallet.retrieved)}
              caption={
                pendingRecipients > 0
                  ? t('hub.pendingRecipients', { count: pendingRecipients })
                  : undefined
              }
            />
            <StatisticsItem
              title={t('anchoringPage.stats.totalDistributions')}
              value={eth(main.StakeStatisticsCST?.TotalRewardEth)}
              href="/anchoring"
            />
            <StatisticsItem
              title={metric('outreachCstAllocated')}
              value={cst(main.TotalMktRewardsEth)}
              caption={countCaption('hub.outreachTransactions', main.NumMktRewards)}
              href="/marketing"
            />
          </StatisticsGroup>

          <StatisticsGroup title={t('groups.tokenEconomy.label')}>
            <StatisticsItem
              title={metric('totalSupplyErc20')}
              value={cstSupply === undefined ? count(null) : cst(cstSupply)}
            />
            <StatisticsItem
              title={metric('totalCstConsumed')}
              value={cst(main.TotalCSTConsumedEth)}
            />
            <StatisticsItem title={metric('cstGestures')} value={count(main.NumBidsCST)} />
            <StatisticsItem
              title={metric('randomWalkNftsUsed')}
              value={count(data.NumRwalkTokensUsed)}
              href="/used-rwlk-nfts"
            />
            <StatisticsItem
              title={metric('namedTokens')}
              value={count(main.TotalNamedTokens)}
              href="/named-nfts"
            />
          </StatisticsGroup>

          <StatisticsGroup title={t('groups.publicGoods.label')}>
            <StatisticsItem
              title={metric('publicGoodsBalance')}
              value={eth(data.CharityBalanceEth)}
            />
            <StatisticsItem
              title={metric('protocolContributions')}
              value={eth(main.SumCosmicGameDonationsEth)}
              caption={countCaption('hub.contributionCount', main.NumCosmicGameDonations)}
              href="/public-goods-contributions-cg"
            />
            <StatisticsItem
              title={metric('voluntaryContributions')}
              value={eth(data.SumVoluntaryDonationsEth)}
              caption={countCaption('hub.contributionCount', data.NumVoluntaryDonations)}
              href="/public-goods-contributions-voluntary"
            />
            <StatisticsItem
              title={metric('totalPublicGoodsRetrieved')}
              value={eth(main.SumWithdrawals)}
              caption={countCaption('hub.retrievalCount', main.NumWithdrawals)}
              href="/public-goods-retrievals"
            />
            <StatisticsItem
              title={metric('totalContributedEth')}
              value={eth(main.TotalEthDonatedAmountEth)}
              href="/eth-contribution"
            />
            <StatisticsItem
              title={metric('attachedNfts')}
              value={count(data.NumDonatedNFTs)}
              href="/attached-nfts"
            />
          </StatisticsGroup>
        </div>

        <DefinitionsDisclosure
          className="mt-10"
          label={t('shared.definitions')}
          items={[
            ...[
              'totalSignatureAllocationsDistributed',
              'stellarSelectionEthDeposited',
              'chronoWarriorEthDeposited',
              'allocationsWalletEthRetrieved',
            ].map(definition),
            {
              term: t('anchoringPage.stats.totalDistributions'),
              definition: t('anchoringTooltips.cstTotalAnchorDistributions'),
            },
            ...[
              'outreachCstAllocated',
              'totalSupplyErc20',
              'totalCstConsumed',
              'cstGestures',
              'randomWalkNftsUsed',
              'namedTokens',
              'publicGoodsBalance',
              'protocolContributions',
              'voluntaryContributions',
              'totalPublicGoodsRetrieved',
              'totalContributedEth',
              'attachedNfts',
            ].map(definition),
          ]}
        />
      </SectionShell>

      {/* A quiet list, not a section of its own: a small label, then the links. */}
      <section aria-labelledby="statistics-related" className="border-t border-rule pt-8">
        <h2 id="statistics-related" className="type-label text-subtle">
          {t('hub.relatedTitle')}
        </h2>
        <nav aria-label={t('hub.seo.relatedPagesAria')} className="mt-3">
          <ul className="flex flex-wrap gap-x-8 gap-y-1">
            {RELATED_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-quiet group inline-flex min-h-11 items-center gap-1.5 type-body-sm text-foreground sm:min-h-8"
                >
                  {t(`hub.seo.links.${link.key}`)}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 text-subtle transition-colors duration-fast group-hover:text-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </div>
  );
};

export default StatisticsHubPanel;
