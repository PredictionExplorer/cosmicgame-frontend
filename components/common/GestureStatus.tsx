'use client';

import { useMemo, type ReactNode } from 'react';
import { zeroAddress } from 'viem';
import { Trophy, Coins, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

import { convertTimestampToDateTime, formatSeconds } from '@/utils';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useActiveWeb3React } from '@/hooks/web3';
import type { DashboardInfo, GestureInfo } from '@/services/api';
import { useUserInfo } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';
import { formatCstAmount, getCstAuctionProgress, type CstGestureData } from '@/utils/cstGesture';

import Counter from './Counter';
import { SmoothCountdown } from './SmoothCountdown';

interface EthGestureInfo {
  ETHPrice: number;
  AuctionDuration?: number;
  SecondsElapsed?: number;
}

interface GestureStatusData extends DashboardInfo {
  PrizeAmountEth?: number;
  RaffleAmountEth?: number;
}

interface GestureStatusProps {
  data: GestureStatusData | null;
  loading: boolean;
  activationTime: number;
  curGestureList: GestureInfo[];
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
  allocationTime: number;
  suppressPrimaryTimer?: boolean;
  attachedNFTCount?: number;
  attachedERC20Count?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

type GestureMetricTone = 'signature' | 'eth' | 'randomwalk' | 'cst';

const gestureMetricTone: Record<
  GestureMetricTone,
  { card: string; icon: string; glow: string; value: string }
> = {
  signature: {
    card: 'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(var(--nebula-violet-rgb)/0.055)_55%,rgb(var(--chrono-rose-rgb)/0.055))]',
    icon: 'bg-primary/15 text-primary',
    glow: 'after:bg-[rgb(var(--aurora-cyan-rgb)/0.45)]',
    value:
      'bg-gradient-to-r from-[#35C9FF] via-[#7DD3FC] to-[#AC56FF] bg-clip-text text-transparent',
  },
  eth: {
    card: 'border-[rgb(var(--solar-gold-rgb)/0.24)] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.10),rgb(255_255_255/0.025)_60%,transparent)]',
    icon: 'bg-[rgb(var(--solar-gold-rgb)/0.15)] text-[rgb(var(--solar-gold-rgb))]',
    glow: 'after:bg-[rgb(var(--solar-gold-rgb)/0.42)]',
    value: 'text-[rgb(var(--solar-gold-rgb))]',
  },
  randomwalk: {
    card: 'border-[rgb(var(--nebula-violet-rgb)/0.24)] bg-[linear-gradient(135deg,rgb(var(--nebula-violet-rgb)/0.11),rgb(var(--aurora-cyan-rgb)/0.035)_65%,transparent)]',
    icon: 'bg-[rgb(var(--nebula-violet-rgb)/0.16)] text-[rgb(var(--nebula-violet-rgb))]',
    glow: 'after:bg-[rgb(var(--nebula-violet-rgb)/0.45)]',
    value: 'text-[rgb(var(--nebula-violet-rgb))]',
  },
  cst: {
    card: 'border-[rgb(var(--impact-green-rgb)/0.24)] bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.10),rgb(var(--aurora-cyan-rgb)/0.035)_62%,transparent)]',
    icon: 'bg-[rgb(var(--impact-green-rgb)/0.14)] text-[rgb(var(--impact-green-rgb))]',
    glow: 'after:bg-[rgb(var(--impact-green-rgb)/0.42)]',
    value: 'text-[rgb(var(--impact-green-rgb))]',
  },
};

function GestureMetricCard({
  label,
  value,
  detail,
  icon,
  tooltip,
  tone,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
  tone: GestureMetricTone;
}) {
  const palette = gestureMetricTone[tone];

  return (
    <div
      className={cn(
        'group relative flex h-full min-h-[132px] flex-col justify-between overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.055]',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent',
        'after:pointer-events-none after:absolute after:-right-10 after:-top-12 after:h-28 after:w-28 after:rounded-full after:opacity-0 after:blur-2xl after:transition-opacity after:duration-300 after:content-[""] group-hover:after:opacity-100',
        palette.card,
        palette.glow,
      )}
    >
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="type-eyebrow text-muted-foreground print:!text-foreground/80">{label}</p>
          {tooltip ? <InfoTooltip content={tooltip} /> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              palette.icon,
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          'relative z-[1] mt-4 text-xl font-bold tracking-tight tabular-nums',
          palette.value,
        )}
      >
        {value}
      </div>
      {detail ? <div className="relative z-[1] mt-3">{detail}</div> : null}
    </div>
  );
}

