'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { ALLOCATION_TRACK_COLORS } from '@/config/allocationTracks';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { Surface } from '@/components/ui/surface';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { AllocationTable } from '@/components/tables/AllocationTable';
import { useRoundList } from '@/hooks/useApiQuery';

/**
 * `seoSummary` is the server-rendered page header, the page's only header: it
 * carries the cycle, recipient, ETH and gesture totals, so the body does not
 * repeat them.
 */
const AllocationRecipientsPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('allocation');
  const { data: rawPrizeClaims = [], isLoading: loading } = useRoundList();

  const allocationTracks = [
    {
      id: 'signature',
      label: t('recipients.reserveSplit.tracks.signature.label'),
      value: `${protocolFacts.mainEthPercentage}%`,
      width: `${protocolFacts.mainEthPercentage}%`,
      color: ALLOCATION_TRACK_COLORS.signature,
      tooltip: t('recipients.reserveSplit.tracks.signature.tooltip'),
    },
    {
      id: 'chrono',
      label: t('recipients.reserveSplit.tracks.chrono.label'),
      value: `${protocolFacts.chronoWarriorEthPercentage}%`,
      width: `${protocolFacts.chronoWarriorEthPercentage}%`,
      color: ALLOCATION_TRACK_COLORS.chrono,
      tooltip: t('recipients.reserveSplit.tracks.chrono.tooltip'),
    },
    {
      id: 'stellar',
      label: t('recipients.reserveSplit.tracks.stellar.label'),
      value: `${protocolFacts.stellarSelectionEthPercentage}%`,
      width: `${protocolFacts.stellarSelectionEthPercentage}%`,
      color: ALLOCATION_TRACK_COLORS.stellar,
      tooltip: t('recipients.reserveSplit.tracks.stellar.tooltip'),
    },
    {
      id: 'anchor',
      label: t('recipients.reserveSplit.tracks.anchor.label'),
      value: `${protocolFacts.anchorDistributionPercentage}%`,
      width: `${protocolFacts.anchorDistributionPercentage}%`,
      color: ALLOCATION_TRACK_COLORS.anchor,
      tooltip: t('recipients.reserveSplit.tracks.anchor.tooltip'),
    },
    {
      id: 'public-goods',
      label: t('recipients.reserveSplit.tracks.publicGoods.label'),
      value: `${protocolFacts.publicGoodsPercentage}%`,
      width: `${protocolFacts.publicGoodsPercentage}%`,
      color: ALLOCATION_TRACK_COLORS.publicGoods,
      tooltip: t('recipients.reserveSplit.tracks.publicGoods.tooltip'),
    },
    {
      id: 'next-cycle',
      label: t('recipients.reserveSplit.tracks.nextCycle.label'),
      value: `~${protocolFacts.compoundingReservePercentage}%`,
      width: `${protocolFacts.compoundingReservePercentage}%`,
      color: ALLOCATION_TRACK_COLORS.nextCycle,
      tooltip: t('recipients.reserveSplit.tracks.nextCycle.tooltip'),
    },
  ] as const;

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

      <Surface
        variant="solar"
        radius="xl"
        padding="lg"
        className="mb-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center"
      >
        <p className="type-body-md text-muted-foreground">
          {t('recipients.intro', { percentage: protocolFacts.mainEthPercentage })}
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="type-eyebrow text-white/65">{t('recipients.reserveSplit.label')}</p>
            <InfoTooltip
              content={t('recipients.reserveSplit.tooltip')}
              label={t('recipients.reserveSplit.label')}
              iconClassName="h-3 w-3"
              className="text-white/45 hover:text-white/80"
            />
          </div>
          {allocationTracks.map(({ id, label, value, width, color, tooltip }) => (
            <div key={id} className="grid grid-cols-[112px_1fr_48px] items-center gap-3">
              <span className="flex items-center gap-1.5 type-mono-sm text-white/55">
                <span>{label}</span>
                <InfoTooltip
                  content={tooltip}
                  label={label}
                  iconClassName="h-3 w-3"
                  className="text-white/45 hover:text-white/80"
                />
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <span
                  className={`block h-full rounded-full ${color}`}
                  style={{ width }}
                  aria-hidden
                />
              </span>
              <span className="type-mono-sm text-white/70">{value}</span>
            </div>
          ))}
        </div>
      </Surface>

      <AllocationTable list={allocationFinalizations} loading={loading} />
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
