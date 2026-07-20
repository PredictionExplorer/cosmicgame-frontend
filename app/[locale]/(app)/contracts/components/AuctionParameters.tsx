'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Gavel, Timer } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';
import { formatSeconds } from '@/utils';

import { useClipboard } from '@/hooks/useClipboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { SectionDivider } from '@/components/ui/section-divider';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { PublicGoodsVaultAction } from './PublicGoodsVaultAction';

interface DutchAuctionDurations {
  AuctionDuration: number;
  ElapsedDuration: number;
}

interface AuctionParametersProps {
  cstDurations: DutchAuctionDurations;
  ethDurations: DutchAuctionDurations;
  cstBeginningBidPrice: number;
  publicGoodsVaultAddress: string;
  charityAddress: string;
  charityVaultBalanceEth?: number;
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
  const t = useTranslations('contracts');
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
          <span className="text-sm font-medium text-foreground">
            {t('parameters.publicGoodsAddress')}
          </span>
          <InfoTooltip content={t('parameters.publicGoodsAddressTooltip')} />
        </div>
        <div className="flex items-center gap-2">
          {percentage != null && (
            <span className="text-sm font-semibold text-primary">{percentage}%</span>
          )}
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-white/[0.06] hover:text-muted-foreground"
            aria-label={t('parameters.copyPublicGoodsAria')}
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
            aria-label={t('parameters.viewPublicGoodsAria')}
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
  publicGoodsVaultAddress,
  charityAddress,
  charityVaultBalanceEth,
  charityPercentage,
  explorerUrl,
  raffleEthWinners,
  raffleNftWinnersBidding,
  raffleNftWinnersStaking,
  loading = false,
}: AuctionParametersProps) {
  const locale = useLocale();
  const t = useTranslations('contracts');
  if (loading) {
    return (
      <div>
        <SectionDivider title={t('parameters.title')} className="mb-4" />
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
      <SectionDivider title={t('parameters.title')} className="mb-4" />

      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp}>
          <AuctionCard
            title={t('parameters.cstTitle')}
            icon={<Gavel className="h-4 w-4" />}
            items={[
              {
                label: t('parameters.duration'),
                value: formatSeconds(cstDurations.AuctionDuration, locale),
                tooltip: t('parameters.cstDurationTooltip', {
                  increase: protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
                  decrease: protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
                }),
              },
              {
                label: t('parameters.elapsed'),
                value: formatSeconds(cstDurations.ElapsedDuration, locale),
                tooltip: t('parameters.cstElapsedTooltip'),
              },
              {
                label: t('parameters.ceiling'),
                value: `${cstBeginningBidPrice} CST`,
                tooltip: t('parameters.cstCeilingTooltip'),
              },
            ]}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <AuctionCard
            title={t('parameters.ethTitle')}
            icon={<Timer className="h-4 w-4" />}
            items={[
              {
                label: t('parameters.duration'),
                value: formatSeconds(ethDurations.AuctionDuration, locale),
                tooltip: t('parameters.ethDurationTooltip'),
              },
              {
                label: t('parameters.elapsed'),
                value: formatSeconds(ethDurations.ElapsedDuration, locale),
                tooltip: t('parameters.ethElapsedTooltip'),
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

      <PublicGoodsVaultAction
        vaultAddress={publicGoodsVaultAddress}
        beneficiaryAddress={charityAddress}
        vaultBalanceEth={charityVaultBalanceEth}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label={t('parameters.selection.ethLabel')}
          value={raffleEthWinners ?? '--'}
          tooltip={t('parameters.selection.ethTooltip')}
        />
        <StatCard
          label={t('parameters.selection.nftLabel')}
          value={raffleNftWinnersBidding ?? '--'}
          tooltip={t('parameters.selection.nftTooltip')}
        />
        <StatCard
          label={t('parameters.selection.anchorLabel')}
          value={raffleNftWinnersStaking ?? '--'}
          tooltip={t('parameters.selection.anchorTooltip')}
        />
      </div>
    </div>
  );
}
