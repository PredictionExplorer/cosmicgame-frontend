'use client';

import { useMemo } from 'react';
import { Trophy, Gavel, Layers, Users } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { Surface } from '@/components/ui/surface';
import { AllocationTable } from '@/components/tables/AllocationTable';
import { useRoundList } from '@/hooks/useApiQuery';

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
        gradientTitle="signature"
        subtitle="Browse the complete history of allocation recipients, cycle statistics, and allocation distributions across all finalized Performance Cycles."
      />

      <Surface
        variant="solar"
        radius="xl"
        padding="lg"
        className="mb-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center"
      >
        <p className="type-body-md text-muted-foreground">
          When a Performance Cycle finalizes, the participant who made the Final Gesture retrieves
          the Signature Allocation &mdash; 25% of the Cycle Reserve plus a unique Cosmic Signature
          NFT. Additional allocations flow through Stellar Selection, Anchor Distributions, public
          goods, and protocol reserves.
        </p>
        <div className="space-y-3">
          {[
            ['Signature', '30%', 'bg-[rgb(var(--aurora-cyan-rgb))]'],
            ['Anchor', '19%', 'bg-[rgb(var(--impact-green-rgb))]'],
            ['Stellar', '6%', 'bg-[rgb(var(--solar-gold-rgb))]'],
            ['Public goods', '5%', 'bg-[rgb(var(--chrono-rose-rgb))]'],
          ].map(([label, value, color]) => (
            <div key={label} className="grid grid-cols-[96px_1fr_44px] items-center gap-3">
              <span className="type-mono-sm text-white/55">{label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <span
                  className={`block h-full rounded-full ${color}`}
                  style={{ width: value }}
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
