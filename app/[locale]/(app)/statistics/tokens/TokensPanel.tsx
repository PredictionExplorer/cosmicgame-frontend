'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
import { useHydrated } from '@/hooks/useHydrated';
import {
  useCSTDistribution,
  useCTBalancesDistribution,
  useCTStatistics,
  useDashboardInfo,
} from '@/hooks/useApiQuery';
import type { CTBalanceDistribution, TokenDistribution } from '@/services/api/types';
import { StatsSection } from '@/components/statistics/StatsSection';
import { AttachedAssetsSection } from '@/components/statistics/AttachedAssetsSection';
import { CstHoldersLedger } from '@/components/statistics/CstHoldersLedger';
import { SkeletonChart } from '@/components/ui/skeleton';
import AttachedNFTDistributionTable from '@/components/attachments/AttachedNFTDistributionTable';
import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';

/**
 * The supply chart is the page's only Recharts figure, below two ledgers: it
 * loads in its own chunk after the page, behind a skeleton of its height, so
 * the charting library is not part of the page's first load.
 */
const CstSupplyHistory = dynamic(
  () => import('@/components/statistics/CstSupplyHistory').then((m) => m.CstSupplyHistory),
  { ssr: false, loading: () => <SkeletonChart height={300} bars={24} /> },
);

/**
 * Token distribution: who holds the Cosmic Signature NFTs, who holds CST and
 * how concentrated it is, the CST supply over time, and the assets attached
 * to gestures. The header carries the holder counts and the supply. The
 * dashboard is read after hydration only, so the first client render matches
 * the server's.
 */
const TokensPanel = () => {
  const t = useTranslations('statistics');
  const format = useFormat();
  const hydrated = useHydrated();
  const dashboardQuery = useDashboardInfo(undefined, { poll: false });
  const dashboardData = hydrated ? dashboardQuery.data : undefined;
  const dashboardLoading = !hydrated || dashboardQuery.isLoading;
  const cstDistributionQuery = useCSTDistribution();
  const ctBalanceQuery = useCTBalancesDistribution();
  const ctStatistics = useCTStatistics();

  const cstDistribution = (cstDistributionQuery.data ?? []) as TokenDistribution[];
  const ctBalanceDistribution = (ctBalanceQuery.data ?? []) as CTBalanceDistribution[];
  const supply = toFiniteNumber(ctStatistics.data?.TotalSupplyEth);
  const curRoundNum = dashboardData?.CurRoundNum ?? -1;
  const imprinted = toFiniteNumber(dashboardData?.MainStats.NumCSTokenMints) ?? 0;
  const attachedContracts = dashboardData?.MainStats.DonatedTokenDistribution ?? [];

  return (
    <div data-testid="tokens-panel" className="space-y-12 sm:space-y-16">
      <StatsSection
        title={t('tokens.sections.nftDistribution')}
        tooltip={t('sectionTooltips.cosmicSignatureTokenDistribution')}
        isLoading={cstDistributionQuery.isLoading}
        isError={cstDistributionQuery.isError}
        onRetry={() => cstDistributionQuery.refetch()}
        isEmpty={cstDistribution.length === 0}
        knownNonEmpty={imprinted > 0}
        emptyTitle={t('tokens.empty.nftTitle')}
        emptyDescription={t('tokens.empty.nftDescription')}
      >
        <CSTokenDistributionTable list={cstDistribution} />
      </StatsSection>

      <StatsSection
        title={t('tokens.sections.cstDistribution')}
        tooltip={t('sectionTooltips.cstBalanceDistribution')}
        description={
          ctBalanceDistribution.length > 0
            ? supply === null
              ? t('tokens.holders.summaryNoSupply', { count: ctBalanceDistribution.length })
              : t('tokens.holders.summary', {
                  count: ctBalanceDistribution.length,
                  supply: format.amount(supply, { unit: 'CST', context: 'hero' }),
                })
            : undefined
        }
        isLoading={ctBalanceQuery.isLoading}
        isError={ctBalanceQuery.isError}
        onRetry={() => ctBalanceQuery.refetch()}
        isEmpty={ctBalanceDistribution.length === 0}
        knownNonEmpty={(supply ?? 0) > 0}
        emptyTitle={t('tokens.empty.cstTitle')}
        emptyDescription={t('tokens.empty.cstDescription')}
      >
        <CstHoldersLedger list={ctBalanceDistribution} supply={supply} />
      </StatsSection>

      <StatsSection
        title={t('tokens.sections.totalSupply')}
        tooltip={t('sectionTooltips.cstTotalSupply')}
      >
        <CstSupplyHistory label={t('tokens.sections.totalSupply')} />
      </StatsSection>

      <StatsSection
        title={t('tokens.sections.attachedDistribution')}
        tooltip={t('sectionTooltips.attachedTokenDistribution')}
        defaultOpen={false}
        lazy
        collapsedSummary={
          dashboardData ? t('tokens.attachedContracts', { count: attachedContracts.length }) : null
        }
        isLoading={dashboardLoading}
        isEmpty={attachedContracts.length === 0}
        emptyTitle={t('tokens.empty.contractsTitle')}
      >
        <AttachedNFTDistributionTable list={attachedContracts} />
      </StatsSection>

      <AttachedAssetsSection currentRoundNum={curRoundNum} />
    </div>
  );
};

export default TokensPanel;
