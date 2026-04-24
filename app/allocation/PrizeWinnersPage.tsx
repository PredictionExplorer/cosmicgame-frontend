'use client';

import { useMemo } from 'react';
import { Trophy, Gavel, Layers, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { PrizeTable } from '@/components/tables/PrizeTable';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoundList } from '@/hooks/useApiQuery';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
};

interface SummaryStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tooltip: string;
  index: number;
}

function SummaryStat({ icon, label, value, tooltip, index }: SummaryStatProps) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
      data-testid={`summary-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className="text-muted-foreground/60">{icon}</div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
        <InfoTooltip content={tooltip} />
      </div>
      <p className="text-lg font-semibold text-white tabular-nums">{value}</p>
    </motion.div>
  );
}

function SummaryStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

const PrizeWinnersPage = () => {
  const { data: rawPrizeClaims = [], isLoading: loading } = useRoundList();
  const prizeClaims = useMemo(
    () => [...rawPrizeClaims].sort((a, b) => b.TimeStamp - a.TimeStamp),
    [rawPrizeClaims],
  );

  const summaryStats = useMemo(() => {
    if (prizeClaims.length === 0) return null;
    const totalRounds = prizeClaims.length;
    const totalEth = prizeClaims.reduce((sum, r) => sum + (r.AmountEth || 0), 0);
    const totalBids = prizeClaims.reduce((sum, r) => sum + (r.RoundStats?.TotalBids || 0), 0);
    const uniqueWinners = new Set(prizeClaims.map((r) => r.WinnerAddr).filter(Boolean)).size;
    return { totalRounds, totalEth, totalBids, uniqueWinners };
  }, [prizeClaims]);

  return (
    <MainWrapper>
      <PageHeader
        title="Allocation Recipients"
        subtitle="Browse the complete history of allocation recipients, cycle statistics, and allocation distributions across all finalized Performance Cycles."
      />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        When a Performance Cycle finalizes, the participant who made the Final Gesture retrieves the
        Signature Allocation &mdash; 25% of the Cycle Reserve plus a unique Cosmic Signature NFT.
        Additional allocations are distributed through Stellar Selection: three ETH recipients and
        eleven NFT recipients are randomly selected from all cycle participants. Explore the
        complete allocation history and how distributions have evolved over time.
      </p>

      {loading ? (
        <SummaryStatsSkeleton />
      ) : (
        summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10" data-testid="summary-stats">
            <SummaryStat
              icon={<Layers className="h-4 w-4" />}
              label="Total Cycles"
              value={summaryStats.totalRounds}
              tooltip="The total number of finalized Performance Cycles so far."
              index={0}
            />
            <SummaryStat
              icon={<Trophy className="h-4 w-4" />}
              label="Total ETH Distributed"
              value={`${summaryStats.totalEth.toFixed(2)} ETH`}
              tooltip="The combined ETH distributed as Signature Allocations across all cycles."
              index={1}
            />
            <SummaryStat
              icon={<Gavel className="h-4 w-4" />}
              label="Total Gestures"
              value={summaryStats.totalBids.toLocaleString()}
              tooltip="The cumulative number of gestures made across all finalized cycles."
              index={2}
            />
            <SummaryStat
              icon={<Users className="h-4 w-4" />}
              label="Unique Recipients"
              value={summaryStats.uniqueWinners}
              tooltip="The number of distinct wallet addresses that have retrieved a Signature Allocation."
              index={3}
            />
          </div>
        )
      )}

      <div className="mt-2">
        <PrizeTable list={prizeClaims} loading={loading} />
      </div>
    </MainWrapper>
  );
};

export default PrizeWinnersPage;
