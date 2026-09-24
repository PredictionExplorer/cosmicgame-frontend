'use client';

import { useId, useMemo, type ReactNode, type RefObject } from 'react';
import { parseEther, zeroAddress } from 'viem';
import { ChevronDown, Settings2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import PaginationRWLKGrid from '@/components/nft/PaginationRWLKGrid';
import { Button } from '@/components/ui/button';
import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Label } from '@/components/ui/label';
import { MessageTextarea } from '@/components/ui/message-textarea';
import { Skeleton, skeletonVariants } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { FundingNotice } from '@/components/wallet/FundingNotice';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import type { useGestureForm } from '@/hooks/useGestureForm';
import { useTxStageLabel } from '@/hooks/useTxStageLabel';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import type { CstGestureData } from '@/utils/cstGesture';
import { formatAmount, formatAmountParts, NBSP } from '@/utils/format';
import { ethGestureBaseCost, ethGestureSendAmount, formatEthQuote } from '@/utils/gestureQuote';

import { CalibrationWindow } from './CalibrationWindow';
import { GestureAdvancedFields } from './GestureAdvancedFields';
import { MethodSelector, type GestureMethod, type MethodOption } from './MethodSelector';

const MESSAGE_MAX_LENGTH = protocolFacts.gestureMessageMaxLength;
const MESSAGE_COUNTER_WARN_AT = MESSAGE_MAX_LENGTH - 20;

type GestureFormState = ReturnType<typeof useGestureForm>;

/** The slice of the shared gesture-form state the console reads and writes. */
export type ConsoleFormState = Pick<
  GestureFormState,
  | 'gestureType'
  | 'contributionType'
  | 'setContributionType'
  | 'message'
  | 'setMessage'
  | 'nftDonateAddress'
  | 'setNftDonateAddress'
  | 'nftId'
  | 'setNftId'
  | 'tokenDonateAddress'
  | 'setTokenDonateAddress'
  | 'tokenAmount'
  | 'setTokenAmount'
  | 'rwlkId'
  | 'setRwlkId'
  | 'gestureCostPlus'
  | 'setBidPricePlus'
  | 'advancedExpanded'
  | 'setAdvancedExpanded'
  | 'rwlknftIds'
  | 'ethGestureInfo'
  | 'gestureCstRewardAmount'
  | 'gestureCstRewardAmountMin'
  | 'isCstRewardLoading'
  | 'cstRewardTolerancePercent'
  | 'setCstRewardTolerancePercent'
  | 'acceptAnyCstReward'
  | 'setAcceptAnyCstReward'
  | 'isGesturing'
  | 'gestureTxStage'
>;

/** Finalization, once the clock has reached zero. */
export interface ConsoleFinalize {
  /** The chain confirmed the deadline passed and a Gesture exists. */
  canClaim: boolean;
  isClaiming: boolean;
  /** The connected wallet made the Final Gesture (its exclusive window). */
  isLatestParticipant: boolean;
  /** When anyone else may finalize, in epoch ms. */
  openToAllAtMs: number;
  nowMs: number;
  onFinalize: () => void;
}

interface GestureConsoleProps {
  /**
   * `page`: the console in the monument column; it owns `#make-gesture` and
   * `#gesture-submit`. `sheet`: the same console in the phone bottom sheet.
   */
  variant: 'page' | 'sheet';
  data: DashboardInfo | null;
  loading: boolean;
  account: string | null;
  form: ConsoleFormState;
  /** CST quote and Calibration Window timing, derived live. */
  cstGestureData: CstGestureData;
  /** The shared, live-priced label of every gesture submit. */
  submitLabel: string;
  canGesture: boolean;
  /** The clock reached zero: the Final Gesture participant is told to finalize. */
  cycleTimerEnded: boolean;
  onGesture: () => void;
  onSelectGestureType: (value: string) => void;
  finalize?: ConsoleFinalize;
  messageInputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

/** A label-and-value line of the reward preview. */
function SpecRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="min-w-0 type-label text-muted-foreground">{label}</dt>
      <dd className="shrink-0 text-end type-figure-sm text-foreground">{children}</dd>
    </div>
  );
}

function ConsoleSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      data-testid="gesture-form-skeleton"
      className="mt-5 space-y-5"
    >
      <Skeleton className="h-16 rounded-control" />
      <Skeleton className="h-10 rounded-control" />
      <Skeleton className="h-24 rounded-control" />
      <Skeleton className="h-14 rounded-control" />
    </div>
  );
}

/**
 * The one gesture form of the page: method with live prices, the running
 * Calibration Window, the optional message, the Participation CST preview,
 * the Advanced options and the commit action with its transaction status.
 * The page renders it in the monument column; phones open the same console,
 * with the same shared state, in a bottom sheet.
 *
 * Without a wallet it is a preview of the live options with one connect
 * block where the action goes; the message can still be drafted, and the
 * draft follows the participant once they connect.
 */
