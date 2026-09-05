'use client';

import type { RefObject } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight, ChevronDown, Settings2 } from 'lucide-react';
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
  /** The surrounding dashboard already renders the live Calibration Window. */
  calibrationExternal?: boolean;
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
  calibrationExternal = false,
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
  const selectedMethod = METHOD_OPTIONS.find((option) => option.value === gestureType);
  const isFirstGesture = data?.LastBidderAddr === zeroAddress;
  const showAllMethods = !isFirstGesture;
  const visibleMethods = showAllMethods
    ? METHOD_OPTIONS
    : METHOD_OPTIONS.filter((option) => option.value === 'ETH');

  const ethPrice = ethGestureInfo?.ETHPrice;
  const hasEthQuote = ethPrice != null && Number.isFinite(ethPrice) && ethPrice >= 0;
  const hasCstQuote = cstGestureData.source !== 'empty';
  const quotePending = tCommon('status.loadingDots');
  const methodCost: Record<(typeof METHOD_OPTIONS)[number]['value'], string> = {
    ETH: hasEthQuote ? `${ethPrice.toFixed(5)} ETH` : quotePending,
    RandomWalk: hasEthQuote ? `${(ethPrice / 2).toFixed(5)} ETH` : quotePending,
    CST: !hasCstQuote
      ? quotePending
      : cstGestureData.isFree
        ? t('status.metrics.free')
        : `${formatCstAmount(cstGestureData.CSTPrice)} CST`,
  };

  const currentCstGestureCost = cstGestureData.isFree ? 0 : cstGestureData.CSTPrice;
  const hasCstReward = gestureCstRewardAmount != null && Number.isFinite(gestureCstRewardAmount);
  const hasCstCost =
    hasCstQuote && Number.isFinite(currentCstGestureCost) && currentCstGestureCost >= 0;
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
  const minAcceptedCstLabel =
    !hasCstReward || isCstRewardLoading
      ? t('form.reward.cstAmount', { amount: '--' })
      : acceptAnyCstReward
        ? t('form.reward.minAcceptedAny')
        : t('form.reward.cstAmount', { amount: formatCstAmount(gestureCstRewardAmountMin) });
  const minAcceptedCstTooltip = acceptAnyCstReward
    ? t('form.reward.minAcceptedTooltipAny')
    : t('form.reward.minAcceptedTooltip');

  const needsRwlkToken = gestureType === 'RandomWalk' && rwlkId === -1;
  const hasSelectedQuote = gestureType === 'CST' ? hasCstQuote : hasEthQuote;
  const submitDisabled =
    isGesturing || needsRwlkToken || gestureType === '' || !canGesture || !hasSelectedQuote;

  const messageLabel = (
    <>
      {t('form.advanced.messageLabel')}{' '}
      <span className="normal-case tracking-normal text-muted-foreground">
        {t('form.advanced.messageOptionalHint', { maxLength: String(MESSAGE_MAX_LENGTH) })}
      </span>
    </>
  );
  const messageCounter = (
    <span
      data-testid="gesture-message-char-count"
      className={cn(
        'ml-auto shrink-0 text-xs tabular-nums',
        message.length >= MESSAGE_COUNTER_WARN_AT ? 'text-amber-300' : 'text-muted-foreground/60',
      )}
    >
      {message.length}/{MESSAGE_MAX_LENGTH}
    </span>
  );
  const messageInput = (
    <textarea
      id={`gesture-message-${variant}`}
      ref={messageInputRef}
      data-testid="gesture-message-input"
      aria-label={compactDesk ? t('form.advanced.messageLabel') : undefined}
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
  );

  if (!loading && !isRoundActive) return null;

  return (
    <Surface
      asChild
      variant="plain"
      radius={embedded ? 'none' : 'xl'}
      padding="none"
      className={cn(embedded && 'border-0 bg-transparent shadow-none', 'min-w-0', className)}
    >
      <section
        aria-labelledby={`gesture-panel-title-${variant}`}
        data-testid="gesture-panel"
        data-variant={variant}
        id={variant === 'card' ? 'make-gesture' : undefined}
        className="scroll-mt-24 focus:outline-none"
        tabIndex={-1}
      >
        <div
          className={cn(
            'flex flex-col',
            compactDesk ? 'gap-2 p-3' : embedded ? 'gap-3 p-3.5' : 'gap-3',
            !embedded && (variant === 'card' ? 'p-4 sm:p-5' : 'p-1'),
          )}
        >
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2
                id={`gesture-panel-title-${variant}`}
                className={cn(
                  'font-display font-bold tracking-tight',
                  embedded ? 'text-base' : 'text-lg',
                )}
              >
                {t('form.title')}
              </h2>
              {compactDesk && selectedMethod && (
                <InfoTooltip content={t(`orientation.methods.${selectedMethod.messageKey}`)} />
              )}
              {compactDesk && !loading && gestureType === 'CST' && (
                <UniswapTradeButton variant="compact" className="ml-auto" />
              )}
            </div>
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
                <Label
                  className={cn(
                    'mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground',
                    compactDesk && 'sr-only',
                  )}
                >
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
                        'min-w-0 rounded-lg border px-2 text-center transition-all',
                        compactDesk ? 'py-1.5' : embedded ? 'py-2' : 'min-h-20 py-3',
                        gestureType === option.value
                          ? 'border-primary/50 bg-primary/10 text-white'
                          : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white',
                      )}
                    >
                      <span className="block text-sm font-medium [overflow-wrap:anywhere]">
                        {t(`form.method.${option.messageKey}.label`)}
                      </span>
                      {/* Wraps rather than truncating: at 320px the tab is
                          ~76px wide and an ellipsis would hide the price —
                          the one thing this control exists to show. */}
                      <span
                        data-testid={`panel-method-${option.messageKey}-cost`}
                        className="mt-0.5 block font-mono text-xs leading-tight tabular-nums text-muted-foreground [overflow-wrap:anywhere]"
                      >
                        {methodCost[option.value]}
                      </span>
                      {!compactDesk && (
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {t(`form.method.${option.messageKey}.desc`)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {!compactDesk && selectedMethod && (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {t(`orientation.methods.${selectedMethod.messageKey}`)}
                  </p>
                )}
              </div>

              {/* Method context: calibration windows, token picker, CST trade. */}
              {!calibrationExternal && isFirstGesture && hasEthQuote && (
                <AuctionInfo
                  compact
                  secondsElapsed={ethGestureInfo?.SecondsElapsed ?? 0}
                  auctionDuration={ethGestureInfo?.AuctionDuration ?? 0}
                  title={t('calibration.firstGestureTitle')}
                  subtitle={t('calibration.firstGestureSubtitle')}
                />
              )}

              {!calibrationExternal && !isFirstGesture && hasCstQuote && (
                <AuctionInfo
                  compact
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

              {gestureType === 'CST' && !compactDesk && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/15 bg-primary/[0.045] p-3">
                  <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                    {t('form.cstTrade')}
                  </p>
                  <UniswapTradeButton variant="compact" />
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
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        {rewardPreviewTitle}
                      </p>
                      <InfoTooltip content={rewardPreviewDescription} className="shrink-0" />
                    </div>
                    {gestureType !== 'CST' && (
                      <p className="min-w-0 font-mono text-sm font-semibold tabular-nums text-emerald-300 [overflow-wrap:anywhere]">
                        {isCstRewardLoading
                          ? tCommon('status.loadingDots')
                          : t('form.reward.cstAmount', {
                              amount: formatCstAmount(gestureCstRewardAmount),
                            })}
                      </p>
                    )}
                  </div>
                  {gestureType === 'CST' && (
                    <dl
                      data-testid="panel-cst-economics"
                      className="mt-2 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-1.5"
                    >
                      {[
                        {
                          key: 'reward',
                          label: t('form.reward.rewardLabel'),
                          value: isCstRewardLoading
                            ? tCommon('status.loadingDots')
                            : t('form.reward.cstAmount', {
                                amount: formatCstAmount(gestureCstRewardAmount),
                              }),
                          color: 'text-emerald-300',
                        },
                        {
                          key: 'cost',
                          label: t('form.reward.costLabel'),
                          value: t('form.reward.cstAmount', {
                            amount: hasCstCost ? formatCstAmount(currentCstGestureCost) : '--',
                          }),
                          color: 'text-foreground',
                        },
                        {
                          key: 'net',
                          label: t('form.reward.netLabel'),
                          value: isCstRewardLoading ? tCommon('status.loadingDots') : netCstLabel,
                          color:
                            netCstAmount != null && netCstAmount > 0
                              ? 'text-emerald-300'
                              : netCstAmount != null && netCstAmount < 0
                                ? 'text-amber-200'
                                : 'text-muted-foreground',
                        },
                      ].map(({ key, label, value, color }) => (
                        <div
                          key={key}
                          data-testid={`panel-cst-metric-${key}`}
                          className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5"
                        >
                          <dt className="text-xs leading-tight text-muted-foreground [overflow-wrap:anywhere]">
                            {label}
                          </dt>
                          <dd
                            className={cn(
                              'mt-1 font-mono text-xs font-semibold leading-snug tabular-nums [overflow-wrap:anywhere]',
                              color,
                            )}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-1.5 flex min-w-0 items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {t('form.reward.minAccepted', { value: minAcceptedCstLabel })}
                    </span>
                    <InfoTooltip
                      content={minAcceptedCstTooltip}
                      ariaLabel={t('form.reward.minAcceptedAria')}
                      maxWidth={320}
                      side="top"
                      className="mt-0.5 shrink-0 text-muted-foreground/60"
                    />
                  </p>
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

              <p
                data-testid="participation-cost-note"
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {t('orientation.costsNote')}
              </p>

              {!preview && (
                <div className={compactDesk ? 'grid grid-cols-2 items-start gap-x-3' : 'contents'}>
                  {/* The optional editor keeps decision data and the action in view. */}
                  {compactDesk ? (
                    <details
                      data-testid="panel-message-disclosure"
                      className="group/message min-w-0 border-b border-white/[0.06] open:col-span-2"
                    >
                      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-xs text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary sm:min-h-8 [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0 [overflow-wrap:anywhere]">{messageLabel}</span>
                        {messageCounter}
                        <ChevronDown
                          className="h-3.5 w-3.5 shrink-0 transition-transform group-open/message:rotate-180"
                          aria-hidden
                        />
                      </summary>
                      <div className="space-y-2 pt-1.5">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {t('form.advanced.messageTooltip')}
                        </p>
                        {messageInput}
                      </div>
                    </details>
                  ) : (
                    <div>
                      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Label
                          htmlFor={`gesture-message-${variant}`}
                          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {messageLabel}
                        </Label>
                        <InfoTooltip
                          content={t('form.advanced.messageTooltip')}
                          ariaLabel={t('form.advanced.messageTooltipAria')}
                          maxWidth={260}
                        />
                        {messageCounter}
                      </div>
                      {messageInput}
                    </div>
                  )}

                  {/* Advanced: attachments and transaction protections. */}
                  <Accordion
                    type="single"
                    collapsible
                    className={cn('min-w-0', compactDesk && advancedExpanded && 'col-span-2')}
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
                                    amount: hasEthQuote
                                      ? (
                                          ethPrice *
                                          (1 + gestureCostPlus / 100) *
                                          (gestureType === 'RandomWalk' ? 0.5 : 1)
                                        ).toFixed(6)
                                      : '--',
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
                </div>
              )}

              {/* Submit — the only gesture button on the page. */}
              {account ? (
                <div className="space-y-2.5">
                  {canGesture ? (
                    <Button
                      id={variant === 'card' ? 'gesture-submit' : 'gesture-submit-sheet'}
                      size="lg"
                      onClick={onSubmit}
                      className="h-auto min-h-12 w-full whitespace-normal border-0 bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] px-3 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                      disabled={submitDisabled}
                    >
                      {isGesturing ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> {t('form.processing')}
                        </span>
                      ) : (
                        <>
                          <span className="min-w-0 [overflow-wrap:anywhere]">{submitLabel}</span>
                          <ArrowRight className="h-5 w-5 shrink-0" />
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
                  className={cn(
                    'flex flex-col items-stretch border-t border-white/10 [&_button]:w-full',
                    compactDesk ? 'gap-2 pt-2' : 'gap-4 pt-5',
                  )}
                >
                  <div className={cn('min-w-0 flex-1', compactDesk && 'sr-only')}>
                    {!compactDesk && (
                      <h3 className="font-display text-base font-semibold tracking-tight">
                        {t('form.connect.title')}
                      </h3>
                    )}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('orientation.connectHelp')}
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
