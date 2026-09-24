'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { countActiveAnchorHolders, distributionPerAnchoredNft } from '@/utils/anchoringStats';
import {
  useCSTAnchorDistributions,
  useDashboardInfo,
  useGlobalRWLKAnchorImprints,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { AnchoringFlow } from '@/components/anchoring/AnchoringFlow';
import { AnchoringQuestions } from '@/components/anchoring/AnchoringQuestions';
import { AnchoringSteps } from '@/components/anchoring/AnchoringSteps';
import { GlobalAnchorDistributionsTable } from '@/components/anchoring/GlobalAnchorDistributionsTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';

/**
 * The anchoring hub. A newcomer learns what anchoring is, what an anchored
 * NFT receives (the live figures of both lanes) and how to start; the two
 * public ledgers follow: every ETH Anchor Distribution deposit and every
 * Anchored-NFT Stellar Selection imprint.
 */
const AnchoringPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('anchoring');
  const distributions = useCSTAnchorDistributions();
  const imprints = useGlobalRWLKAnchorImprints();
  const dashboard = useDashboardInfo();
  const cstHolders = useUniqueCSTAnchorHolders();
  const rwlkHolders = useUniqueRWLKAnchorHolders();

  const stats = dashboard.data?.MainStats;
  const flowLoading = dashboard.isLoading || cstHolders.isLoading || rwlkHolders.isLoading;
  const ledgerValues = {
    percentage: protocolFacts.anchorDistributionPercentage,
    count: protocolFacts.anchoredRwlkNftSelectionRecipients,
    cst: protocolFacts.specialAllocationCst,
  };

  return (
    <PageShell variant="data">
      {seoSummary ?? (
        <PageHeader
          section="records"
          title={t('overview.title')}
          subtitle={t('overview.subtitle')}
        />
      )}

      <section
        aria-labelledby="anchoring-how-heading"
        className="grid gap-x-12 gap-y-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <SectionHeader
            headingId="anchoring-how-heading"
            title={t('overview.howItWorks.title')}
            description={t('overview.howItWorks.description')}
          />
          <AnchoringSteps />
        </div>
        <AnchoringFlow
          className="lg:col-span-7 lg:mt-1"
          poolEth={toFiniteNumber(dashboard.data?.StakingAmountEth)}
          anchoredCosmicSignature={toFiniteNumber(stats?.StakeStatisticsCST?.TotalTokensStaked)}
          perNft={distributionPerAnchoredNft(
            dashboard.data?.StakingAmountEth,
            stats?.StakeStatisticsCST?.TotalTokensStaked,
          )}
          anchoredRandomWalk={toFiniteNumber(stats?.StakeStatisticsRWalk?.TotalTokensStaked)}
          activeHolders={countActiveAnchorHolders(cstHolders.data, rwlkHolders.data)}
          loading={flowLoading}
        />
      </section>

      <AnchoringQuestions className="mt-[var(--block-gap)] sm:mt-20" />

      <GlobalAnchorDistributionsTable
        className="mt-[var(--block-gap)] sm:mt-20"
        list={distributions.data ?? []}
        loading={distributions.isLoading}
        error={distributions.error ? t('overview.errorMessage') : undefined}
        errorTitle={t('overview.errorTitle')}
        onRetry={() => void distributions.refetch()}
        title={t('ledgers.distributions.title')}
        description={t('ledgers.distributions.description', ledgerValues)}
      />

      <RwalkAnchorDistributionImprintsTable
        className="mt-[var(--block-gap)] sm:mt-20"
        list={imprints.data ?? []}
        loading={imprints.isLoading}
        error={imprints.error ? t('overview.errorMessage') : undefined}
        errorTitle={t('overview.errorTitle')}
        onRetry={() => void imprints.refetch()}
        title={t('ledgers.imprints.title')}
        description={t('ledgers.imprints.description', ledgerValues)}
        headingLevel={2}
        pageSize={10}
      />
    </PageShell>
  );
};

export default AnchoringPage;