export function GestureConsole({
  variant,
  data,
  loading,
  account,
  form,
  cstGestureData,
  submitLabel,
  canGesture,
  cycleTimerEnded,
  onGesture,
  onSelectGestureType,
  finalize,
  messageInputRef,
  className,
}: GestureConsoleProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const stageLabel = useTxStageLabel();
  const baseId = useId();
  const ids = {
    title: `${baseId}-title`,
    method: `${baseId}-method`,
    message: `${baseId}-message`,
    rwlk: `${baseId}-rwlk`,
  };

  const {
    gestureType,
    message,
    setMessage,
    rwlkId,
    setRwlkId,
    rwlknftIds,
    gestureCostPlus,
    ethGestureInfo,
    gestureCstRewardAmount,
    gestureCstRewardAmountMin,
    isCstRewardLoading,
    acceptAnyCstReward,
    advancedExpanded,
    setAdvancedExpanded,
    isGesturing,
    gestureTxStage,
  } = form;

  const isPage = variant === 'page';
  const showAll = data?.LastBidderAddr !== zeroAddress;
  const ethPrice = ethGestureInfo?.ETHPrice;
  const hasEthQuote = ethPrice != null && Number.isFinite(ethPrice) && ethPrice >= 0;
  const hasCstQuote = cstGestureData.source !== 'empty';
  // An inline placeholder: prices sit inside buttons and definition rows.
  const pending = (
    <span
      aria-hidden
      className={cn(skeletonVariants(), 'inline-block h-3.5 w-16 rounded-edge align-middle')}
    />
  );

  const ethPriceLabel = (method: 'ETH' | 'RandomWalk') =>
    hasEthQuote
      ? `${formatEthQuote(ethGestureBaseCost(ethPrice, method), locale)}${NBSP}ETH`
      : pending;
  const cstPriceLabel = !hasCstQuote
    ? pending
    : cstGestureData.isFree
      ? t('deck.console.free')
      : formatAmount(cstGestureData.CSTPrice, { unit: 'CST', locale });

  const allOptions: MethodOption[] = [
    { value: 'ETH', label: t('form.method.eth.label'), price: ethPriceLabel('ETH') },
    {
      value: 'RandomWalk',
      label: t('form.method.randomWalk.label'),
      price: ethPriceLabel('RandomWalk'),
      note: t('form.method.randomWalk.desc'),
    },
    { value: 'CST', label: t('form.method.cst.label'), price: cstPriceLabel },
  ];
  const options = showAll ? allOptions : allOptions.filter((option) => option.value === 'ETH');

  // The ETH the wallet must hold before gas: the cost plus the collision buffer.
  const requiredWei = useMemo(() => {
    if (!hasEthQuote || (gestureType !== 'ETH' && gestureType !== 'RandomWalk')) return null;
    const decimal = formatAmountParts(
      ethGestureSendAmount(ethPrice, gestureType, gestureCostPlus),
      { unit: 'ETH' },
    ).machineValue;
    try {
      return decimal ? parseEther(decimal) : null;
    } catch {
      return null;
    }
  }, [hasEthQuote, ethPrice, gestureType, gestureCostPlus]);

  const sendsNote =
    (gestureType === 'ETH' || gestureType === 'RandomWalk') && gestureCostPlus > 0 && hasEthQuote
      ? t('form.submit.sendsNote', {
          amount: formatEthQuote(
            ethGestureSendAmount(ethPrice, gestureType, gestureCostPlus),
            locale,
          ),
          percent: gestureCostPlus,
        })
      : null;

  const needsRwlkToken = gestureType === 'RandomWalk' && rwlkId === -1;
  const hasSelectedQuote = gestureType === 'CST' ? hasCstQuote : hasEthQuote;
  const submitUnavailable = needsRwlkToken || gestureType === '' || !hasSelectedQuote;
  const busyLabel = isGesturing ? stageLabel(gestureTxStage) : null;

  const cstAmount = (value: number | null | undefined) =>
    isCstRewardLoading ? pending : formatAmount(value, { unit: 'CST', locale });
  const currentCstCost = cstGestureData.isFree ? 0 : cstGestureData.CSTPrice;
  const netCst =
    gestureCstRewardAmount != null && Number.isFinite(gestureCstRewardAmount) && hasCstQuote
      ? gestureCstRewardAmount - currentCstCost
      : null;

  const messageCount = (
    <span
      id={`${ids.message}-count`}
      data-testid="gesture-message-char-count"
      className={cn(
        'shrink-0 type-caption tabular-nums',
        message.length >= MESSAGE_COUNTER_WARN_AT ? 'text-attention' : 'text-subtle',
      )}
    >
      {message.length}/{MESSAGE_MAX_LENGTH}
    </span>
  );

  const finalizeWaitMs =
    finalize && !finalize.isLatestParticipant
      ? Math.max(0, finalize.openToAllAtMs - finalize.nowMs)
      : 0;

  return (
    <section
      id={isPage ? 'make-gesture' : undefined}
      tabIndex={-1}
      aria-labelledby={ids.title}
      data-testid="gesture-console"
      data-variant={variant}
      className={cn('min-w-0 scroll-mt-28 focus:outline-none', className)}
    >
      <h2 id={ids.title} className="type-heading-3 text-foreground">
        {t('deck.console.title')}
      </h2>

      {loading ? (
        <ConsoleSkeleton label={t('form.loadingAria')} />
      ) : (
        <div className="mt-5 space-y-6">
          <div className="space-y-4">
            <p id={ids.method} className="type-label text-muted-foreground">
              {t('deck.console.methodLabel')}
            </p>
            <MethodSelector
              options={options}
              value={gestureType}
              labelledBy={ids.method}
              onChange={(value: GestureMethod) => onSelectGestureType(value)}
            />
            <CalibrationWindow
              data={data}
              ethGestureInfo={ethGestureInfo}
              cstGestureData={cstGestureData}
            />
          </div>

          {gestureType === 'RandomWalk' && account ? (
            <div data-testid="rwlk-picker">
              <h3 id={ids.rwlk} className="type-label text-foreground">
                <ExplainedTerm definition={t('form.rwlk.tooltip')}>
                  {t('form.rwlk.title')}
                </ExplainedTerm>
              </h3>
              <PaginationRWLKGrid
                compact
                loading={false}
                data={rwlknftIds}
                selectedToken={rwlkId}
                setSelectedToken={setRwlkId}
                labelledBy={ids.rwlk}
              />
            </div>
          ) : null}

          {gestureType === 'CST' ? (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="min-w-0 max-w-sm type-body-sm text-muted-foreground">
                {t('form.cstTrade')}
              </p>
              <UniswapTradeButton variant="compact" />
            </div>
          ) : null}

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <Label htmlFor={ids.message} className="type-label text-muted-foreground">
                {t('form.advanced.messageLabel')}{' '}
                <span className="type-caption text-subtle">
                  {t('form.advanced.messageOptionalHint', {
                    maxLength: String(MESSAGE_MAX_LENGTH),
                  })}
                </span>
              </Label>
              {messageCount}
            </div>
            <MessageTextarea
              id={ids.message}
              ref={messageInputRef}
              data-testid="gesture-message-input"
              aria-describedby={`${ids.message}-hint ${ids.message}-count`}
              placeholder={t('form.advanced.messagePlaceholder')}
              value={message}
              maxLength={MESSAGE_MAX_LENGTH}
              rows={3}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p id={`${ids.message}-hint`} className="mt-1.5 type-caption text-subtle">
              {t('deck.console.messageHint')}
            </p>
          </div>

          {showAll ? (
            <div data-testid="gesture-reward-preview">
              <dl className="divide-y divide-rule-faint border-y border-rule-faint">
                {gestureType === 'CST' ? (
                  <>
                    <SpecRow
                      label={
                        <ExplainedTerm definition={t('form.reward.economicsDescription')}>
                          {t('form.reward.rewardLabel')}
                        </ExplainedTerm>
                      }
                    >
                      {cstAmount(gestureCstRewardAmount)}
                    </SpecRow>
                    <SpecRow label={t('form.reward.costLabel')}>
                      {hasCstQuote
                        ? formatAmount(currentCstCost, { unit: 'CST', locale })
                        : pending}
                    </SpecRow>
                    <SpecRow label={t('form.reward.netLabel')}>
                      {isCstRewardLoading || netCst == null ? (
                        pending
                      ) : (
                        <span className={netCst > 0 ? 'text-positive' : undefined}>
                          {formatAmount(netCst, { unit: 'CST', locale, signDisplay: 'exceptZero' })}
                        </span>
                      )}
                    </SpecRow>
                  </>
                ) : (
                  <SpecRow
                    label={
                      <ExplainedTerm definition={t('form.reward.previewDescription')}>
                        {t('deck.console.reward')}
                      </ExplainedTerm>
                    }
                  >
                    {cstAmount(gestureCstRewardAmount)}
                  </SpecRow>
                )}
                <SpecRow
                  label={
                    <ExplainedTerm
                      definition={
                        acceptAnyCstReward
                          ? t('form.reward.minAcceptedTooltipAny')
                          : t('form.reward.minAcceptedTooltip')
                      }
                    >
                      {t('deck.console.minAccepted')}
                    </ExplainedTerm>
                  }
                >
                  {acceptAnyCstReward
                    ? t('form.reward.minAcceptedAny')
                    : cstAmount(gestureCstRewardAmountMin)}
                </SpecRow>
              </dl>
              {gestureType === 'CST' && netCst != null && !isCstRewardLoading ? (
                <p className="mt-2 type-caption text-subtle">
                  {netCst > 0 ? t('form.reward.netPositive') : t('form.reward.netNegative')}
                </p>
              ) : null}
            </div>
          ) : null}

          {account ? (
            <details
              open={advancedExpanded}
              onToggle={(event) => setAdvancedExpanded(event.currentTarget.open)}
              className="group/advanced"
              data-testid="gesture-advanced"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-control type-label text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <Settings2 className="size-4" aria-hidden />
                  {t('form.advanced.title')}
                </span>
                <ChevronDown
                  className="size-4 transition-transform duration-[var(--duration-base)] group-open/advanced:rotate-180 motion-reduce:transition-none"
                  aria-hidden
                />
              </summary>
              <GestureAdvancedFields
                gestureType={gestureType}
                contributionType={form.contributionType}
                setContributionType={form.setContributionType}
                nftDonateAddress={form.nftDonateAddress}
                setNftDonateAddress={form.setNftDonateAddress}
                nftId={form.nftId}
                setNftId={form.setNftId}
                tokenDonateAddress={form.tokenDonateAddress}
                setTokenDonateAddress={form.setTokenDonateAddress}
                tokenAmount={form.tokenAmount}
                setTokenAmount={form.setTokenAmount}
                setRwlkId={setRwlkId}
                gestureCostPlus={gestureCostPlus}
                setBidPricePlus={form.setBidPricePlus}
                ethGestureInfo={ethGestureInfo}
                gestureCstRewardAmountMin={gestureCstRewardAmountMin}
                cstRewardTolerancePercent={form.cstRewardTolerancePercent}
                setCstRewardTolerancePercent={form.setCstRewardTolerancePercent}
                acceptAnyCstReward={acceptAnyCstReward}
                setAcceptAnyCstReward={form.setAcceptAnyCstReward}
                showAll={showAll}
                className="pb-2 pt-3"
              />
            </details>
          ) : null}

          <div className="space-y-3" data-testid="gesture-commit">
            <p className="type-body-sm text-muted-foreground">{t('orientation.costsNote')}</p>

            {account ? (
              <>
                {canGesture ? (
                  <>
                    <FundingNotice requiredWei={requiredWei} />
                    <ChainGuard buttonClassName="w-full">
                      <Button
                        id={isPage ? 'gesture-submit' : undefined}
                        data-testid="gesture-submit"
                        variant="commit"
                        size="xl"
                        className="h-auto w-full whitespace-normal py-3 leading-tight"
                        loading={isGesturing}
                        disabled={submitUnavailable}
                        onClick={onGesture}
                      >
                        {busyLabel ?? submitLabel}
                      </Button>
                    </ChainGuard>
                    {sendsNote ? (
                      <p className="type-caption text-subtle" data-testid="gesture-send-amount">
                        {sendsNote}
                      </p>
                    ) : null}
                  </>
                ) : !cycleTimerEnded ? (
                  <p className="type-body-sm text-muted-foreground">{t('form.finalGestureMade')}</p>
                ) : null}
                <TxStatus stage={gestureTxStage} />

                {finalize?.canClaim ? (
                  <div
                    className="space-y-2 border-t border-rule-faint pt-4"
                    data-testid="finalize-action"
                  >
                    <Button
                      variant={canGesture ? 'outline' : 'commit'}
                      size={canGesture ? 'lg' : 'xl'}
                      className="w-full"
                      loading={finalize.isClaiming}
                      disabled={finalizeWaitMs > 0}
                      onClick={finalize.onFinalize}
                      data-testid="finalize-submit"
                    >
                      {t('form.finalize')}
                    </Button>
                    {finalizeWaitMs > 0 ? (
                      <p className="type-caption text-subtle">
                        {t('form.finalizeAvailableIn')}{' '}
                        <Duration
                          seconds={finalizeWaitMs / 1000}
                          variant="clock"
                          className="type-figure-sm text-muted-foreground"
                        />
                        {' · '}
                        {t('form.finalizeWaitNote')}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div data-testid="connect-to-gesture" className="space-y-3">
                <p className="type-body-sm text-foreground">{t('orientation.connectHelp')}</p>
                <ConnectWalletAction size="xl" className="w-full" warmOnVisible />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
