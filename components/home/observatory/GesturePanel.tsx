'use client';

import type { RefObject } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight, Settings2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';
import { formatSeconds } from '@/utils';

import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { AuctionInfo } from '@/components/home/AuctionInfo';
import PaginationRWLKGrid from '@/components/nft/PaginationRWLKGrid';
import { CustomTextField } from '@/components/styled';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Surface } from '@/components/ui/surface';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import { formatCstAmount, type CstGestureData } from '@/utils/cstGesture';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import type { DashboardInfo } from '@/services/api/types';

const MESSAGE_MAX_LENGTH = protocolFacts.gestureMessageMaxLength;
const MESSAGE_COUNTER_WARN_AT = MESSAGE_MAX_LENGTH - 20;

/**
 * The shared gesture-form state the panel renders. Matches the shape of
 * `useGestureForm()` minus the fields the page overrides (live CST data) or
 * owns itself (submission orchestration).
 */
export interface GesturePanelFormState {
  gestureType: string;
  setBidType: (value: string) => void;
  contributionType: string;
  setContributionType: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  nftDonateAddress: string;
  setNftDonateAddress: (value: string) => void;
  nftId: string;
  setNftId: (value: string) => void;
  tokenDonateAddress: string;
  setTokenDonateAddress: (value: string) => void;
  tokenAmount: string;
  setTokenAmount: (value: string) => void;
  rwlkId: number;
  setRwlkId: (value: number) => void;
  gestureCostPlus: number;
  setBidPricePlus: (value: number) => void;
  advancedExpanded: boolean;
  setAdvancedExpanded: (value: boolean) => void;
  rwlknftIds: number[];
  ethGestureInfo: EthGestureInfo | null;
  gestureCstRewardAmount?: number | null;
  gestureCstRewardAmountMin?: number | null;
  isCstRewardLoading?: boolean;
  cstRewardTolerancePercent?: number;
  setCstRewardTolerancePercent?: (value: number) => void;
  acceptAnyCstReward?: boolean;
  setAcceptAnyCstReward?: (value: boolean) => void;
}

