import { zeroAddress } from 'viem';
import { Settings2, Info } from 'lucide-react';

import { formatSeconds } from '@/utils';

import { formatCstAmount } from '@/utils/cstGesture';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomTextField } from '@/components/styled';
import PaginationRWLKGrid from '@/components/nft/PaginationRWLKGrid';
import type { DashboardInfo } from '@/services/api/types';
import type { CSTGestureData, EthGestureInfo } from '@/hooks/useGestureForm';
import { AuctionInfo } from '@/components/home/AuctionInfo';

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
  cstRewardTolerancePercent?: number;
  setCstRewardTolerancePercent?: (value: number) => void;
  acceptAnyCstReward?: boolean;
  setAcceptAnyCstReward?: (value: boolean) => void;
  previewMode?: boolean;
}

const gestureOptions = [
  { value: 'ETH', label: 'ETH', desc: 'Pay with Ether' },
  { value: 'RandomWalk', label: 'ETH + RWLK', desc: '50% discount' },
  { value: 'CST', label: 'CST', desc: 'ERC-20' },
];

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
  cstRewardTolerancePercent = 1,
  setCstRewardTolerancePercent,
  acceptAnyCstReward = false,
  setAcceptAnyCstReward,
  previewMode = false,
}: GestureFormProps) {
  const showAll = data?.LastBidderAddr !== zeroAddress;
  const visibleOptions = showAll ? gestureOptions : gestureOptions.filter((o) => o.value === 'ETH');

  return (
    <div className="mt-8 space-y-5">
      <div>
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
          Gesture Method
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
                'flex-1 rounded-lg border px-3 py-2.5 text-center transition-all',
                gestureType === opt.value
                  ? 'border-primary/50 bg-primary/10 text-white'
                  : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white',
              )}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              <span className="block text-[10px] mt-0.5 opacity-60">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {gestureType === 'ETH' && data?.LastBidderAddr === zeroAddress && (
        <AuctionInfo
          secondsElapsed={ethGestureInfo?.SecondsElapsed ?? 0}
          auctionDuration={ethGestureInfo?.AuctionDuration ?? 0}
        />
      )}

      {gestureType === 'RandomWalk' && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <h6 className="text-sm font-semibold">Your Random Walk NFTs</h6>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="About RandomWalk gesture discounts"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[240px]">
                  Attach a RandomWalk NFT to an ETH gesture to receive a 50% Gesture Cost reduction.
                  Each NFT can only be used once.
                </p>
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
            endedMessage="Calibration Window ended — you can gesture for free."
          />
        </div>
      )}

      {showAll && (
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                CST Reward Preview
              </p>
              <p className="mt-1 text-muted-foreground">
                Estimated CST you receive if this gesture lands. Every gesture method has two
                protections: maximum cost and minimum CST reward.
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <p className="text-base font-semibold text-emerald-300">
                {isCstRewardLoading
                  ? 'Loading...'
                  : `${formatCstAmount(gestureCstRewardAmount)} CST`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Min accepted:{' '}
                {acceptAnyCstReward
                  ? 'any reward, including 0 CST'
                  : `${formatCstAmount(gestureCstRewardAmountMin)} CST`}
              </p>
            </div>
          </div>
          {gestureType === 'CST' &&
            cstGestureData.source === 'contract' &&
            cstGestureData.apiAuctionDuration != null &&
            cstGestureData.apiAuctionDuration !== cstGestureData.AuctionDuration && (
              <p className="mt-3 text-xs text-amber-200/90">
                Using on-chain duration ({formatSeconds(cstGestureData.AuctionDuration)}) because
                the API reported {formatSeconds(cstGestureData.apiAuctionDuration)}.
              </p>
            )}
        </div>
      )}

      {previewMode && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4 text-sm leading-relaxed text-muted-foreground">
          Preview the live gesture options here. Connect a wallet to write your message, attach
          assets, and submit the gesture on Arbitrum.
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
              Advanced
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 max-w-xl">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Message{' '}
                    <span className="normal-case tracking-normal opacity-50">
                      (optional, 280 chars)
                    </span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="How gesture messages work"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[260px]">
                        Leave a message to appear in Gesture Chat. Your message is recorded on-chain
                        with your gesture and remains on the blockchain permanently.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <textarea
                  placeholder="Leave a message with your gesture..."
                  value={message}
                  maxLength={280}
                  rows={3}
                  disabled={previewMode}
                  className="w-full flex min-h-[72px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Attach tokens or NFTs to your gesture, or adjust gesture-cost collision prevention.
              </p>
              {showAll && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Minimum CST Reward Protection
                  </p>
                  <label className="flex items-start gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
                    <Checkbox
                      checked={acceptAnyCstReward}
                      disabled={previewMode || !setAcceptAnyCstReward}
                      onChange={(e) => setAcceptAnyCstReward?.(e.currentTarget.checked)}
                      aria-label="Accept any CST reward"
                    />
                    <span>
                      <span className="block font-medium text-foreground">
                        Accept any CST reward, including 0
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        Sends a minimum accepted CST reward of 0. Use this when you prefer the
                        gesture to land even if the reward changes before confirmation.
                      </span>
                    </span>
                  </label>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Allow reward to move down by
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
                            acceptAnyCstReward || previewMode || !setCstRewardTolerancePercent
                          }
                          onChange={(e) => setCstRewardTolerancePercent?.(Number(e.target.value))}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs">
                          %
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground tabular-nums min-w-0">
                      min {formatCstAmount(gestureCstRewardAmountMin)} CST
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This becomes the V2 `bidCstRewardAmountMinLimit_` value. If the contract would
                    mint less CST than this minimum by the time your transaction lands, the gesture
                    should revert instead of accepting a worse reward.
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
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <RadioGroupItem value="NFT" />
                  <span className="text-sm">Attach NFT</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <RadioGroupItem value="Token" />
                  <span className="text-sm">Attach Token</span>
                </label>
              </RadioGroup>
              {contributionType === 'Token' && (
                <div className="space-y-3">
                  <div className="min-w-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Contract Address
                    </Label>
                    <Input
                      placeholder="0x..."
                      value={tokenDonateAddress}
                      onChange={(e) => setTokenDonateAddress(e.target.value)}
                      disabled={previewMode}
                      className="w-full max-w-md font-mono text-sm"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                  <div className="w-full max-w-[11rem]">
                    <Label className="text-xs text-muted-foreground mb-1 block">Amount</Label>
                    <Input
                      placeholder="0.0"
                      type="number"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      disabled={previewMode}
                      className="font-mono text-sm tabular-nums"
                    />
                  </div>
                </div>
              )}
              {contributionType === 'NFT' && (
                <div className="space-y-3">
                  <div className="min-w-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      NFT Contract Address
                    </Label>
                    <Input
                      placeholder="0x..."
                      value={nftDonateAddress}
                      onChange={(e) => setNftDonateAddress(e.target.value)}
                      disabled={previewMode}
                      className="w-full max-w-md font-mono text-sm"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                  <div className="w-full max-w-[7.5rem]">
                    <Label className="text-xs text-muted-foreground mb-1 block">Token ID</Label>
                    <Input
                      placeholder="Token ID"
                      type="number"
                      min={0}
                      value={nftId}
                      onChange={(e) => setNftId(e.target.value)}
                      disabled={previewMode}
                      className="font-mono text-sm tabular-nums"
                    />
                  </div>
                </div>
              )}
              {gestureType !== 'CST' && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Collision Prevention
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Raise by
                      </span>
                      <div className="relative w-[4.25rem] shrink-0">
                        <CustomTextField
                          type="number"
                          placeholder="0"
                          value={gestureCostPlus}
                          min={0}
                          max={50}
                          className="h-9 px-2.5 py-2 pr-7 text-sm tabular-nums"
                          disabled={previewMode}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value <= 50) setBidPricePlus(value);
                          }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs">
                          %
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground tabular-nums min-w-0">
                      ≈{' '}
                      {(
                        (ethGestureInfo?.ETHPrice ?? 0) *
                        (1 + gestureCostPlus / 100) *
                        (gestureType === 'RandomWalk' ? 0.5 : 1)
                      ).toFixed(6)}{' '}
                      ETH
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bumps Gesture Cost by {gestureCostPlus}% to avoid collision when two gestures
                    land in the same block. Does not permanently raise the cost.
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
