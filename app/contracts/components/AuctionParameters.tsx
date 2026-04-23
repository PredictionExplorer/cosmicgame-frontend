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
          <span className="text-sm font-medium text-foreground">Public goods address</span>
          <InfoTooltip content="On-chain beneficiary for the public-goods share (contract: CharityWallet)" />
        </div>
        <div className="flex items-center gap-2">
          {percentage != null && (
            <span className="text-sm font-semibold text-primary">{percentage}%</span>
          )}
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground"
            aria-label="Copy public goods address"
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
            aria-label="View public goods address on block explorer"
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
        <SectionDivider title="Calibration & selection parameters" className="mb-4" />
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
      <SectionDivider title="Calibration & selection parameters" className="mb-4" />

      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp}>
          <AuctionCard
            title="CST Calibration Window"
            icon={<Gavel className="h-4 w-4" />}
            items={[
              {
                label: 'Duration',
                value: formatSeconds(cstDurations.AuctionDuration),
                tooltip: 'Total duration of the CST Calibration Window (descending gesture cost)',
              },
              {
                label: 'Elapsed Duration',
                value: formatSeconds(cstDurations.ElapsedDuration),
                tooltip: 'Time already elapsed in the current CST calibration cycle',
              },
              {
                label: 'Calibration ceiling (CST)',
                value: `${cstBeginningBidPrice} CST`,
                tooltip: 'Opening CST gesture cost before the window counts down',
              },
            ]}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <AuctionCard
            title="ETH Calibration Window"
            icon={<Timer className="h-4 w-4" />}
            items={[
              {
                label: 'Duration',
                value: formatSeconds(ethDurations.AuctionDuration),
                tooltip: 'Total duration of the ETH Calibration Window (opening gesture period)',
              },
              {
                label: 'Elapsed Duration',
                value: formatSeconds(ethDurations.ElapsedDuration),
                tooltip: 'Time already elapsed in the current ETH calibration cycle',
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
          label="ETH Stellar Selection slots"
          value={raffleEthWinners ?? '--'}
          tooltip="Participants randomly selected for ETH Stellar Selection each cycle"
        />
        <StatCard
          label="NFT Stellar Selection (gestures)"
          value={raffleNftWinnersBidding ?? '--'}
          tooltip="Participants randomly selected for COSMIC NFT allocation from gesture pool"
        />
        <StatCard
          label="NFT Stellar Selection (anchors)"
          value={raffleNftWinnersStaking ?? '--'}
          tooltip="Anchored Random Walk holders randomly selected for COSMIC NFT allocation"
        />
      </div>
    </div>
  );
}