/** Wiring for the panel: live data, shared form state, and submit control. */
export interface GesturePanelProps {
  data: DashboardInfo | null;
  loading: boolean;
  /** True while gestures are accepted (open cycle or final window). */
  isRoundActive: boolean;
  account?: string | null;
  form: GesturePanelFormState;
  /** Live-derived CST state (elapsed seconds extrapolated between polls). */
  cstGestureData: CstGestureData;
  /** The one shared submit label — the shown cost can never drift. */
  submitLabel: string;
  canGesture: boolean;
  isGesturing: boolean;
  /** True once the finalization clock has ended (submit hides, note stays accurate). */
  cycleTimerEnded: boolean;
  onSubmit: () => void;
  /** Method switch that also resets any picked RandomWalk token. */
  onSelectGestureType: (value: string) => void;
  /**
   * `card` is the in-page surface and carries the `#make-gesture` anchor;
   * `sheet` renders the same panel inside the mobile bottom sheet.
   */
  variant?: 'card' | 'sheet';
  /** Removes the standalone card treatment inside the unified control desk/sheet. */
  embedded?: boolean;
  messageInputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

const METHOD_OPTIONS = [
  { value: 'ETH', messageKey: 'eth' },
  { value: 'RandomWalk', messageKey: 'randomWalk' },
  { value: 'CST', messageKey: 'cst' },
] as const;

function formatCompactCstDelta(value: number): string {
  return formatCstAmount(value)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
}

/**
 * The one gesture surface. Every way to participate — ETH, ETH + RandomWalk,
 * CST — lives here with its live cost, the on-chain message, asset
 * attachments, and the protections, so there is exactly one place to act and
 * one mental model to learn.
 */
export function GesturePanel({
  data,
  loading,
  isRoundActive,
  account = null,
  form,
  cstGestureData,
  submitLabel,
  canGesture,
  isGesturing,
  cycleTimerEnded,
  onSubmit,
  onSelectGestureType,
  variant = 'card',
  embedded = false,
  messageInputRef,
  className,
}: GesturePanelProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const compactDesk = embedded && variant === 'card';

  const {
    gestureType,
    contributionType,
    setContributionType,
    message,
    setMessage,
    nftDonateAddress,
    setNftDonateAddress,
    nftId,
    setNftId,
    tokenDonateAddress,
    setTokenDonateAddress,
    tokenAmount,
    setTokenAmount,
    rwlkId,
    setRwlkId,
    gestureCostPlus,
    setBidPricePlus,
    advancedExpanded,
    setAdvancedExpanded,
    rwlknftIds,
    ethGestureInfo,
    gestureCstRewardAmount = null,
    gestureCstRewardAmountMin = null,
    isCstRewardLoading = false,
    cstRewardTolerancePercent = 1,
    setCstRewardTolerancePercent,
    acceptAnyCstReward = false,
    setAcceptAnyCstReward,
  } = form;

  const preview = !account;
  const isFirstGesture = data?.LastBidderAddr === zeroAddress;
  const showAllMethods = !isFirstGesture;
  const visibleMethods = showAllMethods
    ? METHOD_OPTIONS
    : METHOD_OPTIONS.filter((option) => option.value === 'ETH');

  const ethPrice = ethGestureInfo?.ETHPrice ?? 0;
  const methodCost: Record<(typeof METHOD_OPTIONS)[number]['value'], string> = {
    ETH: `${ethPrice.toFixed(5)} ETH`,
    RandomWalk: `${(ethPrice / 2).toFixed(5)} ETH`,
    CST: cstGestureData.isFree
      ? t('status.metrics.free')
      : `${formatCstAmount(cstGestureData.CSTPrice)} CST`,
  };

  const currentCstGestureCost = cstGestureData.isFree ? 0 : cstGestureData.CSTPrice;
  const hasCstReward = gestureCstRewardAmount != null && Number.isFinite(gestureCstRewardAmount);
  const hasCstCost = Number.isFinite(currentCstGestureCost) && currentCstGestureCost >= 0;
  const netCstAmount =
    hasCstReward && hasCstCost ? gestureCstRewardAmount - currentCstGestureCost : null;
  const netCstLabel =
    netCstAmount == null
      ? t('form.reward.cstAmount', { amount: '--' })
      : t('form.reward.cstAmount', {
          amount: `${netCstAmount > 0 ? '+' : netCstAmount < 0 ? '-' : ''}${formatCompactCstDelta(
            Math.abs(netCstAmount),
          )}`,
        });
  const rewardPreviewTitle =
    gestureType === 'CST' ? t('form.reward.economicsTitle') : t('form.reward.previewTitle');
  const rewardPreviewDescription =
    gestureType === 'CST'
      ? t('form.reward.economicsDescription')
      : t('form.reward.previewDescription');
  const minAcceptedCstLabel = acceptAnyCstReward
    ? t('form.reward.minAcceptedAny')
    : t('form.reward.cstAmount', { amount: formatCstAmount(gestureCstRewardAmountMin) });
  const minAcceptedCstTooltip = acceptAnyCstReward
    ? t('form.reward.minAcceptedTooltipAny')
    : t('form.reward.minAcceptedTooltip');

  const needsRwlkToken = gestureType === 'RandomWalk' && rwlkId === -1;
  const submitDisabled = isGesturing || needsRwlkToken || gestureType === '' || !canGesture;

  if (!loading && !isRoundActive) return null;

  return (
    <Surface
      asChild
      variant={embedded ? 'plain' : 'gradient-border-accent'}
      radius={embedded ? 'none' : 'xl'}
      padding="none"
      className={cn(embedded && 'border-0 bg-transparent shadow-none', 'min-w-0', className)}
    >
      <section
        aria-labelledby={`gesture-panel-title-${variant}`}
        data-testid="gesture-panel"
        data-variant={variant}
        id={variant === 'card' ? 'make-gesture' : undefined}
        className="scroll-mt-24"
      >
        <div
          className={cn(
            'flex flex-col',
            compactDesk ? 'gap-2 p-3' : embedded ? 'gap-3 p-3.5' : 'gap-4',
            !embedded && (variant === 'card' ? 'p-4 sm:p-5' : 'p-1'),
          )}
        >
          <div>
            <h2
              id={`gesture-panel-title-${variant}`}
              className={cn(
                'font-display font-bold tracking-tight',
                embedded ? 'text-base' : 'text-lg',
              )}
            >
              {t('form.title')}
            </h2>
            <p className={cn('mt-0.5 text-xs text-muted-foreground', compactDesk && 'sr-only')}>
              {t('form.subtitle')}
            </p>
          </div>

          {loading ? (
            <div
              className="space-y-4"
              role="status"
              aria-label={t('form.loadingAria')}
              data-testid="gesture-panel-skeleton"
            >
              <div className="grid gap-2 grid-cols-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-12 rounded-md" />
            </div>
          ) : (
            <>
              {/* Method picker: every way to gesture, each with its live cost. */}
              <div>
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('form.methodLabel')}
                </Label>
                <div
                  role="group"
                  aria-label={t('form.methodLabel')}
                  data-testid="panel-method-tabs"
                  className={cn(
                    'grid gap-2',
                    visibleMethods.length === 1 ? 'grid-cols-1' : 'grid-cols-3',
                  )}
                >
                  {visibleMethods.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      data-testid={`panel-method-${option.messageKey}`}
                      onClick={() => onSelectGestureType(option.value)}
                      aria-pressed={gestureType === option.value}
                      className={cn(
                        'rounded-lg border px-2 text-center transition-all',
                        compactDesk ? 'py-1.5' : embedded ? 'py-2' : 'py-2.5',
                        gestureType === option.value
                          ? 'border-primary/50 bg-primary/10 text-white'
                          : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white',
                      )}
                    >
                      <span className="block text-sm font-medium">
                        {t(`form.method.${option.messageKey}.label`)}
                      </span>
                      {/* Wraps rather than truncating: at 320px the tab is
                          ~76px wide and an ellipsis would hide the price —
                          the one thing this control exists to show. */}
                      <span
                        data-testid={`panel-method-${option.messageKey}-cost`}
                        className="mt-0.5 block break-words font-mono text-[11px] leading-tight tabular-nums opacity-70"
                      >
                        {methodCost[option.value]}
                      </span>
                      {!compactDesk && (
                        <span className="mt-0.5 block text-[10px] opacity-60">
                          {t(`form.method.${option.messageKey}.desc`)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method context: calibration windows, token picker, CST trade. */}
              {gestureType === 'ETH' && isFirstGesture && (
                <AuctionInfo
                  secondsElapsed={ethGestureInfo?.SecondsElapsed ?? 0}
                  auctionDuration={ethGestureInfo?.AuctionDuration ?? 0}
                  title={t('calibration.firstGestureTitle')}
                  subtitle={t('calibration.firstGestureSubtitle')}
                />
              )}

              {gestureType === 'RandomWalk' && (
                <div
                  data-testid="panel-rwlk-picker"
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{t('form.rwlk.title')}</h3>
                    <InfoTooltip
                      content={t('form.rwlk.tooltip')}
                      ariaLabel={t('form.rwlk.tooltipAria')}
                    />
                  </div>
                  <PaginationRWLKGrid
                    loading={false}
                    data={rwlknftIds}
                    selectedToken={rwlkId}
                    setSelectedToken={setRwlkId}
                  />
                </div>
              )}

              {gestureType === 'CST' && (
                <div className="space-y-3">
                  <AuctionInfo
                    secondsElapsed={cstGestureData.SecondsElapsed}
                    auctionDuration={cstGestureData.AuctionDuration}
                    title={t('calibration.cstTitle')}
                    subtitle={t('calibration.cstSubtitle', {
                      decreasePercent: String(
                        protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
                      ),
                      increasePercent: String(
                        protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
                      ),
                    })}
                    endedMessage={t('calibration.cstEndedMessage')}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/15 bg-primary/[0.045] p-3">
                    <p className="max-w-md text-xs text-muted-foreground">{t('form.cstTrade')}</p>
                    <UniswapTradeButton variant="compact" />
                  </div>
                </div>
              )}

              {/* Participation CST economics for the chosen method. */}
              {showAllMethods && (
                <div
                  data-testid="panel-cst-reward"
                  className={cn(
                    'rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] text-sm',
                    compactDesk ? 'p-2' : 'p-3',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {rewardPreviewTitle}
                      </p>
                      {!embedded && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {rewardPreviewDescription}
                        </p>
                      )}
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      {gestureType === 'CST' ? (
                        <div className="grid min-w-[13rem] grid-cols-3 gap-1.5 text-left">
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t('form.reward.rewardLabel')}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-emerald-300">
                              {isCstRewardLoading
                                ? tCommon('status.loadingDots')
                                : t('form.reward.cstAmount', {
                                    amount: formatCstAmount(gestureCstRewardAmount),
                                  })}
                            </p>
                          </div>
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t('form.reward.costLabel')}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-foreground">
                              {t('form.reward.cstAmount', {
                                amount: formatCstAmount(currentCstGestureCost),
                              })}
                            </p>
                          </div>
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {t('form.reward.netLabel')}
                            </p>
                            <p
                              className={cn(
                                'mt-0.5 text-xs font-semibold',
                                netCstAmount != null && netCstAmount > 0
                                  ? 'text-emerald-300'
                                  : netCstAmount != null && netCstAmount < 0
                                    ? 'text-amber-200'
                                    : 'text-muted-foreground',
                              )}
                            >
                              {isCstRewardLoading ? tCommon('status.loadingDots') : netCstLabel}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-emerald-300">
                          {isCstRewardLoading
                            ? tCommon('status.loadingDots')
                            : t('form.reward.cstAmount', {
                                amount: formatCstAmount(gestureCstRewardAmount),
                              })}
                        </p>
                      )}
                      <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                        <span>{t('form.reward.minAccepted', { value: minAcceptedCstLabel })}</span>
                        <InfoTooltip
                          content={minAcceptedCstTooltip}
                          ariaLabel={t('form.reward.minAcceptedAria')}
                          maxWidth={320}
                          side="top"
                          className="text-muted-foreground/60"
                        />
                      </p>
                    </div>
                  </div>
                  {gestureType === 'CST' &&
                    cstGestureData.source === 'contract' &&
                    cstGestureData.apiAuctionDuration != null &&
                    cstGestureData.apiAuctionDuration !== cstGestureData.AuctionDuration && (
                      <p className="mt-2 text-xs text-amber-200/90">
                        {t('form.reward.durationMismatch', {
                          contractDuration: formatSeconds(cstGestureData.AuctionDuration, locale),
                          apiDuration: formatSeconds(cstGestureData.apiAuctionDuration, locale),
                        })}
                      </p>
                    )}
                </div>
              )}

              {!preview && (
                <>
                  {/* The on-chain message is first-class: it feeds the live feed. */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Label
                        htmlFor={`gesture-message-${variant}`}
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {t('form.advanced.messageLabel')}{' '}
                        <span className="normal-case tracking-normal opacity-50">
                          {t('form.advanced.messageOptionalHint', {
                            maxLength: String(MESSAGE_MAX_LENGTH),
                          })}
                        </span>
                      </Label>
                      <InfoTooltip
                        content={t('form.advanced.messageTooltip')}
                        ariaLabel={t('form.advanced.messageTooltipAria')}
                        maxWidth={260}
                      />
                    </div>
                    <textarea
                      id={`gesture-message-${variant}`}
                      ref={messageInputRef}
                      data-testid="gesture-message-input"
                      placeholder={t('form.advanced.messagePlaceholder')}
                      value={message}
                      maxLength={MESSAGE_MAX_LENGTH}
                      rows={compactDesk ? 1 : 2}
                      disabled={preview}
                      className={cn(
                        'flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60',
                        compactDesk ? 'min-h-11 py-2' : 'min-h-[56px] py-2.5',
                      )}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="mt-1 flex justify-end">
                      <span
                        data-testid="gesture-message-char-count"
                        className={cn(
                          'text-[11px] tabular-nums',
                          message.length >= MESSAGE_COUNTER_WARN_AT
                            ? 'text-amber-300'
                            : 'text-muted-foreground/60',
                        )}
                      >
                        {message.length}/{MESSAGE_MAX_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* Advanced: attachments and transaction protections. */}
                  <Accordion
                    type="single"
                    collapsible
                    value={advancedExpanded ? 'advanced' : ''}
                    onValueChange={(val) => !preview && setAdvancedExpanded(val === 'advanced')}
                  >
                    <AccordionItem value="advanced" className="border-white/[0.06]">
                      <AccordionTrigger
                        disabled={preview}
                        className={cn(
                          'py-2.5 text-sm text-muted-foreground hover:text-white',
                          TOUCH_TARGET_HEIGHT_CLASS,
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4" />
                          {t('form.advanced.title')}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-1">
                          <p className="text-xs text-muted-foreground">
                            {t('form.advanced.attachIntro')}
                          </p>
                          {showAllMethods && (
                            <div className="space-y-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {t('form.advanced.minCstProtection.title')}
                              </p>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {t('form.advanced.minCstProtection.body')}
                              </p>
                              <label className="flex items-start gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
                                <Checkbox
                                  checked={acceptAnyCstReward}
                                  disabled={preview || !setAcceptAnyCstReward}
                                  onChange={(e) => setAcceptAnyCstReward?.(e.currentTarget.checked)}
                                  aria-label={t('form.advanced.minCstProtection.acceptAnyAria')}
                                />
                                <span>
                                  <span className="block font-medium text-foreground">
                                    {t('form.advanced.minCstProtection.acceptAnyTitle')}
                                  </span>
                                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                    {t('form.advanced.minCstProtection.acceptAnyBody')}
                                  </span>
                                </span>
                              </label>
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                                    {t('form.advanced.minCstProtection.toleranceLabel')}
                                  </span>
                                  <div className="relative w-[4.75rem] shrink-0">
                                    <CustomTextField
                                      type="number"
                                      placeholder="1"
                                      value={cstRewardTolerancePercent}
                                      min={0}
                                      max={100}
                                      step={0.1}
                                      className="h-9 px-2.5 py-2 pr-7 text-sm tabular-nums"
                                      disabled={
                                        acceptAnyCstReward ||
                                        preview ||
                                        !setCstRewardTolerancePercent
                                      }
                                      onChange={(e) =>
                                        setCstRewardTolerancePercent?.(Number(e.target.value))
                                      }
                                    />
                                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      %
                                    </span>
                                  </div>
                                </div>
                                <span className="min-w-0 font-mono text-sm tabular-nums text-muted-foreground">
                                  {t('form.advanced.minCstProtection.minAmount', {
                                    amount: formatCstAmount(gestureCstRewardAmountMin),
                                  })}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {t('form.advanced.minCstProtection.revertNote')}
                              </p>
                            </div>
                          )}
                          <RadioGroup
                            value={contributionType}
                            onValueChange={(value) => {
                              setRwlkId(-1);
                              setContributionType(value);
                            }}
                            className="flex flex-row flex-wrap gap-x-4 gap-y-2"
                          >
                            <label className="flex cursor-pointer items-center gap-1.5">
                              <RadioGroupItem value="NFT" />
                              <span className="text-sm">{t('form.advanced.attachNft')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-1.5">
                              <RadioGroupItem value="Token" />
                              <span className="text-sm">{t('form.advanced.attachToken')}</span>
                            </label>
                          </RadioGroup>
                          {contributionType === 'Token' && (
                            <div className="space-y-3">
                              <div className="min-w-0">
                                <Label className="mb-1 block text-xs text-muted-foreground">
                                  {t('form.advanced.tokenContractLabel')}
                                </Label>
                                <Input
                                  placeholder="0x..."
                                  value={tokenDonateAddress}
                                  onChange={(e) => setTokenDonateAddress(e.target.value)}
                                  disabled={preview}
                                  className="w-full font-mono text-sm"
                                  spellCheck={false}
                                  autoComplete="off"
                                />
                              </div>
                              <div className="w-full max-w-[11rem]">
                                <Label className="mb-1 block text-xs text-muted-foreground">
                                  {t('form.advanced.tokenAmountLabel')}
                                </Label>
                                <Input
                                  placeholder="0.0"
                                  type="number"
                                  value={tokenAmount}
                                  onChange={(e) => setTokenAmount(e.target.value)}
                                  disabled={preview}
                                  className="font-mono text-sm tabular-nums"
                                />
                              </div>
                            </div>
                          )}
                          {contributionType === 'NFT' && (
                            <div className="space-y-3">
                              <div className="min-w-0">
                                <Label className="mb-1 block text-xs text-muted-foreground">
                                  {t('form.advanced.nftContractLabel')}
                                </Label>
                                <Input
                                  placeholder="0x..."
                                  value={nftDonateAddress}
                                  onChange={(e) => setNftDonateAddress(e.target.value)}
                                  disabled={preview}
                                  className="w-full font-mono text-sm"
                                  spellCheck={false}
                                  autoComplete="off"
                                />
                              </div>
                              <div className="w-full max-w-[7.5rem]">
                                <Label className="mb-1 block text-xs text-muted-foreground">
                                  {t('form.advanced.nftIdLabel')}
                                </Label>
                                <Input
                                  placeholder={t('form.advanced.nftIdPlaceholder')}
                                  type="number"
                                  min={0}
                                  value={nftId}
                                  onChange={(e) => setNftId(e.target.value)}
                                  disabled={preview}
                                  className="font-mono text-sm tabular-nums"
                                />
                              </div>
                            </div>
                          )}
                          {gestureType !== 'CST' && (
                            <div className="space-y-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {t('form.advanced.collision.title')}
                              </p>
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                                    {t('form.advanced.collision.raiseBy')}
                                  </span>
                                  <div className="relative w-[4.25rem] shrink-0">
                                    <CustomTextField
                                      type="number"
                                      placeholder="0"
                                      value={gestureCostPlus}
                                      min={0}
                                      max={50}
                                      className="h-9 px-2.5 py-2 pr-7 text-sm tabular-nums"
                                      disabled={preview}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value <= 50) setBidPricePlus(value);
                                      }}
                                    />
                                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      %
                                    </span>
                                  </div>
                                </div>
                                <span className="min-w-0 font-mono text-sm tabular-nums text-muted-foreground">
                                  {t('form.advanced.collision.approxCost', {
                                    amount: (
                                      ethPrice *
                                      (1 + gestureCostPlus / 100) *
                                      (gestureType === 'RandomWalk' ? 0.5 : 1)
                                    ).toFixed(6),
                                  })}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {t('form.advanced.collision.note', {
                                  percent: String(gestureCostPlus),
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              )}

              {/* Submit — the only gesture button on the page. */}
              {account ? (
                <div className="space-y-2.5">
                  {canGesture ? (
                    <Button
                      id={variant === 'card' ? 'gesture-submit' : 'gesture-submit-sheet'}
                      size="lg"
                      onClick={onSubmit}
                      className="h-12 w-full border-0 bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] text-base font-semibold text-white hover:opacity-90"
                      disabled={submitDisabled}
                    >
                      {isGesturing ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> {t('form.processing')}
                        </span>
                      ) : (
                        <>
                          {submitLabel} <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    !cycleTimerEnded && (
                      <p className="text-sm text-muted-foreground">{t('form.finalGestureMade')}</p>
                    )
                  )}
                  {!compactDesk && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('observatory.panel.microcopy')}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  data-testid="connect-to-gesture"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {t('form.connect.title')}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t('form.preview')}
                    </p>
                  </div>
                  <ConnectWalletButton
                    isMobileView={false}
                    loading={false}
                    balance={{ ETH: 0, CosmicToken: 0, CosmicSignature: 0, RWLK: 0 }}
                    stakedTokenCount={{ cst: 0, rwalk: 0 }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Surface>
  );
}
