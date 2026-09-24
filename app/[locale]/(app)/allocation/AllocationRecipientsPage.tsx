'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { ALLOCATION_TRACK_COPY_KEYS, withNextCycleShare } from '@/config/allocationTracks';
import { PageHeader } from '@/components/layout/PageHeader';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { PageShell } from '@/components/ui/page-shell';
import { SectionHeader } from '@/components/ui/section-header';
import { AllocationTable } from '@/components/tables/AllocationTable';
import { AllocationSplitBar } from '@/components/winnings/AllocationSplitBar';
import { useRoundList } from '@/hooks/useApiQuery';

/**
 * The finalized cycles and how each cycle's reserve is split.
 *
 * `seoSummary` is the server-rendered page header, the page's only header: it
 * carries the cycle, recipient, ETH and gesture totals, so the body does not
 * repeat them. The body shows the protocol's split once, as one proportional
 * bar in the track colours every chart of the split uses, then every
 * finalized cycle in one ledger.
 */
const AllocationRecipientsPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('allocation');
  const tContracts = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const { data: rawPrizeClaims = [], isLoading: loading } = useRoundList();

  const segments = useMemo(
    () =>
      withNextCycleShare([
        { id: 'signature', percent: protocolFacts.mainEthPercentage },
        { id: 'chrono', percent: protocolFacts.chronoWarriorEthPercentage },
        { id: 'stellar', percent: protocolFacts.stellarSelectionEthPercentage },
        { id: 'anchor', percent: protocolFacts.anchorDistributionPercentage },
        { id: 'publicGoods', percent: protocolFacts.publicGoodsPercentage },
      ]).map((share) => ({
        ...share,
        label: tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[share.id]}.label`),
        definition: tContracts(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[share.id]}.tooltip`),
        // The remainder rolls into the next cycle: its size follows from the others.
        approximate: share.id === 'nextCycle',
      })),
    [tContracts],
  );

  const allocationFinalizations = useMemo(
    () => [...rawPrizeClaims].sort((a, b) => b.TimeStamp - a.TimeStamp),
    [rawPrizeClaims],
  );

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="records"
          title={t('recipients.header.title')}
          subtitle={t('recipients.header.subtitle')}
          meta={<AllocationScopeNote />}
        />
      )}

      <section
        aria-labelledby="reserve-split"
        className="mb-[var(--block-gap)] grid gap-x-12 gap-y-8 lg:grid-cols-12"
      >
        <SectionHeader
          headingId="reserve-split"
          title={t('recipients.reserveSplit.label')}
          info={{
            content: t('recipients.reserveSplit.tooltip'),
            label: t('recipients.reserveSplit.label'),
          }}
          description={t('recipients.intro', { percentage: protocolFacts.mainEthPercentage })}
          className="mb-0 lg:col-span-5 sm:mb-0"
        />
        <AllocationSplitBar
          segments={segments}
          label={t('recipients.reserveSplit.label')}
          unavailableLabel={tCommon('status.unavailable')}
          className="lg:col-span-7 lg:pt-2"
        />
      </section>

      <AllocationTable
        list={allocationFinalizations}
        loading={loading}
        title={t('recipients.ledgerTitle')}
        className="mb-10"
      />
    </PageShell>
  );
};

/**
 * "Finalized cycle records only", with its definition: the scope of every
 * figure and row on the page, for the header's meta line.
 */
export function AllocationScopeNote() {
  const t = useTranslations('allocation');
  return (
    <span className="inline-flex items-center gap-1">
      <span>{t('recipients.header.scope')}</span>
      <InfoTooltip
        content={t('recipients.header.scopeTooltip')}
        label={t('recipients.header.scope')}
        iconClassName="size-3.5"
      />
    </span>
  );
}

export default AllocationRecipientsPage;
