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
import { DataTableWidth } from '@/components/ui/data-table';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { AnchoringFlow } from '@/components/anchoring/AnchoringFlow';
import { GlobalAnchorDistributionsTable } from '@/components/anchoring/GlobalAnchorDistributionsTable';
import { SelectionImprintGallery } from '@/components/anchoring/SelectionImprintGallery';

interface AnchoringPageProps {
  /** The server-rendered header; the plain PageHeader stands in without one. */
  seoSummary?: ReactNode;
  /** "How anchoring works" steps, rendered on the server (static copy, no client JS). */
  steps: ReactNode;
  /** The question list, rendered on the server with its own spacing. */
  questions: ReactNode;
  /**
   * The header's related pages again, as a list at the end of the page on
   * phones, where the header hides its chips: rendered on the server.
   */
  related?: ReactNode;
}

/**
 * The Anchor Distributions records: the page a Records link leads to, so
 * the records lead. Every ETH Anchor Distribution deposit, then the
 * Anchored-NFT Stellar Selection imprints hung as the Signatures they are,
 * both at one width; then how anchoring works (the steps and the live
 * figures of both lanes) and the questions a newcomer asks. The static
 * explanations arrive as server-rendered slots; this client part only reads
 * the live figures and the two ledgers, which the route seeds.
 */
const AnchoringPage = ({ seoSummary, steps, questions, related }: AnchoringPageProps) => {
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

      {/* Both ledgers run the column's full width, so they share one right edge. */}
      <DataTableWidth value="fill">
        <GlobalAnchorDistributionsTable
          list={distributions.data ?? []}
          loading={distributions.isLoading}
          error={
            distributions.error && !distributions.data ? t('overview.errorMessage') : undefined
          }
          errorTitle={t('overview.errorTitle')}
          onRetry={() => void distributions.refetch()}
          title={t('ledgers.distributions.title')}
          description={t('ledgers.distributions.description', ledgerValues)}
        />
      </DataTableWidth>

      <SelectionImprintGallery
        className="mt-[var(--block-gap)] sm:mt-20"
        list={imprints.data ?? []}
        loading={imprints.isLoading}
        error={imprints.error && !imprints.data ? t('overview.errorMessage') : undefined}
        errorTitle={t('overview.errorTitle')}
        onRetry={() => void imprints.refetch()}
        title={t('ledgers.imprints.title')}
        description={t('ledgers.imprints.description', ledgerValues)}
      />

      <section
        aria-labelledby="anchoring-how-heading"
        className="mt-[var(--block-gap)] grid gap-x-12 gap-y-8 border-t border-rule-faint pt-[var(--block-gap)] sm:mt-20 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <SectionHeader
            headingId="anchoring-how-heading"
            title={t('overview.howItWorks.title')}
            description={t('overview.howItWorks.description')}
          />
          {steps}
        </div>
        <AnchoringFlow
          className="lg:col-span-7 lg:mt-1 lg:self-start"
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

      {questions}

      {related}
    </PageShell>
  );
};

export default AnchoringPage;
