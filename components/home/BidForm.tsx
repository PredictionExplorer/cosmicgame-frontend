import { zeroAddress } from 'viem';
import { Settings2, Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomTextField } from '@/components/styled';
import PaginationRWLKGrid from '@/components/nft/PaginationRWLKGrid';
import type { DashboardInfo } from '@/services/api/types';
import type { CSTBidData, EthBidInfo } from '@/hooks/useBidForm';
import { AuctionInfo } from '@/components/home/AuctionInfo';

interface BidFormProps {
  data: DashboardInfo | null;
  bidType: string;
  setBidType: (value: string) => void;
  donationType: string;
  setDonationType: (value: string) => void;
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
  bidPricePlus: number;
  setBidPricePlus: (value: number) => void;
  advancedExpanded: boolean;
  setAdvancedExpanded: (value: boolean) => void;
  rwlknftIds: number[];
  cstBidData: CSTBidData;
  ethBidInfo: EthBidInfo | null;
}

const bidOptions = [
  { value: 'ETH', label: 'ETH', desc: 'Pay with Ether' },
  { value: 'RandomWalk', label: 'RandomWalk', desc: '50% discount' },
  { value: 'CST', label: 'CST', desc: 'Cosmic Token' },
];

/** Form for placing ETH or CST bids with optional NFT/token donation fields and RandomWalk discount. */
export function BidForm({
  data,
  bidType,
  setBidType,
  donationType,
  setDonationType,
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
  bidPricePlus,
  setBidPricePlus,
  advancedExpanded,
  setAdvancedExpanded,
  rwlknftIds,
  cstBidData,
  ethBidInfo,
}: BidFormProps) {
  const showAll = data?.LastBidderAddr !== zeroAddress;
  const visibleOptions = showAll ? bidOptions : bidOptions.filter((o) => o.value === 'ETH');

  return (
    <div className="mt-8 space-y-5">
      <div>
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
          Bid Method
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
              className={cn(
                'flex-1 rounded-lg border px-3 py-2.5 text-center transition-all',
                bidType === opt.value
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

      {bidType === 'ETH' && data?.LastBidderAddr === zeroAddress && (
        <AuctionInfo
          secondsElapsed={ethBidInfo?.SecondsElapsed ?? 0}
          auctionDuration={ethBidInfo?.AuctionDuration ?? 0}
        />
      )}

      {bidType === 'RandomWalk' && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <h6 className="text-sm font-semibold">Your Random Walk NFTs</h6>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px]">
                    Select a RandomWalk NFT to get a 50% discount on your bid. Each NFT can only be
                    used once.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <PaginationRWLKGrid
            loading={false}
            data={rwlknftIds}
            selectedToken={rwlkId}
            setSelectedToken={setRwlkId}
          />
        </div>
      )}

      {bidType === 'CST' && (
        <AuctionInfo
          secondsElapsed={cstBidData.SecondsElapsed}
          auctionDuration={cstBidData.AuctionDuration}
          endedMessage="Auction ended, you can bid for free."
        />
      )}

      <div>
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
          Message{' '}
          <span className="normal-case tracking-normal opacity-50">(optional, 280 chars)</span>
        </Label>
        <textarea
          placeholder="Leave a message with your bid..."
          value={message}
          maxLength={280}
          rows={3}
          className="w-full flex min-h-[72px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Accordion
        type="single"
        collapsible
        value={advancedExpanded ? 'advanced' : ''}
        onValueChange={(val) => setAdvancedExpanded(val === 'advanced')}
      >
        <AccordionItem value="advanced" className="border-white/[0.06]">
          <AccordionTrigger className="text-sm text-muted-foreground hover:text-white">
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Advanced Options
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 max-w-xl">
              <p className="text-xs text-muted-foreground">
                Donate tokens or NFTs while bidding, or adjust bid collision prevention.
              </p>
              <RadioGroup
                value={donationType}
                onValueChange={(value) => {
                  setRwlkId(-1);
                  setDonationType(value);
                }}
                className="flex flex-row flex-wrap gap-x-4 gap-y-2"
              >
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <RadioGroupItem value="NFT" />
                  <span className="text-sm">Donate NFT</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <RadioGroupItem value="Token" />
                  <span className="text-sm">Donate Token</span>
                </label>
              </RadioGroup>
              {donationType === 'Token' && (
                <div className="space-y-3">
                  <div className="min-w-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Contract Address
                    </Label>
                    <Input
                      placeholder="0x..."
                      value={tokenDonateAddress}
                      onChange={(e) => setTokenDonateAddress(e.target.value)}
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
                      className="font-mono text-sm tabular-nums"
                    />
                  </div>
                </div>
              )}
              {donationType === 'NFT' && (
                <div className="space-y-3">
                  <div className="min-w-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      NFT Contract Address
                    </Label>
                    <Input
                      placeholder="0x..."
                      value={nftDonateAddress}
                      onChange={(e) => setNftDonateAddress(e.target.value)}
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
                      className="font-mono text-sm tabular-nums"
                    />
                  </div>
                </div>
              )}
              {bidType !== 'CST' && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Collision Prevention
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Raise by</span>
                      <div className="relative w-[4.25rem] shrink-0">
                        <CustomTextField
                          type="number"
                          placeholder="0"
                          value={bidPricePlus}
                          min={0}
                          max={50}
                          className="h-9 px-2.5 py-2 pr-7 text-sm tabular-nums"
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
                        (ethBidInfo?.ETHPrice ?? 0) *
                        (1 + bidPricePlus / 100) *
                        (bidType === 'RandomWalk' ? 0.5 : 1)
                      ).toFixed(6)}{' '}
                      ETH
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Bumps bid price by {bidPricePlus}% to avoid collision when two bids land in the
                    same block. Does not permanently raise the price.
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
