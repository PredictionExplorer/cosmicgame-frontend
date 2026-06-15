'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { CustomPagination } from '@/components/common/CustomPagination';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Surface } from '@/components/ui/surface';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { RoundInfo } from '@/services/api';

const PER_PAGE = 10;

function StatChip({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: ReactNode;
  tooltip?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <span className="font-mono tabular-nums text-foreground/90">{value}</span>
      {tooltip ? <InfoTooltip content={tooltip} iconClassName="h-3 w-3" /> : null}
    </span>
  );
}

function AllocationCycleRow({ allocation }: { allocation: RoundInfo }) {
  const roundNum = allocation.RoundNum;
  const recipient = allocation.WinnerAddr ? shortenHex(allocation.WinnerAddr, 6) : '-';
  const stellarEth = (allocation.RoundStats?.TotalRaffleEthDepositsEth as number) || 0;
  const anchorEth = allocation.StakingDepositAmountEth || 0;

  return (
    <article
      className={cn(
        'border-b border-white/[0.06] px-4 py-3.5 last:border-b-0',
        'transition-colors hover:bg-white/[0.03]',
      )}
      aria-label={`Cycle ${roundNum} allocation summary`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/allocation/${roundNum}`}
                  className="font-display text-base font-semibold text-foreground transition-colors hover:text-primary"
                >
                  Cycle {roundNum}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[240px] text-xs leading-relaxed">
                  Open the detailed allocation breakdown for cycle #{roundNum}.
                </p>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-muted-foreground">
              {convertTimestampToDateTime(allocation.TimeStamp)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-mono tabular-nums text-foreground">
              {(allocation.AmountEth || 0).toFixed(4)} ETH
            </span>
            <span className="text-muted-foreground/40" aria-hidden>
              ·
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-muted-foreground">{recipient}</span>
              </TooltipTrigger>
              {allocation.WinnerAddr ? (
                <TooltipContent>
                  <p className="max-w-[280px] break-all font-mono text-xs leading-relaxed">
                    {allocation.WinnerAddr}
                  </p>
                </TooltipContent>
              ) : null}
            </Tooltip>
            <InfoTooltip content="Signature Allocation amount and recipient wallet for this cycle." />
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="outline" size="sm" className="h-8 shrink-0 px-3 text-xs">
              <Link href={`/allocation/${roundNum}`} aria-label={`Explore cycle ${roundNum}`}>
                Explore
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[240px] text-xs leading-relaxed">
              View recipients, deposits, and allocation details for cycle #{roundNum}.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <StatChip
          label="Gestures"
          value={allocation.RoundStats?.TotalBids ?? 0}
          tooltip="Total gestures made during this cycle."
        />
        <StatChip
          label="NFTs"
          value={allocation.RoundStats?.TotalDonatedNFTs ?? 0}
          tooltip="NFTs attached to gestures during this cycle."
        />
        <StatChip
          label="Stellar"
          value={stellarEth.toFixed(4)}
          tooltip="ETH allocated to the Stellar Selection pool."
        />
        <StatChip
          label="Anchor"
          value={anchorEth.toFixed(4)}
          tooltip="ETH allocated to Anchor Distributions."
        />
        <StatChip
          label="Distributed"
          value={allocation.RoundStats?.TotalRaffleNFTs ?? 0}
          tooltip="Cosmic Signature NFTs distributed via Stellar Selection."
        />
      </div>
    </article>
  );
}

function AllocationRowSkeleton() {
  return (
    <div className="space-y-2 border-b border-white/[0.06] px-4 py-3.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

export const AllocationTable = ({ list, loading }: { list: RoundInfo[]; loading: boolean }) => {
  const [page, setPage] = useState(1);

  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * PER_PAGE;
    const endIndex = page * PER_PAGE;
    return list.slice(startIndex, endIndex);
  }, [page, list]);

  return (
    <>
      <Surface variant="glass" radius="md" className="overflow-hidden">
        {loading ? (
          <div aria-busy="true" role="status" aria-label="Loading allocation cycles">
            {Array.from({ length: 6 }).map((_, i) => (
              <AllocationRowSkeleton key={i} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            title="No recipients yet"
            description="No Performance Cycles have been finalized yet."
          />
        ) : (
          <div role="list" aria-label="Allocation recipients by cycle">
            {paginatedList.map((allocation, index) => (
              <div key={allocation.RoundNum ?? `cycle-${index}`} role="listitem">
                <AllocationCycleRow allocation={allocation} />
              </div>
            ))}
          </div>
        )}
      </Surface>
      {!loading && list.length > 0 ? (
        <CustomPagination
          page={page}
          setPage={setPage}
          totalLength={list.length}
          perPage={PER_PAGE}
        />
      ) : null}
    </>
  );
};
