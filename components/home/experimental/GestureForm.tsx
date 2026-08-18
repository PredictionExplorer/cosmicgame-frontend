import { zeroAddress } from 'viem';
import { Settings2, Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';
import { formatSeconds } from '@/utils';

import { formatCstAmount } from '@/utils/cstGesture';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import PaginationRWLKGrid from '@/components/nft/PaginationRWLKGrid';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import type { DashboardInfo } from '@/services/api/types';
import type { CSTGestureData, EthGestureInfo } from '@/hooks/useGestureForm';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AuctionInfo } from '@/components/home/AuctionInfo';
import { GestureAdvancedFields } from '@/components/home/experimental/GestureAdvancedFields';

/**
 * Tailwind's `xl` breakpoint: the only width at which the deck has a third
 * column for the advanced panel to take over (see HomePage's deck grid).
 */
export const ADVANCED_SIDE_MEDIA_QUERY = '(min-width: 1280px)';

interface GestureFormProps {
  data: DashboardInfo | null;
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
  cstGestureData: CSTGestureData;
  ethGestureInfo: EthGestureInfo | null;
  gestureCstRewardAmount?: number | null;
  gestureCstRewardAmountMin?: number | null;
  isCstRewardLoading?: boolean;
  /**
   * V3: the entire quoted Participation CST is minted to the OUTBID previous
   * participant (the gesturer earns the next gesture's CST when someone outbids
   * them). `false` on V2 contracts — whole reward to the gesturer.
   */
  cstRewardToOutbidBidder?: boolean;
  cstRewardTolerancePercent?: number;
  setCstRewardTolerancePercent?: (value: number) => void;
  acceptAnyCstReward?: boolean;
  setAcceptAnyCstReward?: (value: boolean) => void;
  previewMode?: boolean;
  /**
   * Where the Advanced options open. `inline` (default) expands the accordion
   * under the form. `side`: at `xl` and up the accordion is only the toggle
   * and the parent renders the body in the monument's side panel
   * (GestureAdvancedPanel); below `xl` it behaves as `inline`.
   */
  advancedPlacement?: 'inline' | 'side';
}

const gestureOptions = [
  { value: 'ETH', messageKey: 'eth' },
  { value: 'RandomWalk', messageKey: 'randomWalk' },
  { value: 'CST', messageKey: 'cst' },
] as const;

function formatCompactCstDelta(value: number): string {
  return formatCstAmount(value)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
}

