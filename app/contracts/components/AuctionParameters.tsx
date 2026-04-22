'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Gavel, Timer } from 'lucide-react';

import { formatSeconds } from '@/utils';

import { useClipboard } from '@/hooks/useClipboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { SectionDivider } from '@/components/ui/section-divider';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

interface DutchAuctionDurations {
  AuctionDuration: number;
  ElapsedDuration: number;
}

interface AuctionParametersProps {
  cstDurations: DutchAuctionDurations;
  ethDurations: DutchAuctionDurations;
  cstBeginningBidPrice: number;
  charityAddress: string;
  charityPercentage?: number;
  explorerUrl: string;
  raffleEthWinners?: number;
  raffleNftWinnersBidding?: number;
  raffleNftWinnersStaking?: number;
  loading?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

function AuctionCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { label: string; value: string | number; tooltip: string }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] text-primary/60">
            {icon}
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{item.label}</span>
                <InfoTooltip content={item.tooltip} />
              </div>
              <span className="font-mono font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CharityRow({
  address,
  percentage,
  explorerUrl,
}: {
  address: string;
  percentage?: number;
  explorerUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const { copy } = useClipboard();

  const handleCopy = async () => {
    await copy(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!address) return null;

  return (
    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">Charity Address</span>
          <InfoTooltip content="The on-chain address currently receiving charity funds from the CharityWallet contract" />
        </div>
        <div className="flex items-center gap-2">
          {percentage != null && (
            <span className="text-sm font-semibold text-primary">{percentage}%</span>
          )}
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground"
            aria-label="Copy charity address"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <a
            href={`${explorerUrl}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground"
            aria-label="View charity address on block explorer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-muted-foreground leading-relaxed">
        {address}
      </p>
    </div>
  );
}

export function AuctionParameters({
  cstDurations,
  ethDurations,
  cstBeginningBidPrice,
  charityAddress,
  charityPercentage,
  explorerUrl,
  raffleEthWinners,
  raffleNftWinnersBidding,
  raffleNftWinnersStaking,
  loading = false,
}: AuctionParametersProps) {
  if (loading) {
    return (
      <div>
        <SectionDivider title="Auction & Raffle Parameters" className="mb-4" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionDivider title="Auction & Raffle Parameters" className="mb-4" />

      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp}>
          <AuctionCard
            title="CST Dutch Auction"
            icon={<Gavel className="h-4 w-4" />}
            items={[
              {
                label: 'Duration',
                value: formatSeconds(cstDurations.AuctionDuration),
                tooltip: 'Total duration of the CST Dutch auction where price decreases over time',
              },
              {
                label: 'Elapsed Duration',
                value: formatSeconds(cstDurations.ElapsedDuration),
                tooltip: 'Time already elapsed in the current CST Dutch auction cycle',
              },
              {
                label: 'Beginning Bid Price',
                value: `${cstBeginningBidPrice} CST`,
                tooltip:
                  'Starting price of the CST Dutch auction that decreases linearly over time',
              },
            ]}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <AuctionCard
            title="ETH Dutch Auction"
            icon={<Timer className="h-4 w-4" />}
            items={[
              {
                label: 'Duration',
                value: formatSeconds(ethDurations.AuctionDuration),
                tooltip: 'Total duration of the ETH Dutch auction where price decreases over time',
              },
              {
                label: 'Elapsed Duration',
                value: formatSeconds(ethDurations.ElapsedDuration),
                tooltip: 'Time already elapsed in the current ETH Dutch auction cycle',
              },
            ]}
          />
        </motion.div>
      </motion.div>

      <CharityRow
        address={charityAddress}
        percentage={charityPercentage}
        explorerUrl={explorerUrl}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Raffle ETH Winners"
          value={raffleEthWinners ?? '--'}
          tooltip="Number of bidders randomly selected to win ETH raffle rewards each round"
        />
        <StatCard
          label="Raffle NFT Winners (Bidding)"
          value={raffleNftWinnersBidding ?? '--'}
          tooltip="Number of bidders randomly selected to win NFT raffle prizes each round"
        />
        <StatCard
          label="Raffle NFT Winners (Staking)"
          value={raffleNftWinnersStaking ?? '--'}
          tooltip="Number of RandomWalk stakers randomly selected to win NFT raffle prizes each round"
        />
      </div>
    </div>
  );
}
