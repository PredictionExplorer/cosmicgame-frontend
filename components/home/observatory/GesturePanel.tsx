'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight, ChevronDown, PenLine, Settings2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import PaginationRWLKGrid from '@/components/nft/PaginationRWLKGrid';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { MessageTextarea } from '@/components/ui/message-textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { FundingNotice } from '@/components/wallet/FundingNotice';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import { useTxStageLabel, type TxStage } from '@/hooks/useTxFlow';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api/types';
import { formatAmountParts, formatDuration } from '@/utils/format';
import type { CstGestureData } from '@/utils/cstGesture';
import { ethGestureBaseCost, ethGestureSendAmount, formatEthQuote } from '@/utils/gestureQuote';

import { GestureAdvanced } from './GestureAdvanced';
import { ValuePending } from './ValuePending';
import {
  GESTURE_METHODS,
  GestureMethodControl,
  type GestureMethodValue,
  type MethodCost,
} from './GestureMethodControl';
import type { GestureSubmitParts } from './gestureSubmitLabel';

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

/** What the connected wallet spent this cycle, read from its indexed history. */
export type CycleSpend =
  | { status: 'loading' }
  | { status: 'unknown' }
  | { status: 'ready'; eth: number; cst: number };

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
  /** The one shared submit label, as verb and price — the shown cost can never drift. */
  submit: GestureSubmitParts;
  canGesture: boolean;
  isGesturing: boolean;
  /** The gesture transaction's lifecycle, shown under the commit button. */
  txStage: TxStage;
  /** True once the finalization clock has ended. */
  cycleTimerEnded: boolean;
  onSubmit: () => void;
  /** Method switch that also resets any picked RandomWalk token. */
  onSelectGestureType: (value: string) => void;
  /**
   * `card` is the in-page surface and carries the `#make-gesture` anchor;
   * `sheet` renders the same panel inside the mobile bottom sheet.
   */
  variant?: 'card' | 'sheet';
  /** The connected wallet's standing, beside the form (card only). */
  standing?: ReactNode;
  /**
   * Show the standing on phones too. A placeholder standing (no wallet yet)
   * only earns its space beside the form, from tablets up.
   */
  standingOnPhones?: boolean;
  /** What the connected wallet spent this cycle; omit while disconnected. */
  cycleSpend?: CycleSpend | null;
  /** Moves to the clock's Finalize action (the Last Gesture holder at zero). */
  onGoToFinalize?: () => void;
  /** Each increment opens the message editor and focuses it (the chat's join action). */
  messageFocusRequest?: number;
  messageInputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

/** The ETH the form sends, in wei: the cost plus the collision buffer, then the NFT reduction. */
function ethSendWei(priceWei: bigint, gestureType: string, bufferPercent: number): bigint {
  const buffered = (priceWei * BigInt(100 + bufferPercent)) / 100n;
  return gestureType === 'RandomWalk'
    ? (buffered * BigInt(100 - protocolFacts.randomWalkDiscountPercentage)) / 100n
    : buffered;
}

function SpecRow({
  label,
  value,
  testId,
  valueClassName,
}: {
  label: ReactNode;
  value: ReactNode;
  testId?: string;
  valueClassName?: string;
}) {
  return (
    <div data-testid={testId} className="flex min-w-0 items-baseline justify-between gap-4 py-2.5">
      <dt className="type-label min-w-0 text-subtle">{label}</dt>
      <dd className={cn('type-figure-sm min-w-0 text-end text-foreground', valueClassName)}>
        {value}
      </dd>
    </div>
  );
}

/**
 * The one gesture surface, in reading order: the method (each with its live
 * price), what the Gesture imprints, an optional message, the optional
 * settings, the not-refunded note beside what this wallet already spent, and
 * the one commit action with its price. The decision and the action lead; the
 * message recedes behind "Add a message" until it is wanted. Beside it, the
 * connected wallet's standing.
 */