function formatAttachedAssetPart(
  count: number,
  singularLabel: string,
  pluralLabel: string,
  includeAllForPlural = true,
) {
  if (count === 0) return '';
  if (count === 1) return `the attached ${singularLabel}`;
  return `${includeAllForPlural ? 'all ' : ''}${count} attached ${pluralLabel}`;
}

function joinAssetParts(parts: string[]) {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

function formatAttachedAssetStatusCopy(nftCount: number, erc20Count: number) {
  const parts = [
    formatAttachedAssetPart(nftCount, 'NFT', 'NFTs'),
    formatAttachedAssetPart(erc20Count, 'ERC20 token deposit', 'ERC20 token deposits'),
  ].filter(Boolean);

  if (parts.length === 0) return '';
  return `, plus ${joinAssetParts(parts)} shown below`;
}

function formatAttachedAssetTooltipCopy(nftCount: number, erc20Count: number) {
  const parts = [
    formatAttachedAssetPart(nftCount, 'NFT', 'NFTs'),
    formatAttachedAssetPart(erc20Count, 'ERC20 token deposit', 'ERC20 token deposits'),
  ].filter(Boolean);

  if (parts.length === 0) return '';
  return `, and ${joinAssetParts(parts)}`;
}

export const GestureStatus = ({
  data,
  loading,
  activationTime,
  curGestureList,
  ethGestureInfo,
  cstGestureData,
  allocationTime,
  suppressPrimaryTimer = false,
  attachedNFTCount = 0,
  attachedERC20Count = 0,
}: GestureStatusProps) => {
  const { account } = useActiveWeb3React();
  const { data: userInfoRaw } = useUserInfo(account);

  const now = useNow(1000);

  const selectionFrequency = useMemo(() => {
    if (!account || !data || !curGestureList.length) return null;
    const Gestures = (userInfoRaw?.Gestures as GestureInfo[] | undefined) || [];
    if (!Gestures.length) return null;
    const curCycleGestures = Gestures.filter((bid) => bid.RoundNum === data.CurRoundNum);
    const pSelect = (total: number, chosen: number, yours: number) =>
      1 - Math.pow((total - yours) / total, chosen);
    return {
      stellarEth:
        pSelect(
          curGestureList.length,
          data.NumRaffleEthWinnersBidding ?? 1,
          curCycleGestures.length,
        ) * 100,
      nft:
        pSelect(
          curGestureList.length,
          data.NumRaffleNFTWinnersBidding ?? 1,
          curCycleGestures.length,
        ) * 100,
    };
  }, [account, data, userInfoRaw, curGestureList]);

  const attachedAssetAllocationCopy = formatAttachedAssetStatusCopy(
    attachedNFTCount,
    attachedERC20Count,
  );
  const attachedAssetTooltipCopy = formatAttachedAssetTooltipCopy(
    attachedNFTCount,
    attachedERC20Count,
  );

  const cstAuctionProgress = getCstAuctionProgress(cstGestureData);

  if (loading) return null;

  return (
    <div className="space-y-5">
      {/* Pre-activation countdown */}
      {activationTime > now / 1000 && data ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-center',
            suppressPrimaryTimer && 'sr-only',
          )}
        >
          <p className="text-sm text-muted-foreground">
            Cycle {data.CurRoundNum} opens at {convertTimestampToDateTime(activationTime, true)}
          </p>
          <div className="mt-4">
            <SmoothCountdown date={activationTime * 1000} renderer={Counter} />
          </div>
        </motion.div>
      ) : data && data.TsRoundStart !== 0 ? (
        <>
          {/* Countdown / Exhausted */}
          {!suppressPrimaryTimer &&
            data.LastBidderAddr !== zeroAddress &&
            (allocationTime > now ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="gradient-border-card gradient-border-card-accent rounded-2xl bg-gradient-to-b from-primary/[0.06] to-transparent p-6 text-center"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Cycle finalizes in
                  <InfoTooltip
                    content="When this timer hits zero, the participant who made the Final Gesture may finalize the cycle and receive the Signature Allocation. Each new gesture extends the timer."
                    className="ml-1.5"
                  />
                </p>
                <SmoothCountdown date={allocationTime} renderer={Counter} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="gradient-border-card rounded-2xl bg-primary/[0.06] p-6 text-center animate-pulse-glow"
              >
                <Zap className="mx-auto h-8 w-8 text-primary mb-2" />
                <h5 className="font-display text-xl font-bold text-primary">
                  Cycle Ready to Finalize
                </h5>
                <p className="mt-1 text-sm text-primary/80">The finalization clock reached zero.</p>
              </motion.div>
            ))}

          {/* Allocation + bid prices row */}
          <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              <GestureMetricCard
                label="Signature Allocation"
                value={`${(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH`}
                icon={<Trophy className="h-5 w-5" />}
                tone="signature"
                tooltip={`The ETH portion of the Signature Allocation; the recipient also receives 1,000 CST, a Cosmic Signature NFT${attachedAssetTooltipCopy}.`}
              />
            </motion.div>

            {data.LastBidderAddr !== zeroAddress && (
              <>
                <motion.div
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="h-full"
                >
                  <GestureMetricCard
                    label="ETH Gesture"
                    value={`${(ethGestureInfo?.ETHPrice ?? 0).toFixed(5)} ETH`}
                    icon={<Coins className="h-4 w-4" />}
                    tone="eth"
                    tooltip="Current cost to make a gesture with ETH"
                  />
                </motion.div>
                <motion.div
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="h-full"
                >
                  <GestureMetricCard
                    label="ETH + RandomWalk Gesture"
                    value={`${((ethGestureInfo?.ETHPrice ?? 0) / 2).toFixed(5)} ETH`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    tone="randomwalk"
                    tooltip="50% ETH Gesture Cost reduction when attaching a RandomWalk NFT to an ETH gesture"
                  />
                </motion.div>
                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="h-full"
                >
                  <GestureMetricCard
                    label="CST Gesture"
                    value={
                      cstGestureData.isFree
                        ? 'FREE'
                        : `${formatCstAmount(cstGestureData.CSTPrice)} CST`
                    }
                    detail={
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-muted-foreground">CST Window</span>
                          <span className="font-mono tabular-nums text-[rgb(var(--impact-green-rgb))]">
                            {cstAuctionProgress.percentCompleteRounded}%
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label="CST Calibration Window progress"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={cstAuctionProgress.percentCompleteRounded}
                          className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] to-primary transition-all duration-500"
                            style={{ width: `${cstAuctionProgress.percentComplete}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Duration {formatSeconds(cstAuctionProgress.auctionDuration)}
                        </p>
                      </div>
                    }
                    icon={<Zap className="h-4 w-4" />}
                    tone="cst"
                    tooltip="Gesture with CST. Cost descends over time via the Calibration Window — can become free."
                  />
                </motion.div>
              </>
            )}
          </div>

          {/* Selection frequency */}
          {curGestureList.length > 0 && selectionFrequency && data && (
            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3"
            >
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary/70" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Your Cycle Standing
                </p>
                <InfoTooltip content="Shows your current Final Gesture standing and Stellar Selection frequency based on your gestures this cycle." />
              </div>
              {data.LastBidderAddr === account ? (
                <p className="text-sm font-medium text-emerald-400">
                  You made the most recent gesture. If no one else gestures, you receive the
                  Signature Allocation ({(data.PrizeAmountEth ?? 0).toFixed(4)} ETH, 1,000 CST, 1
                  Cosmic Signature NFT{attachedAssetAllocationCopy}).
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You are not the most recent participant &mdash; gesture again to take the lead, or
                  remain eligible for Stellar Selection.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ETH Stellar Selection</span>
                    <span className="font-medium text-primary">
                      {selectionFrequency.stellarEth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(selectionFrequency.stellarEth, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">NFT Stellar Selection</span>
                    <span className="font-medium text-accent">
                      {selectionFrequency.nft.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(selectionFrequency.nft, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-border-card rounded-2xl bg-primary/[0.04] p-8 text-center"
        >
          {data && data.CurRoundNum > 0 ? (
            <h4 className="font-display text-2xl font-bold">Cycle {data.CurRoundNum}</h4>
          ) : (
            <h4 className="font-display text-2xl font-bold">Open the Cycle</h4>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            The Calibration Window for the first ETH gesture is open. Make your gesture.
          </p>
        </motion.div>
      )}
    </div>
  );
};
