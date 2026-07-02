'use client';

import { useMemo } from 'react';
import { Trophy, Gavel, Layers, Users } from 'lucide-react';

import { protocolFacts } from '@/content/protocol-facts';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { Surface } from '@/components/ui/surface';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { AllocationTable } from '@/components/tables/AllocationTable';
import { useRoundList } from '@/hooks/useApiQuery';

const allocationTracks = [
  {
    label: 'Signature',
    value: `${protocolFacts.mainEthPercentage}%`,
    width: `${protocolFacts.mainEthPercentage}%`,
    color: 'bg-[rgb(var(--aurora-cyan-rgb))]',
    tooltip:
      'The Signature Allocation is the main ETH allocation, retrieved by the participant who made the Final Gesture.',
  },
  {
    label: 'Chrono',
    value: `${protocolFacts.chronoWarriorEthPercentage}%`,
    width: `${protocolFacts.chronoWarriorEthPercentage}%`,
    color: 'bg-[rgb(var(--nebula-violet-rgb))]',
    tooltip:
      'The Chrono-Warrior allocation rewards the participant whose gesture carried the cycle through the most time.',
  },
  {
    label: 'Stellar ETH',
    value: `${protocolFacts.stellarSelectionEthPercentage}%`,
    width: `${protocolFacts.stellarSelectionEthPercentage}%`,
    color: 'bg-[rgb(var(--solar-gold-rgb))]',
    tooltip:
      'ETH set aside for Stellar Selection recipients. Each gesture creates selection frequency for these participant allocations.',
  },
  {
    label: 'Anchor',
    value: `${protocolFacts.anchorDistributionPercentage}%`,
    width: `${protocolFacts.anchorDistributionPercentage}%`,
    color: 'bg-[rgb(var(--impact-green-rgb))]',
    tooltip:
      'ETH distributed to wallets with Cosmic Signature NFTs anchored to the protocol. RandomWalk NFT anchors receive Anchored-NFT Stellar Selection eligibility instead, not ETH.',
  },
  {
    label: 'Public Goods',
    value: `${protocolFacts.publicGoodsPercentage}%`,
    width: `${protocolFacts.publicGoodsPercentage}%`,
    color: 'bg-[rgb(var(--chrono-rose-rgb))]',
    tooltip:
      'ETH forwarded from the cycle to the selected Public Goods Beneficiary, currently Protocol Guild.',
  },
  {
    label: 'Next cycle',
    value: `~${protocolFacts.compoundingReservePercentage}%`,
    width: `${protocolFacts.compoundingReservePercentage}%`,
    color: 'bg-white/40',
    tooltip:
      'The remaining Cycle Reserve compounds into the next Performance Cycle after the finalized allocations are made.',
  },
] as const;

const AllocationRecipientsPage = () => {
  const { data: rawPrizeClaims = [], isLoading: loading } = useRoundList();

  const allocationFinalizations = useMemo(
    () => [...rawPrizeClaims].sort((a, b) => b.TimeStamp - a.TimeStamp),
    [rawPrizeClaims],
  );

  const summaryStats = useMemo(() => {
    if (allocationFinalizations.length === 0) return null;
    const totalRounds = allocationFinalizations.length;
    const totalEth = allocationFinalizations.reduce((sum, r) => sum + (r.AmountEth || 0), 0);
    const totalGestures = allocationFinalizations.reduce(
      (sum, r) => sum + (r.RoundStats?.TotalBids || 0),
      0,
    );
    const uniqueRecipients = new Set(
      allocationFinalizations.map((r) => r.WinnerAddr).filter(Boolean),
    ).size;
    return { totalRounds, totalEth, totalGestures, uniqueRecipients };
  }, [allocationFinalizations]);

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="aurora" pulse>
            Allocation · Performance Cycles
          </SectionEyebrow>
        }
        title="Allocation Recipients"
        titleLevel={2}
        gradientTitle="signature"
        subtitle="Browse the complete history of allocation recipients, cycle statistics, and allocation distributions across all finalized Performance Cycles."
        meta={
          <span className="inline-flex items-center gap-1.5 type-body-sm text-muted-foreground">
            <span>Finalized round records only</span>
            <InfoTooltip
              content="This page summarizes finalized Performance Cycles from the round API. Pending cycles and unrelated allocation retrieval records are not included in these totals."
              label="Finalized round records only"
            />
          </span>
        }
      />

      <Surface
        variant="solar"
        radius="xl"
        padding="lg"
        className="mb-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center"
      >
        <p className="type-body-md text-muted-foreground">
          When a Performance Cycle finalizes, the participant who made the Final Gesture retrieves
          the Signature Allocation &mdash; {protocolFacts.mainEthPercentage}% of the Cycle Reserve,
          1,000 CST, and a unique Cosmic Signature NFT. Additional allocations flow through
          Chrono-Warrior, Stellar Selection, Anchor Distributions, Public Goods, and the Compounding
          Cycle Reserve.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="type-eyebrow text-white/65">Cycle Reserve Split</p>
            <InfoTooltip
              content="Percentages show how a finalized cycle's ETH reserve is allocated across protocol tracks."
              label="Cycle Reserve Split"
              iconClassName="h-3 w-3"
              className="text-white/45 hover:text-white/80"
            />
          </div>
          {allocationTracks.map(({ label, value, width, color, tooltip }) => (
            <div key={label} className="grid grid-cols-[112px_1fr_48px] items-center gap-3">
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

      {loading ? (
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : summaryStats ? (
        <div data-testid="summary-stats" className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            data-testid="summary-stat-total-cycles"
            label="Total Cycles"
            value={summaryStats.totalRounds}
            icon={<Layers className="h-4 w-4" />}
            accent="aurora"
            tooltip="The total number of finalized Performance Cycles so far."
          />
          <StatCard
            data-testid="summary-stat-total-eth-distributed"
            label="Total ETH Distributed"
            value={`${summaryStats.totalEth.toFixed(2)} ETH`}
            icon={<Trophy className="h-4 w-4" />}
            accent="solar"
            tooltip="The combined ETH distributed as Signature Allocations across all cycles."
          />
          <StatCard
            data-testid="summary-stat-total-gestures"
            label="Total Gestures"
            value={summaryStats.totalGestures.toLocaleString()}
            icon={<Gavel className="h-4 w-4" />}
            accent="nebula"
            tooltip="The cumulative number of gestures made across all finalized cycles."
          />
          <StatCard
            data-testid="summary-stat-unique-recipients"
            label="Unique Recipients"
            value={summaryStats.uniqueRecipients}
            icon={<Users className="h-4 w-4" />}
            accent="impact"
            tooltip="The number of distinct wallet addresses that have retrieved a Signature Allocation."
          />
        </div>
      ) : null}

      <AllocationTable list={allocationFinalizations} loading={loading} />
    </PageShell>
  );
};

export default AllocationRecipientsPage;
