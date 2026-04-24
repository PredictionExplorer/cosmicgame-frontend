'use client';

import { useMemo } from 'react';
import { Trophy, Gavel, Layers, Users } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
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

      <p className="mb-10 max-w-3xl type-body-sm text-muted-foreground">
        When a Performance Cycle finalizes, the participant who made the Final Gesture retrieves the
        Signature Allocation &mdash; 25% of the Cycle Reserve plus a unique Cosmic Signature NFT.
        Additional allocations are distributed through Stellar Selection: three ETH recipients and
        eleven NFT recipients are randomly selected from all cycle participants. Explore the
        complete allocation history and how distributions have evolved over time.
      </p>

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
