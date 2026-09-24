'use client';

import { useTranslations } from 'next-intl';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
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
import { CstSupplyHistory } from '@/components/statistics/CstSupplyHistory';
import AttachedNFTDistributionTable from '@/components/attachments/AttachedNFTDistributionTable';
import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';

/**
 * Token distribution: who holds the Cosmic Signature NFTs, who holds CST and
 * how concentrated it is, the CST supply over time, and the assets attached
 * to gestures. The header carries the holder counts and the supply.
 */
const TokensPanel = () => {
  const t = useTranslations('statistics');
  const format = useFormat();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo(undefined, {
    poll: false,
  });
  const cstDistributionQuery = useCSTDistribution();
  const ctBalanceQuery = useCTBalancesDistribution();
  const ctStatistics = useCTStatistics();

  const cstDistribution = (cstDistributionQuery.data ?? []) as TokenDistribution[];
  const ctBalanceDistribution = (ctBalanceQuery.data ?? []) as CTBalanceDistribution[];
  const supply = toFiniteNumber(ctStatistics.data?.TotalSupplyEth);
  const curRoundNum = dashboardData?.CurRoundNum ?? -1;

  return (
    <div data-testid="tokens-panel" className="space-y-12 sm:space-y-16">
      <StatsSection
        title={t('tokens.sections.nftDistribution')}
        tooltip={t('sectionTooltips.cosmicSignatureTokenDistribution')}
        isLoading={cstDistributionQuery.isLoading}
        isError={cstDistributionQuery.isError}
        onRetry={() => cstDistributionQuery.refetch()}
        isEmpty={cstDistribution.length === 0}
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
        isLoading={dashboardLoading}
        isEmpty={(dashboardData?.MainStats.DonatedTokenDistribution ?? []).length === 0}
        emptyTitle={t('tokens.empty.contractsTitle')}
      >
        <AttachedNFTDistributionTable
          list={dashboardData?.MainStats.DonatedTokenDistribution ?? []}
        />
      </StatsSection>

      <AttachedAssetsSection currentRoundNum={curRoundNum} />
    </div>
  );
};

export default TokensPanel;