/** Form for making ETH or CST gestures with optional NFT/token attachment fields and RandomWalk discount. */
export function GestureForm({
  data,
  gestureType,
  setBidType,
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
  cstGestureData,
  ethGestureInfo,
  gestureCstRewardAmount = null,
  gestureCstRewardAmountMin = null,
  isCstRewardLoading = false,
  cstRewardToOutbidBidder = false,
  cstRewardTolerancePercent = 1,
  setCstRewardTolerancePercent,
  acceptAnyCstReward = false,
  setAcceptAnyCstReward,
  previewMode = false,
  advancedPlacement = 'inline',
}: GestureFormProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isSideViewport = useMediaQuery(ADVANCED_SIDE_MEDIA_QUERY);
  // In side mode the Advanced body is rendered by the parent (the monument's
  // side panel); the accordion here is only the toggle.
  const sideMode = advancedPlacement === 'side' && isSideViewport;
  const showAll = data?.LastBidderAddr !== zeroAddress;
  const visibleOptions = showAll ? gestureOptions : gestureOptions.filter((o) => o.value === 'ETH');
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
      : cstRewardToOutbidBidder
        ? t('form.reward.previewDescriptionV3')
        : t('form.reward.previewDescription');
  const minAcceptedCstLabel = acceptAnyCstReward
    ? t('form.reward.minAcceptedAny')
    : t('form.reward.cstAmount', { amount: formatCstAmount(gestureCstRewardAmountMin) });
  const minAcceptedCstTooltip = acceptAnyCstReward
    ? t('form.reward.minAcceptedTooltipAny')
    : t('form.reward.minAcceptedTooltip');

  return (
    <div
      className="mt-5 space-y-4"
      data-testid="gesture-form-root"
      data-advanced-side={sideMode && advancedExpanded ? 'true' : undefined}
    >
      <div>
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
          {t('form.methodLabel')}
        </Label>
        <div className="flex gap-2">
          {visibleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setRwlkId(-1);
                setBidType(opt.value);
              }}
              aria-pressed={gestureType === opt.value}
              className={cn(
                'liquid-glass-control flex-1 rounded-lg border px-3 py-2 text-center transition-all',
                gestureType === opt.value
                  ? 'border-primary/50 bg-primary/10 text-white'
                  : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white',
              )}
            >
              <span className="block text-sm font-medium">
                {t(`form.method.${opt.messageKey}.label`)}
              </span>
              <span className="block text-[10px] mt-0.5 opacity-60">
                {t(`form.method.${opt.messageKey}.desc`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {gestureType === 'ETH' && data?.LastBidderAddr === zeroAddress && (
        <AuctionInfo
          secondsElapsed={ethGestureInfo?.SecondsElapsed ?? 0}
          auctionDuration={ethGestureInfo?.AuctionDuration ?? 0}
          title={t('calibration.firstGestureTitle')}
          subtitle={t('calibration.firstGestureSubtitle')}
        />
      )}

      {gestureType === 'RandomWalk' && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <h6 className="text-sm font-semibold">{t('form.rwlk.title')}</h6>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={t('form.rwlk.tooltipAria')}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[240px]">{t('form.rwlk.tooltip')}</p>
              </TooltipContent>
            </Tooltip>
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/[0.045] p-4">
            <p className="max-w-md text-sm text-muted-foreground">{t('form.cstTrade')}</p>
            <UniswapTradeButton variant="compact" />
          </div>
        </div>
      )}

      {showAll && (
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] p-3 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {rewardPreviewTitle}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {rewardPreviewDescription}
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              {gestureType === 'CST' ? (
                <div className="grid min-w-[13rem] grid-cols-2 gap-2 text-left sm:min-w-[19rem] sm:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t('form.reward.rewardLabel')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      {isCstRewardLoading
                        ? tCommon('status.loadingDots')
                        : t('form.reward.cstAmount', {
                            amount: formatCstAmount(gestureCstRewardAmount),
                          })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t('form.reward.costLabel')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {t('form.reward.cstAmount', {
                        amount: formatCstAmount(currentCstGestureCost),
                      })}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 sm:col-span-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t('form.reward.netLabel')}
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-sm font-semibold',
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
                <p className="text-base font-semibold text-emerald-300">
                  {isCstRewardLoading
                    ? tCommon('status.loadingDots')
                    : t('form.reward.cstAmount', {
                        amount: formatCstAmount(gestureCstRewardAmount),
                      })}
                </p>
              )}
              {cstRewardToOutbidBidder && !isCstRewardLoading && hasCstReward && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('form.reward.goesToOutbid')}
                </p>
              )}
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <span>{t('form.reward.minAccepted', { value: minAcceptedCstLabel })}</span>
                <InfoTooltip
                  content={minAcceptedCstTooltip}
                  ariaLabel={t('form.reward.minAcceptedAria')}
                  maxWidth={320}
                  side="top"
                  className="text-muted-foreground/60"
                />
              </p>
              {gestureType === 'CST' && !isCstRewardLoading && netCstAmount != null && (
                <p
                  className={cn(
                    'mt-1 text-xs',
                    netCstAmount > 0 ? 'text-emerald-300' : 'text-muted-foreground',
                  )}
                >
                  {netCstAmount > 0 ? t('form.reward.netPositive') : t('form.reward.netNegative')}
                </p>
              )}
            </div>
          </div>
          {gestureType === 'CST' &&
            cstGestureData.source === 'contract' &&
            cstGestureData.apiAuctionDuration != null &&
            cstGestureData.apiAuctionDuration !== cstGestureData.AuctionDuration && (
              <p className="mt-3 text-xs text-amber-200/90">
                {t('form.reward.durationMismatch', {
                  contractDuration: formatSeconds(cstGestureData.AuctionDuration, locale),
                  apiDuration: formatSeconds(cstGestureData.apiAuctionDuration, locale),
                })}
              </p>
            )}
        </div>
      )}

      {previewMode && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4 text-sm leading-relaxed text-muted-foreground">
          {t('form.preview')}
        </div>
      )}

      <Accordion
        type="single"
        collapsible
        value={advancedExpanded ? 'advanced' : ''}
        onValueChange={(val) => !previewMode && setAdvancedExpanded(val === 'advanced')}
      >
        <AccordionItem value="advanced" className="border-white/[0.06]">
          <AccordionTrigger
            disabled={previewMode}
            className="text-sm text-muted-foreground hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              {t('form.advanced.title')}
            </span>
          </AccordionTrigger>
          {/* Side mode renders no content element at all: an empty
              AccordionContent still carries bottom padding and would nudge
              the submit button down when the panel opens. */}
          {!sideMode ? (
            <AccordionContent>
              <GestureAdvancedFields
                gestureType={gestureType}
                contributionType={contributionType}
                setContributionType={setContributionType}
                message={message}
                setMessage={setMessage}
                nftDonateAddress={nftDonateAddress}
                setNftDonateAddress={setNftDonateAddress}
                nftId={nftId}
                setNftId={setNftId}
                tokenDonateAddress={tokenDonateAddress}
                setTokenDonateAddress={setTokenDonateAddress}
                tokenAmount={tokenAmount}
                setTokenAmount={setTokenAmount}
                setRwlkId={setRwlkId}
                gestureCostPlus={gestureCostPlus}
                setBidPricePlus={setBidPricePlus}
                ethGestureInfo={ethGestureInfo}
                gestureCstRewardAmountMin={gestureCstRewardAmountMin}
                cstRewardTolerancePercent={cstRewardTolerancePercent}
                setCstRewardTolerancePercent={setCstRewardTolerancePercent}
                acceptAnyCstReward={acceptAnyCstReward}
                setAcceptAnyCstReward={setAcceptAnyCstReward}
                previewMode={previewMode}
                showAll={showAll}
                layout="stack"
              />
            </AccordionContent>
          ) : null}
        </AccordionItem>
      </Accordion>
    </div>
  );
}
