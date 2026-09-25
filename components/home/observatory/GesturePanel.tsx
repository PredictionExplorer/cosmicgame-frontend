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
import {
  GESTURE_MESSAGE_MAX_BYTES,
  fitGestureMessage,
  gestureMessageBytes,
  isUsableRandomWalkToken,
} from '@/components/home/gestureInput';
import type { EthGestureInfo, RwlkListStatus } from '@/hooks/useGestureForm';
import { useTxStageLabel, type TxStage } from '@/hooks/useTxFlow';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatAmountParts, formatDuration } from '@/utils/format';
import type { CstGestureData } from '@/utils/cstGesture';
import { ethGestureSendAmount, formatEthMethodQuote, formatEthQuote } from '@/utils/gestureQuote';

import { GestureAdvanced } from './GestureAdvanced';
import { ValuePending } from './ValuePending';
import {
  GESTURE_METHODS,
  GestureMethodControl,
  type GestureMethodValue,
  type MethodCost,
} from './GestureMethodControl';
import type { GestureSubmitParts } from './gestureSubmitLabel';

/**
 * The 56px commit button at full width, allowed to take a second line: a
 * long label ("Під’єднати гаманець для жесту") wraps at 320px instead of
 * running past the button's edge.
 */
const COMMIT_WRAP = 'h-auto w-full whitespace-normal py-2.5 text-balance @container/commit';
/** The message counter turns to --attention this many bytes before the cap. */
const MESSAGE_COUNTER_WARN_BYTES = 20;

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
  /** The contract's cap on the message, in UTF-8 bytes; the documented default when absent. */
  messageMaxBytes?: number;
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
  /** A token the form let go because it is not one of this wallet's unused Random Walk NFTs. */
  rwlkRejectedId?: number | null;
  gestureCostPlus: number;
  setBidPricePlus: (value: number) => void;
  advancedExpanded: boolean;
  setAdvancedExpanded: (value: boolean) => void;
  rwlknftIds: number[];
  /** Where the read of `rwlknftIds` stands; absent means it has been read. */
  rwlkListStatus?: RwlkListStatus;
  ethGestureInfo: EthGestureInfo | null;
  gestureCstRewardAmount?: number | null;
  gestureCstRewardAmountMin?: number | null;
  isCstRewardLoading?: boolean;
  /** The last read of the Participation CST preview failed; it retries on its own poll. */
  cstRewardReadFailed?: boolean;
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
      {/* The label wraps; the figure keeps its width, so it never overflows the row. */}
      <dd className={cn('type-figure-sm shrink-0 text-end text-foreground', valueClassName)}>
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
 * message recedes behind "Add a message" until it is wanted. The wallet's
 * standing sits beside it on the desk (ControlDesk), not inside the form.
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
  cycleSpend = null,
  onGoToFinalize,
  messageFocusRequest = 0,
  messageInputRef,
  className,
}: GesturePanelProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
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
    messageMaxBytes = GESTURE_MESSAGE_MAX_BYTES,
    rwlkId,
    setRwlkId,
    rwlkRejectedId = null,
    gestureCostPlus,
    advancedExpanded,
    setAdvancedExpanded,
    rwlknftIds,
    rwlkListStatus = 'ready',
    ethGestureInfo,
    gestureCstRewardAmount = null,
    gestureCstRewardAmountMin = null,
    isCstRewardLoading = false,
    cstRewardReadFailed = false,
    acceptAnyCstReward = false,
  } = form;

  // The message recedes in the page form and opens in the sheet. A draft
  // that arrives from the other surface opens it once, when it arrives; the
  // toggle still closes it afterwards (the draft stays).
  const [messageOpen, setMessageOpen] = useState(isSheet || message !== '');
  const [handledFocusRequest, setHandledFocusRequest] = useState(messageFocusRequest);
  if (messageFocusRequest !== handledFocusRequest) {
    setHandledFocusRequest(messageFocusRequest);
    if (messageFocusRequest > 0) setMessageOpen(true);
  }
  const [seenMessage, setSeenMessage] = useState(message);
  if (message !== seenMessage) {
    setSeenMessage(message);
    if (seenMessage === '' && message !== '') setMessageOpen(true);
  }
  const messageBytes = gestureMessageBytes(message);
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
  // Until the live quote arrives, the server-read dashboard already names the
  // ETH Gesture Cost: the methods show it as approximate instead of waiting.
  const seededEthPrice = hasEthQuote ? null : toFiniteNumber(data?.CurBidPriceEth);
  const methodEthPrice = hasEthQuote
    ? ethPrice
    : seededEthPrice != null && seededEthPrice >= 0
      ? seededEthPrice
      : null;
  const hasCstQuote = cstGestureData.source !== 'empty';
  const cstParts = hasCstQuote
    ? formatAmountParts(cstGestureData.isFree ? 0 : cstGestureData.CSTPrice, {
        unit: 'CST',
        locale,
      })
    : null;
  // Both ETH methods at one precision, so their prices line up (0.10211 beside 0.05105).
  const costs: Record<GestureMethodValue, MethodCost | null> = {
    ETH:
      methodEthPrice != null
        ? {
            value: formatEthMethodQuote(methodEthPrice, 'ETH', locale),
            unit: 'ETH',
            approximate: !hasEthQuote,
          }
        : null,
    RandomWalk:
      methodEthPrice != null
        ? {
            value: formatEthMethodQuote(methodEthPrice, 'RandomWalk', locale),
            unit: 'ETH',
            approximate: !hasEthQuote,
          }
        : null,
    CST: cstParts ? { value: cstParts.number, unit: 'CST' } : null,
  };

  const ethMethod = gestureType === 'ETH' || gestureType === 'RandomWalk';
  const currentCstCost = cstGestureData.isFree ? 0 : cstGestureData.CSTPrice;
  const hasCstReward = gestureCstRewardAmount != null && Number.isFinite(gestureCstRewardAmount);
  const hasCstCost = hasCstQuote && Number.isFinite(currentCstCost) && currentCstCost >= 0;
  const netCst = hasCstReward && hasCstCost ? gestureCstRewardAmount - currentCstCost : null;

  // A Random Walk Gesture needs one of this wallet's unused NFTs, confirmed
  // by the list read for this wallet: a deep-linked, stale or used token
  // never enables the submit.
  const needsRwlkToken =
    gestureType === 'RandomWalk' && !isUsableRandomWalkToken(rwlkId, rwlkListStatus, rwlknftIds);
  // Only a method this phase offers can be submitted (only ETH before the first Gesture).
  const methodOffered = methods.some((method) => method.value === gestureType);
  const hasSelectedQuote = gestureType === 'CST' ? hasCstQuote : hasEthQuote;
  const submitUnavailable = needsRwlkToken || !methodOffered || !hasSelectedQuote;
  const busyLabel = isGesturing ? stageLabel(txStage) : null;

  const priceWei = ethGestureInfo?.ETHPriceWei;
  const requiredWei =
    account && ethMethod && priceWei != null
      ? ethSendWei(priceWei, gestureType, gestureCostPlus)
      : null;

  // The running total earns its line once the wallet has spent something
  // this cycle; before that the not-refunded note stands alone.
  const showSpend =
    cycleSpend != null &&
    !(cycleSpend.status === 'ready' && cycleSpend.eth <= 0 && cycleSpend.cst <= 0);

  const pendingValue = <ValuePending ch={9} />;
  // A preview that could not be read says so (it retries on its own poll),
  // rather than pulsing as if it were still on its way.
  const missingValue = cstRewardReadFailed ? (
    <UnknownValue label={tCommon('status.unavailable')} />
  ) : (
    pendingValue
  );
  // Live CST figures keep two decimals, so a ticking value never switches
  // between "141" and "141.01" and the column's decimals line up.
  const cstAmount = (value: number | null) =>
    value == null ? missingValue : <Amount value={value} unit="CST" context="table" />;
  // Until the contract's live preview arrives, the dashboard's own reading
  // (already in the server HTML) stands in, marked approximate like the
  // method prices, so the first paint shows a figure rather than a skeleton.
  const seededCstReward = toFiniteNumber(data?.ParticipationCstReward);
  const cstRewardValue = (live: number | null) =>
    live == null && !cstRewardReadFailed && seededCstReward != null ? (
      <span data-approximate className="whitespace-nowrap">
        {'≈ '}
        <Amount value={seededCstReward} unit="CST" context="table" />
      </span>
    ) : (
      cstAmount(live)
    );

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

      {/* The method's explanation above already says what the NFT does;
          the picker says only where the wallet's NFTs stand. */}
      {gestureType === 'RandomWalk' && (
        <div data-testid="panel-rwlk-picker" className="min-w-0">
          <h3 id={`rwlk-picker-title-${variant}`} className="type-label text-foreground">
            {t('form.rwlk.title')}
          </h3>
          {!account || rwlkListStatus === 'no-wallet' ? (
            <p data-testid="panel-rwlk-connect" className="type-caption mt-1 text-subtle">
              {t('form.rwlk.connect')}
            </p>
          ) : rwlkListStatus === 'error' ? (
            <p
              data-testid="panel-rwlk-error"
              role="status"
              className="type-caption mt-1 text-subtle"
            >
              {t('form.rwlk.error')}
            </p>
          ) : (
            <>
              {rwlkRejectedId != null && rwlkListStatus === 'ready' && (
                <p
                  data-testid="panel-rwlk-rejected"
                  role="status"
                  className="type-caption mt-1 text-muted-foreground"
                >
                  {t('form.rwlk.linkedUnavailable', { tokenId: String(rwlkRejectedId) })}
                </p>
              )}
              <PaginationRWLKGrid
                compact={!isSheet}
                loading={rwlkListStatus === 'loading'}
                data={rwlknftIds}
                selectedToken={rwlkId}
                setSelectedToken={setRwlkId}
                labelledBy={`rwlk-picker-title-${variant}`}
              />
            </>
          )}
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
                value={cstRewardValue(isCstRewardLoading ? null : gestureCstRewardAmount)}
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
                    missingValue
                  ) : (
                    <Amount value={netCst} unit="CST" context="table" signDisplay="exceptZero" />
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
              value={cstRewardValue(isCstRewardLoading ? null : gestureCstRewardAmount)}
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
            {/* The hint moves to its own line whole rather than breaking
                inside, and breaks only where a whole line is too narrow. A
                wrapping row, not a no-wrap span: WebKit keeps a no-wrap
                inline on the line it overflows. */}
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-1">
              <span>{t('form.message.add')}</span>{' '}
              <span className="type-caption font-normal text-subtle">
                {t('form.advanced.messageOptionalHint', { maxLength: String(messageMaxBytes) })}
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
                      maxLength: String(messageMaxBytes),
                    })}
                  </span>
                </>
              )}
            </label>
            {/* Bytes, as the contract counts them (a CJK character takes three),
                against the cap the hint names. */}
            <span
              id={`${messageId}-count`}
              data-testid="gesture-message-char-count"
              className={cn(
                'type-caption shrink-0 tabular-nums',
                messageBytes >= messageMaxBytes - MESSAGE_COUNTER_WARN_BYTES
                  ? 'text-attention'
                  : 'text-subtle',
              )}
            >
              {messageBytes}/{messageMaxBytes}
            </span>
          </div>
          <MessageTextarea
            id={messageId}
            ref={setTextareaRef}
            data-testid="gesture-message-input"
            aria-describedby={`${messageId}-count ${messageId}-note`}
            placeholder={t('form.advanced.messagePlaceholder')}
            value={message}
            // UTF-8 never takes fewer bytes than UTF-16 units, so this native
            // cap never cuts early; the byte cap itself applies on change.
            maxLength={messageMaxBytes}
            rows={3}
            onChange={(event) => setMessage(fitGestureMessage(event.target.value, messageMaxBytes))}
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
      {/* The sheet's action row stays pinned, so its note sets small. */}
      <p
        data-testid="participation-cost-note"
        className={cn(isSheet ? 'type-caption' : 'type-body-sm', 'text-muted-foreground')}
      >
        {t('orientation.costsNote')}
      </p>
      {showSpend && cycleSpend && (
        <p data-testid="personal-spent" className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="type-label text-subtle">{t('observatory.standing.spent')}</span>{' '}
          <span className="type-figure-sm text-foreground">
            {cycleSpend.status === 'loading' ? (
              <ValuePending ch={16} />
            ) : cycleSpend.status === 'unknown' ? (
              <UnknownValue label={t('observatory.standing.checkFailed')} />
            ) : (
              <>
                {cycleSpend.eth > 0 ? (
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
                className={COMMIT_WRAP}
              >
                {busyLabel ?? (
                  // One line with a dot where the button is wide enough; in a
                  // phone column the verb and the price stack, so no line
                  // ever starts on the separator.
                  <span className="flex min-w-0 flex-col items-center leading-tight @[24rem]/commit:flex-row @[24rem]/commit:items-baseline @[24rem]/commit:gap-x-2">
                    <span>{submit.action}</span>{' '}
                    {submit.cost && (
                      <>
                        <span aria-hidden className="hidden font-normal @[24rem]/commit:inline">
                          ·
                        </span>{' '}
                        <span className="text-sm font-medium tabular-nums @[24rem]/commit:text-base @[24rem]/commit:font-semibold">
                          {submit.cost}
                        </span>
                      </>
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
            // One line at every width: the short label on phones, where the
            // line under the button carries the purpose.
            label={
              <>
                <span className="sm:hidden">{t('form.connect.ctaShort')}</span>
                <span className="max-sm:hidden">{t('form.connect.cta')}</span>
              </>
            }
            className="w-full whitespace-nowrap"
          />
          <p className="type-caption mx-auto max-w-[40em] text-balance text-center text-subtle">
            {t('orientation.connectHelp')}
          </p>
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
      <div className="min-w-0 space-y-3.5">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id={`gesture-panel-title-${variant}`} className="type-heading-3 text-foreground">
            {t('form.title')}
          </h2>
          {!loading && gestureType === 'CST' && <UniswapTradeButton variant="compact" />}
        </header>
        {decision}
        {action}
      </div>
    </section>
  );
}
