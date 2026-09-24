'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAmount } from '@/utils/format';
import { useFormat } from '@/hooks/useFormat';
import { useCTStatistics, useDashboardInfo } from '@/hooks/useApiQuery';
import type { DashboardInfo } from '@/services/api/types';
import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonDetailRows, SkeletonTable } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { SectionShell } from '@/components/statistics/SectionShell';
import { StatisticsGroup } from '@/components/statistics/StatisticsGroup';
import { StatisticsItem } from '@/components/statistics/StatisticsItem';
import { DefinitionsDisclosure } from '@/components/statistics/DefinitionsDisclosure';
import { ReserveSplit } from '@/components/statistics/ReserveSplit';

import { CycleRhythm } from './CycleRhythm';
import { STATISTICS_SECTIONS, type StatisticsSectionDef } from './statistics-sections';

type SectionKey = StatisticsSectionDef['messageKey'];

/**
 * One entry of the section index: the page's name with an arrow, what it
 * covers, and its key figure at the foot. The whole card is the link, the
 * one box a region may draw.
 */
function SectionEntry({ section, figure }: { section: StatisticsSectionDef; figure: ReactNode }) {
  const t = useTranslations('statistics');
  return (
    <li className="min-w-0">
      <Link
        href={section.href}
        className={cn(
          'group flex h-full flex-col rounded-surface border border-rule px-5 py-4 no-underline',
          'transition-colors duration-fast hover:border-input hover:bg-surface',
        )}
      >
        <span className="flex items-center justify-between gap-4">
          <span className="type-title text-foreground">
            {t(`navigation.${section.messageKey}.label`)}
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-subtle transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
          />
        </span>
        <span className="mt-1 type-body-sm text-muted-foreground">
          {t(`hub.index.${section.messageKey}`)}
        </span>
        <span className="mt-auto pt-4 type-figure-sm text-foreground">{figure}</span>
      </Link>
    </li>
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

/**
 * Statistics hub body, under the header's figures (the active cycle and its
 * gestures, allocations distributed, NFTs imprinted, the contract balance):
 * this cycle's pulse and where its reserve goes, the section pages as an
 * index with a key figure each, and the protocol economy as three spec
 * sheets with one Definitions disclosure. No figure repeats the header.
 */
const StatisticsHubPanel = () => {
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const { data, isLoading, isError, refetch } = useDashboardInfo();
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

  if (isError || !data) {
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
              value={opened && opened > 0 ? <DateTime timestamp={opened} /> : count(null)}
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
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            <StatisticsItem
              title={metric('stellarSelectionEthDeposited')}
              value={eth(main.TotalRaffleEthDeposits)}
            />
            <StatisticsItem
              title={metric('stellarSelectionEthRetrieved')}
              value={eth(main.TotalRaffleEthWithdrawn)}
              caption={
                pendingRecipients > 0
                  ? t('hub.pendingRecipients', { count: pendingRecipients })
                  : undefined
              }
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
            'totalSignatureAllocationsDistributed',
            'stellarSelectionEthDeposited',
            'stellarSelectionEthRetrieved',
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
          ].map(definition)}
        />
      </SectionShell>
    </div>
  );
};

export default StatisticsHubPanel;
