'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { DashboardInfo } from '@/services/api';

import type { UserProfileInfo } from './UserStatsSection';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function ProbabilityBar({
  label,
  probability,
  tooltip,
}: {
  label: string;
  probability: number;
  tooltip: string;
}) {
  const pct = probability >= 0 ? probability * 100 : 0;
  const display = probability >= 0 ? `${pct.toFixed(2)}%` : '--';

  return (
    <div
      className="space-y-1.5"
      data-testid={`prob-bar-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          {label}
          <InfoTooltip content={tooltip} />
        </span>
        <span className="font-semibold tabular-nums">{display}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function RaffleStat({
  label,
  value,
  tooltip,
  href,
}: {
  label: string;
  value: string | number;
  tooltip: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]">
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        <InfoTooltip content={tooltip} />
      </p>
      <p className="mt-1.5 text-base font-bold tabular-nums">
        {value}
        {href && <ExternalLink className="ml-1.5 inline h-3 w-3 text-muted-foreground/40" />}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline text-inherit">
        {content}
      </Link>
    );
  }
  return content;
}

export interface RafflePerformanceProps {
  userInfo: UserProfileInfo;
  raffleETHProbability: number;
  raffleNFTProbability: number;
  data: DashboardInfo | null;
  className?: string;
}

export function RafflePerformance({
  userInfo,
  raffleETHProbability,
  raffleNFTProbability,
  data,
  className,
}: RafflePerformanceProps) {
  const showProbabilities = useMemo(() => {
    const roundActive = !((data?.CurRoundNum ?? 0) > 0 && data?.TsRoundStart === 0);
    return roundActive && raffleETHProbability >= 0;
  }, [data, raffleETHProbability]);

  const totalRaffleEth =
    (userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0);

  return (
    <motion.div
      className={cn('space-y-6', className)}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      data-testid="raffle-performance"
    >
      {showProbabilities && (
        <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current Cycle Selection Frequency
          </h4>
          <ProbabilityBar
            label="ETH Stellar Selection"
            probability={raffleETHProbability}
            tooltip="Your selection frequency for an ETH Stellar Selection allocation this cycle, based on your share of total gestures and the number of ETH Stellar Selection recipients chosen."
          />
          <ProbabilityBar
            label="NFT Stellar Selection"
            probability={raffleNFTProbability}
            tooltip="Your selection frequency for a Cosmic Signature NFT Stellar Selection imprint this cycle, based on your share of total gestures."
          />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <RaffleStat
          label="Total Stellar Selection ETH"
          value={`${totalRaffleEth.toFixed(4)} ETH`}
          tooltip="Combined ETH from Stellar Selection allocations and retrievals across all cycles."
          href={userInfo.Address ? `/user/raffle-eth/${userInfo.Address}` : undefined}
        />
        <RaffleStat
          label="ETH Retrieved"
          value={`${(userInfo.SumRaffleEthWithdrawal ?? 0).toFixed(4)} ETH`}
          tooltip="ETH already retrieved from Stellar Selection allocations to your wallet."
        />
        <RaffleStat
          label="Unretrieved NFTs"
          value={(userInfo.UnclaimedNFTs ?? 0).toLocaleString()}
          tooltip="Attached NFTs allocated to you but not yet retrieved."
        />
        <RaffleStat
          label="Stellar Selection NFTs"
          value={(userInfo.RaffleNFTsCount ?? 0).toLocaleString()}
          tooltip="Cosmic Signature NFTs imprinted through Stellar Selection."
          href={userInfo.Address ? `/user/raffle-nft/${userInfo.Address}` : undefined}
        />
        <RaffleStat
          label="Allocation NFTs"
          value={(userInfo.RewardNFTsCount ?? 0).toLocaleString()}
          tooltip="Total Cosmic Signature NFTs received as allocations (all imprint types combined)."
        />
        <RaffleStat
          label="CS Tokens Received"
          value={(userInfo.TotalCSTokensWon ?? 0).toLocaleString()}
          tooltip="Total Cosmic Signature tokens received across all cycles."
        />
      </div>
    </motion.div>
  );
}
