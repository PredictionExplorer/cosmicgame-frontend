'use client';

import { Coins, Gift, Layers, TrendingUp, Users } from 'lucide-react';

import { statisticsCopy } from '@/content/statistics-copy';

import {
  useCSTDistribution,
  useCTBalancesDistribution,
  useDashboardInfo,
} from '@/hooks/useApiQuery';
import type { CTBalanceDistribution, TokenDistribution } from '@/services/api/types';
import { StatCard } from '@/components/ui/stat-card';
import { StatsSection } from '@/components/statistics/StatsSection';
import { AttachedAssetsSection } from '@/components/statistics/AttachedAssetsSection';
import AttachedNFTDistributionTable from '@/components/attachments/AttachedNFTDistributionTable';
import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';
import { CTBalanceDistributionTable } from '@/components/tokens/CTBalanceDistributionTable';
import { CTBalanceDistributionChart } from '@/components/tokens/CTBalanceDistributionChart';
import { CSTTotalSupplyHistorySection } from '@/components/tokens/CSTTotalSupplyHistorySection';

/** Token distribution tables, CST supply history, and attached assets. */
const TokensPanel = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardInfo(undefined, {
    poll: false,
  });
  const cstDistributionQuery = useCSTDistribution();
  const ctBalanceQuery = useCTBalancesDistribution();

  const cstDistribution = (cstDistributionQuery.data ?? []) as TokenDistribution[];
  const ctBalanceDistribution = (ctBalanceQuery.data ?? []) as CTBalanceDistribution[];
  const curRoundNum = dashboardData?.CurRoundNum ?? -1;

  return (
    <div data-testid="tokens-panel">
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatCard
          label={statisticsCopy.metrics.cosmicSignatureNftHolders.label}
          value={cstDistribution.length}
          icon={<Users className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.cosmicSignatureNftHolders.tooltip}
          loading={cstDistributionQuery.isLoading}
          featured
        />
        <StatCard
          label={statisticsCopy.metrics.cstErc20Holders.label}
          value={ctBalanceDistribution.length}
          icon={<Coins className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.cstErc20Holders.tooltip}
          loading={ctBalanceQuery.isLoading}
        />
        <StatCard
          label={statisticsCopy.metrics.attachedNfts.label}
          value={Number(dashboardData?.NumDonatedNFTs ?? 0)}
          icon={<Gift className="h-4 w-4" />}
          tooltip={statisticsCopy.metrics.attachedNfts.tooltip}
          loading={dashboardLoading}
          featured
        />
      </div>

      <div className="space-y-8">
        <StatsSection
          title="Cosmic Signature NFT (ERC-721)"
          tooltip={statisticsCopy.sections.cosmicSignatureTokenDistribution}
          icon={<Layers className="h-3.5 w-3.5" />}
          isLoading={cstDistributionQuery.isLoading}
          isError={cstDistributionQuery.isError}
          onRetry={() => cstDistributionQuery.refetch()}
          isEmpty={cstDistribution.length === 0}
          emptyTitle="No Cosmic Signature NFTs imprinted yet"
          emptyDescription="Owner distribution appears here once NFTs are imprinted."
        >
          <CSTokenDistributionTable list={cstDistribution} />
        </StatsSection>

        <StatsSection
          title="CST (ERC-20) Balance Distribution"
          tooltip={statisticsCopy.sections.cstBalanceDistribution}
          icon={<Coins className="h-3.5 w-3.5" />}
          isLoading={ctBalanceQuery.isLoading}
          isError={ctBalanceQuery.isError}
          onRetry={() => ctBalanceQuery.refetch()}
          isEmpty={ctBalanceDistribution.length === 0}
          emptyTitle="No CST balances yet"
          emptyDescription="Wallet balance distribution appears here once CST is in circulation."
        >
          <CTBalanceDistributionChart list={ctBalanceDistribution} />
          <div className="mt-4">
            <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
          </div>
        </StatsSection>

        <StatsSection
          title="CST Total Supply"
          tooltip={statisticsCopy.sections.cstTotalSupply}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        >
          <CSTTotalSupplyHistorySection />
        </StatsSection>

        <StatsSection
          title="Attached Token Distribution"
          tooltip={statisticsCopy.sections.attachedTokenDistribution}
          icon={<Gift className="h-3.5 w-3.5" />}
          defaultOpen={false}
          lazy
          isLoading={dashboardLoading}
          isEmpty={(dashboardData?.MainStats.DonatedTokenDistribution ?? []).length === 0}
          emptyTitle="No attached ERC-721 contracts yet"
        >
          <AttachedNFTDistributionTable
            list={dashboardData?.MainStats.DonatedTokenDistribution ?? []}
          />
        </StatsSection>

        <AttachedAssetsSection currentRoundNum={curRoundNum} />
      </div>
    </div>
  );
};

export default TokensPanel;
