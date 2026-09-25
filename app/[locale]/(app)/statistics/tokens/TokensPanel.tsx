'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
import { useHydrated } from '@/hooks/useHydrated';
import { useCTBalancesDistribution, useCTStatistics, useDashboardInfo } from '@/hooks/useApiQuery';
import type { CTBalanceDistribution } from '@/services/api/types';
import { StatsSection } from '@/components/statistics/StatsSection';
import { AttachedAssetsSection } from '@/components/statistics/AttachedAssetsSection';
import { CstHoldersLedger } from '@/components/statistics/CstHoldersLedger';
import { DefinitionsDisclosure } from '@/components/statistics/DefinitionsDisclosure';
import { NftHoldersLedger } from '@/components/statistics/NftHoldersLedger';
import { useNftOwnership } from '@/components/statistics/useNftOwnership';
import { ChartFigureSkeleton } from '@/components/statistics/charts/ChartFigureSkeleton';
import AttachedNFTDistributionTable from '@/components/attachments/AttachedNFTDistributionTable';

/**
 * The supply chart is the page's only Recharts figure, below two ledgers: it
 * loads in its own chunk after the page, behind a skeleton in its finished
 * shape, so the charting library is not part of the page's first load.
 */
const CstSupplyHistory = dynamic(
  () => import('@/components/statistics/CstSupplyHistory').then((m) => m.CstSupplyHistory),
  { ssr: false, loading: () => <ChartFigureSkeleton figures={3} captions height={300} /> },
);

/**
 * Token distribution: who owns the Cosmic Signature NFTs (anchored ones
 * counted with their anchor-holder), who holds CST and how concentrated it
 * is, the CST supply over time, and the assets attached to gestures. The
 * header carries the holder counts and the supply; what each section counts
 * is in one Definitions disclosure at the end. The dashboard is read after
 * hydration only, so the first client render matches the server's.
 */
const TokensPanel = () => {
  const t = useTranslations('statistics');
  const format = useFormat();
  const hydrated = useHydrated();
  const dashboardQuery = useDashboardInfo(undefined, { poll: false });
  const dashboardData = hydrated ? dashboardQuery.data : undefined;
  const dashboardLoading = !hydrated || dashboardQuery.isLoading;
  // A failed read that left nothing behind; a failed poll keeps the last reading.
  const dashboardFailed = hydrated && dashboardQuery.isError && !dashboardQuery.data;
  const ownership = useNftOwnership();
  const ctBalanceQuery = useCTBalancesDistribution();
  const ctStatistics = useCTStatistics();

  const holders = ownership.data?.holders ?? [];
  const custody = ownership.data?.custody ?? null;
  const ctBalanceDistribution = (ctBalanceQuery.data ?? []) as CTBalanceDistribution[];
  const supply = toFiniteNumber(ctStatistics.data?.TotalSupplyEth);
  const imprinted = toFiniteNumber(dashboardData?.MainStats.NumCSTokenMints) ?? 0;
  const attachedContracts = dashboardData?.MainStats.DonatedTokenDistribution ?? [];
  const title = (key: string) => t(`tokens.sections.${key}`);

  return (
    <div data-testid="tokens-panel" className="space-y-12 sm:space-y-16">
      <StatsSection
        title={title('nftDistribution')}
        description={
          custody !== null ? t('tokens.nftHolders.custodyNotice', { count: custody }) : undefined
        }
        isLoading={!hydrated || ownership.isLoading}
        isError={hydrated && ownership.isError}
        onRetry={ownership.refetch}
        isEmpty={holders.length === 0}
        knownNonEmpty={imprinted > 0}
        emptyTitle={t('tokens.empty.nftTitle')}
        emptyDescription={t('tokens.empty.nftDescription')}
      >
        <NftHoldersLedger holders={holders} />
      </StatsSection>

      <StatsSection
        title={title('cstDistribution')}
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

      <StatsSection title={title('totalSupply')}>
        <CstSupplyHistory label={title('totalSupply')} />
      </StatsSection>

      <StatsSection
        title={title('attachedDistribution')}
        defaultOpen={false}
        lazy
        collapsedSummary={
          dashboardData ? t('tokens.attachedContracts', { count: attachedContracts.length }) : null
        }
        isLoading={dashboardLoading}
        // The contracts come from the dashboard: a read that failed is not "no contracts".
        isError={dashboardFailed}
        onRetry={() => dashboardQuery.refetch()}
        isEmpty={attachedContracts.length === 0}
        emptyTitle={t('tokens.empty.contractsTitle')}
      >
        <AttachedNFTDistributionTable list={attachedContracts} />
      </StatsSection>

      <AttachedAssetsSection
        currentCycle={dashboardData ? dashboardData.CurRoundNum : null}
        cycleLoading={dashboardLoading}
        cycleFailed={dashboardFailed}
        onRetryCycle={() => dashboardQuery.refetch()}
      />

      <DefinitionsDisclosure
        className="border-t border-rule pt-8 sm:pt-10"
        label={t('shared.definitions')}
        items={[
          {
            term: title('nftDistribution'),
            definition: t('sectionTooltips.cosmicSignatureTokenDistribution'),
          },
          {
            term: title('cstDistribution'),
            definition: t('sectionTooltips.cstBalanceDistribution'),
          },
          { term: title('totalSupply'), definition: t('sectionTooltips.cstTotalSupply') },
          {
            term: title('attachedDistribution'),
            definition: t('sectionTooltips.attachedTokenDistribution'),
          },
          { term: title('attachedAssets'), definition: t('sectionTooltips.attachedAssets') },
        ]}
      />
    </div>
  );
};

export default TokensPanel;