export function GesturePanel({
  data,
  loading,
  isRoundActive,
  account = null,
  form,
  cstGestureData,
  submit,
  canGesture,
  isGesturing,
  txStage,
  cycleTimerEnded,
  onSubmit,
  onSelectGestureType,
  variant = 'card',
  standing,
  standingOnPhones = true,
  cycleSpend = null,
  onGoToFinalize,
  messageFocusRequest = 0,
  messageInputRef,
  className,
}: GesturePanelProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const stageLabel = useTxStageLabel();
  const isSheet = variant === 'sheet';
  const messageId = `gesture-message-${variant}`;
  const messageRegionId = useId();
  const advancedRegionId = useId();
  const localMessageRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    gestureType,
    message,
    setMessage,
    rwlkId,
    setRwlkId,
    gestureCostPlus,
    advancedExpanded,
    setAdvancedExpanded,
    rwlknftIds,
    ethGestureInfo,
    gestureCstRewardAmount = null,
    gestureCstRewardAmountMin = null,
    isCstRewardLoading = false,
    acceptAnyCstReward = false,
  } = form;

  // The message recedes in the page form and opens in the sheet; a shared
  // draft (typed in the other surface) keeps it open.
  const [messageOpen, setMessageOpen] = useState(isSheet || message !== '');
  const [handledFocusRequest, setHandledFocusRequest] = useState(messageFocusRequest);
  if (messageFocusRequest !== handledFocusRequest) {
    setHandledFocusRequest(messageFocusRequest);
    if (messageFocusRequest > 0) setMessageOpen(true);
  }
  if (!messageOpen && message !== '') setMessageOpen(true);
  useEffect(() => {
    if (messageFocusRequest <= 0) return undefined;
    const id = window.requestAnimationFrame(() =>
      (messageInputRef?.current ?? localMessageRef.current)?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(id);
  }, [messageFocusRequest, messageInputRef]);

  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    localMessageRef.current = node;
    if (messageInputRef) messageInputRef.current = node;
  };

  const preview = !account;
  const isFirstGesture = data?.LastBidderAddr === zeroAddress;
  const methods = isFirstGesture
    ? GESTURE_METHODS.filter((method) => method.value === 'ETH')
    : GESTURE_METHODS;

  const ethPrice = ethGestureInfo?.ETHPrice;
  const hasEthQuote = ethPrice != null && Number.isFinite(ethPrice) && ethPrice >= 0;
  const hasCstQuote = cstGestureData.source !== 'empty';
  const cstParts = hasCstQuote
    ? formatAmountParts(cstGestureData.isFree ? 0 : cstGestureData.CSTPrice, {
        unit: 'CST',
        locale,
      })
    : null;
  const costs: Record<GestureMethodValue, MethodCost | null> = {
    ETH: hasEthQuote
      ? { value: formatEthQuote(ethGestureBaseCost(ethPrice, 'ETH'), locale), unit: 'ETH' }
      : null,
    RandomWalk: hasEthQuote
      ? { value: formatEthQuote(ethGestureBaseCost(ethPrice, 'RandomWalk'), locale), unit: 'ETH' }
      : null,
    CST: cstParts ? { value: cstParts.number, unit: 'CST' } : null,
  };

  const ethMethod = gestureType === 'ETH' || gestureType === 'RandomWalk';
  const currentCstCost = cstGestureData.isFree ? 0 : cstGestureData.CSTPrice;
  const hasCstReward = gestureCstRewardAmount != null && Number.isFinite(gestureCstRewardAmount);
  const hasCstCost = hasCstQuote && Number.isFinite(currentCstCost) && currentCstCost >= 0;
  const netCst = hasCstReward && hasCstCost ? gestureCstRewardAmount - currentCstCost : null;

  const needsRwlkToken = gestureType === 'RandomWalk' && rwlkId === -1;
  const hasSelectedQuote = gestureType === 'CST' ? hasCstQuote : hasEthQuote;
  const submitUnavailable = needsRwlkToken || gestureType === '' || !hasSelectedQuote;
  const busyLabel = isGesturing ? stageLabel(txStage) : null;

  const priceWei = ethGestureInfo?.ETHPriceWei;
  const requiredWei =
    account && ethMethod && priceWei != null
      ? ethSendWei(priceWei, gestureType, gestureCostPlus)
      : null;

  const pendingValue = <ValuePending ch={9} />;
  const cstAmount = (value: number | null) =>
    value == null ? pendingValue : <Amount value={value} unit="CST" context="card" />;

  if (!loading && !isRoundActive) return null;

  const decision = loading ? (
    <div
      className="space-y-4"
      role="status"
      aria-label={t('form.loadingAria')}
      data-testid="gesture-panel-skeleton"
    >
      <Skeleton className="h-16 rounded-control" />
      <Skeleton className="h-10" />
      <Skeleton className="h-14 rounded-control" />
    </div>
  ) : (
    <div data-testid="gesture-panel-layout" className="space-y-5">
      <GestureMethodControl
        methods={methods}
        selected={gestureType}
        costs={costs}
        randomWalkEligible={rwlknftIds.length > 0}
        onSelect={onSelectGestureType}
        showLabel={isSheet}
      />

      {gestureType === 'RandomWalk' && (
        <div data-testid="panel-rwlk-picker" className="min-w-0">
          <h3 id={`rwlk-picker-title-${variant}`} className="type-label text-foreground">
            {t('form.rwlk.title')}
          </h3>
          <p className="type-caption mt-1 text-subtle">{t('form.rwlk.tooltip')}</p>
          <div className="mt-3">
            <PaginationRWLKGrid
              compact={!isSheet}
              loading={false}
              data={rwlknftIds}
              selectedToken={rwlkId}
              setSelectedToken={setRwlkId}
              labelledBy={`rwlk-picker-title-${variant}`}
            />
          </div>
        </div>
      )}

      {/* What this Gesture imprints, as spec rows: label left, figure right. */}
      {!isFirstGesture && (
        <dl
          data-testid="panel-cst-reward"
          className="divide-y divide-rule-faint border-y border-rule-faint"
        >
          {gestureType === 'CST' ? (
            <>
              <SpecRow
                testId="panel-cst-metric-reward"
                label={
                  <ExplainedTerm definition={t('form.reward.economicsDescription')}>
                    {t('form.reward.rewardLabel')}
                  </ExplainedTerm>
                }
                value={cstAmount(isCstRewardLoading ? null : gestureCstRewardAmount)}
              />
              <SpecRow
                testId="panel-cst-metric-cost"
                label={t('form.reward.costLabel')}
                value={hasCstCost ? cstAmount(currentCstCost) : pendingValue}
              />
              <SpecRow
                testId="panel-cst-metric-net"
                label={t('form.reward.netLabel')}
                value={
                  netCst == null || isCstRewardLoading ? (
                    pendingValue
                  ) : (
                    <Amount value={netCst} unit="CST" context="card" signDisplay="exceptZero" />
                  )
                }
              />
            </>
          ) : (
            <SpecRow
              testId="panel-cst-metric-reward"
              label={
                <ExplainedTerm definition={t('form.reward.previewDescription')}>
                  {t('form.reward.previewTitle')}
                </ExplainedTerm>
              }
              value={cstAmount(isCstRewardLoading ? null : gestureCstRewardAmount)}
            />
          )}
          <SpecRow
            testId="panel-cst-min-accepted"
            label={
              <ExplainedTerm
                definition={
                  acceptAnyCstReward
                    ? t('form.reward.minAcceptedTooltipAny')
                    : t('form.reward.minAcceptedTooltip')
                }
              >
                {t('form.reward.minAcceptedLabel')}
              </ExplainedTerm>
            }
            value={
              acceptAnyCstReward ? (
                <span className="type-body-sm text-muted-foreground">
                  {t('form.reward.minAcceptedAny')}
                </span>
              ) : (
                cstAmount(!hasCstReward || isCstRewardLoading ? null : gestureCstRewardAmountMin)
              )
            }
          />
        </dl>
      )}
      {gestureType === 'CST' &&
        cstGestureData.source === 'contract' &&
        cstGestureData.apiAuctionDuration != null &&
        cstGestureData.apiAuctionDuration !== cstGestureData.AuctionDuration && (
          <p className="type-caption text-attention">
            {t('form.reward.durationMismatch', {
              contractDuration: formatDuration(cstGestureData.AuctionDuration, { locale }),
              apiDuration: formatDuration(cstGestureData.apiAuctionDuration, { locale }),
            })}
          </p>
        )}

      {/* The optional message recedes until wanted; drafting needs no wallet. */}
      <div data-testid="gesture-panel-message" className="min-w-0">
        {isSheet ? null : (
          <button
            type="button"
            data-testid="gesture-message-toggle"
            aria-expanded={messageOpen}
            aria-controls={messageRegionId}
            onClick={() => setMessageOpen((open) => !open)}
            className="group inline-flex min-h-11 items-center gap-2 rounded-control text-start text-sm font-medium text-foreground sm:min-h-9"
          >
            <PenLine className="size-4 shrink-0 text-subtle" aria-hidden />
            <span>
              {t('form.message.add')}{' '}
              <span className="type-caption font-normal text-subtle">
                {t('form.advanced.messageOptionalHint', { maxLength: String(MESSAGE_MAX_LENGTH) })}
              </span>
            </span>
            <ChevronDown
              className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-aria-expanded:rotate-180 motion-reduce:transition-none"
              aria-hidden
            />
          </button>
        )}
        <div id={messageRegionId} hidden={!messageOpen} className={cn(!isSheet && 'mt-2')}>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={messageId} className="type-label text-muted-foreground">
              {t('form.advanced.messageLabel')}
              {isSheet && (
                <>
                  {' '}
                  <span className="type-caption text-subtle">
                    {t('form.advanced.messageOptionalHint', {
                      maxLength: String(MESSAGE_MAX_LENGTH),
                    })}
                  </span>
                </>
              )}
            </label>
            <span
              id={`${messageId}-count`}
              data-testid="gesture-message-char-count"
              className={cn(
                'type-caption shrink-0 tabular-nums',
                message.length >= MESSAGE_COUNTER_WARN_AT ? 'text-attention' : 'text-subtle',
              )}
            >
              {message.length}/{MESSAGE_MAX_LENGTH}
            </span>
          </div>
          <MessageTextarea
            id={messageId}
            ref={setTextareaRef}
            data-testid="gesture-message-input"
            aria-describedby={`${messageId}-count ${messageId}-note`}
            placeholder={t('form.advanced.messagePlaceholder')}
            value={message}
            maxLength={MESSAGE_MAX_LENGTH}
            rows={3}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1.5"
          />
          <p id={`${messageId}-note`} className="type-caption mt-1.5 text-subtle">
            {t('form.advanced.messageTooltip')}
          </p>
        </div>
      </div>

      {/* Optional transaction settings, for a connected wallet. */}
      {!preview && (
        <div data-testid="gesture-panel-advanced" className="min-w-0">
          <button
            type="button"
            id={`${advancedRegionId}-trigger`}
            aria-expanded={advancedExpanded}
            aria-controls={advancedRegionId}
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="group inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-medium text-muted-foreground hover:text-foreground sm:min-h-9"
          >
            <Settings2 className="size-4 shrink-0 text-subtle" aria-hidden />
            {t('form.advanced.title')}
            <ChevronDown
              className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-aria-expanded:rotate-180 motion-reduce:transition-none"
              aria-hidden
            />
          </button>
          <div
            id={advancedRegionId}
            role="region"
            aria-labelledby={`${advancedRegionId}-trigger`}
            hidden={!advancedExpanded}
            className="mt-3"
          >
            {advancedExpanded && (
              <GestureAdvanced
                form={form}
                showCstProtection={!isFirstGesture}
                ethPrice={hasEthQuote ? ethPrice : null}
                ethMethod={ethMethod}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );

  const action = loading ? null : (
    <div
      data-testid="gesture-panel-action"
      className={cn(
        'space-y-3',
        isSheet
          ? 'sticky bottom-0 -mx-4 border-t border-rule-faint bg-surface-raised px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4'
          : 'border-t border-rule-faint pt-5',
      )}
    >
      <p data-testid="participation-cost-note" className="type-body-sm text-muted-foreground">
        {t('orientation.costsNote')}
      </p>
      {cycleSpend && (
        <p data-testid="personal-spent" className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="type-label text-subtle">{t('observatory.standing.spent')}</span>{' '}
          <span className="type-figure-sm text-foreground">
            {cycleSpend.status === 'loading' ? (
              <ValuePending ch={16} />
            ) : cycleSpend.status === 'unknown' ? (
              <UnknownValue label={t('observatory.standing.checkFailed')} />
            ) : (
              <>
                {cycleSpend.eth > 0 || cycleSpend.cst <= 0 ? (
                  <Amount value={cycleSpend.eth} unit="ETH" context="card" />
                ) : null}
                {/* Two currencies side by side, never summed into one figure. */}
                {cycleSpend.eth > 0 && cycleSpend.cst > 0 ? (
                  <span className="px-1.5 text-subtle"> · </span>
                ) : null}
                {cycleSpend.cst > 0 ? (
                  <Amount value={cycleSpend.cst} unit="CST" context="card" />
                ) : null}
              </>
            )}
          </span>
        </p>
      )}

      {account ? (
        canGesture ? (
          <>
            {ethMethod && <FundingNotice requiredWei={requiredWei} />}
            <ChainGuard buttonClassName="w-full min-h-14">
              <Button
                id={isSheet ? 'gesture-submit-sheet' : 'gesture-submit'}
                variant="commit"
                size="xl"
                onClick={onSubmit}
                loading={isGesturing}
                disabled={submitUnavailable}
                className="w-full"
              >
                {busyLabel ?? (
                  <span className="flex min-w-0 flex-wrap items-baseline justify-center gap-x-2">
                    <span>{submit.action}</span>{' '}
                    {submit.cost && (
                      <span className="tabular-nums">
                        <span aria-hidden className="opacity-70">
                          ·{' '}
                        </span>
                        {submit.cost}
                      </span>
                    )}
                  </span>
                )}
              </Button>
            </ChainGuard>
            <TxStatus stage={txStage} variant="steps" />
            {ethMethod && hasEthQuote && gestureCostPlus > 0 && !isGesturing ? (
              <p className="type-caption text-subtle" data-testid="gesture-send-amount">
                {t('form.submit.sendsNote', {
                  amount: formatEthQuote(
                    ethGestureSendAmount(ethPrice, gestureType, gestureCostPlus),
                    locale,
                  ),
                  percent: gestureCostPlus,
                })}
              </p>
            ) : null}
          </>
        ) : cycleTimerEnded ? (
          <div data-testid="gesture-finalize-pointer" className="space-y-3">
            <p className="type-body-sm text-foreground">{t('form.finalizeAtClock')}</p>
            {onGoToFinalize && (
              <Button variant="outline" onClick={onGoToFinalize} className="w-full">
                {t('observatory.standing.goToFinalize')}
                <ArrowRight aria-hidden />
              </Button>
            )}
          </div>
        ) : (
          <p className="type-body-sm text-muted-foreground">{t('form.finalGestureMade')}</p>
        )
      ) : (
        <div data-testid="connect-to-gesture" className="space-y-2">
          <ConnectWalletAction
            variant="commit"
            size="xl"
            warmOnVisible
            label={t('form.connect.cta')}
            className="w-full"
          />
          <p className="type-caption text-center text-subtle">{t('orientation.connectHelp')}</p>
        </div>
      )}
    </div>
  );

  return (
    <section
      aria-labelledby={`gesture-panel-title-${variant}`}
      data-testid="gesture-panel"
      data-variant={variant}
      id={isSheet ? undefined : 'make-gesture'}
      className={cn('@container/gesture min-w-0 scroll-mt-24 focus:outline-none', className)}
      tabIndex={-1}
    >
      <div
        className={cn(
          'grid min-w-0 gap-x-10 gap-y-8',
          standing && '@min-[52rem]/gesture:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]',
        )}
      >
        <div className="min-w-0 space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 id={`gesture-panel-title-${variant}`} className="type-heading-3 text-foreground">
              {t('form.title')}
            </h2>
            {!loading && gestureType === 'CST' && <UniswapTradeButton variant="compact" />}
          </header>
          {decision}
          {action}
        </div>
        {standing && (
          <div
            data-testid="gesture-panel-standing"
            className={cn(
              'min-w-0 border-t border-rule-faint pt-6 @min-[52rem]/gesture:border-s @min-[52rem]/gesture:border-t-0 @min-[52rem]/gesture:ps-10 @min-[52rem]/gesture:pt-0',
              !standingOnPhones && 'max-md:hidden',
            )}
          >
            {standing}
          </div>
        )}
      </div>
    </section>
  );
}
