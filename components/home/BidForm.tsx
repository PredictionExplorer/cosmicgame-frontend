import { zeroAddress } from 'viem';

import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  return (
    <>
      <p className="mb-2 mt-8">Make your bid with:</p>
      <RadioGroup
        value={bidType}
        onValueChange={(value) => {
          setRwlkId(-1);
          setBidType(value);
        }}
        className="flex flex-row flex-wrap gap-4 mb-4"
      >
        <label className="flex items-center gap-1.5 cursor-pointer">
          <RadioGroupItem value="ETH" />
          <span className="text-sm">ETH</span>
        </label>
        {data?.LastBidderAddr !== zeroAddress && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <RadioGroupItem value="RandomWalk" />
            <span className="text-sm">RandomWalk</span>
          </label>
        )}
        {data?.LastBidderAddr !== zeroAddress && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <RadioGroupItem value="CST" />
            <span className="text-sm">CST(Cosmic Token)</span>
          </label>
        )}
      </RadioGroup>

      {bidType === 'ETH' && data?.LastBidderAddr === zeroAddress && (
        <AuctionInfo
          secondsElapsed={ethBidInfo?.SecondsElapsed ?? 0}
          auctionDuration={ethBidInfo?.AuctionDuration ?? 0}
        />
      )}

      {bidType === 'RandomWalk' && (
        <div className="mb-8 mx-4">
          <h6 className="text-lg font-semibold">Random Walk NFT Gallery</h6>
          <p className="text-sm">
            If you own some RandomWalkNFTs and one of them is used when bidding, you can get a 50%
            discount!
          </p>
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

      <textarea
        placeholder="Message (280 characters, optional)"
        value={message}
        maxLength={280}
        rows={4}
        className="w-full mb-4 flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onChange={(e) => setMessage(e.target.value)}
      />

      <Accordion
        type="single"
        collapsible
        value={advancedExpanded ? 'advanced' : ''}
        onValueChange={(val) => setAdvancedExpanded(val === 'advanced')}
      >
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Options</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm">
              If you want to donate tokens or one of your NFTs while bidding, you can put the
              contract address, NFT id, and comment here.
            </p>
            <RadioGroup
              value={donationType}
              onValueChange={(value) => {
                setRwlkId(-1);
                setDonationType(value);
              }}
              className="flex flex-row gap-4 mt-4"
            >
              <label className="flex items-center gap-1.5 cursor-pointer">
                <RadioGroupItem value="NFT" />
                <span className="text-sm">NFT</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <RadioGroupItem value="Token" />
                <span className="text-sm">Token</span>
              </label>
            </RadioGroup>
            {donationType === 'Token' && (
              <>
                <Input
                  placeholder="Token Contract Address"
                  value={tokenDonateAddress}
                  className="mt-2"
                  onChange={(e) => setTokenDonateAddress(e.target.value)}
                />
                <Input
                  placeholder="Token Amount"
                  type="number"
                  value={tokenAmount}
                  className="mt-4"
                  onChange={(e) => setTokenAmount(e.target.value)}
                />
              </>
            )}
            {donationType === 'NFT' && (
              <>
                <Input
                  placeholder="NFT contract address"
                  value={nftDonateAddress}
                  className="mt-2"
                  onChange={(e) => setNftDonateAddress(e.target.value)}
                />
                <Input
                  placeholder="NFT number"
                  type="number"
                  value={nftId}
                  className="mt-4"
                  onChange={(e) => setNftId(e.target.value)}
                />
              </>
            )}
            {bidType !== 'CST' && (
              <div className="border border-[#444] rounded p-4 mt-4">
                <p className="text-sm font-medium">Bid price collision prevention</p>
                <div className="flex mt-4 items-center">
                  <span className="whitespace-nowrap text-white/70 mr-4">Rise bid price by</span>
                  <div className="relative flex-1">
                    <CustomTextField
                      type="number"
                      placeholder="Bid Price Plus"
                      value={bidPricePlus}
                      min={0}
                      max={50}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= 50) {
                          setBidPricePlus(value);
                        }
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      %
                    </span>
                  </div>
                  <span className="whitespace-nowrap text-white/70 ml-4">
                    {(
                      (ethBidInfo?.ETHPrice ?? 0) *
                      (1 + bidPricePlus / 100) *
                      (bidType === 'RandomWalk' ? 0.5 : 1)
                    ).toFixed(6)}{' '}
                    ETH
                  </span>
                </div>
                <p className="text-sm mt-4">
                  The bid price is bumped {bidPricePlus}% to prevent bidding collision.
                </p>
                <p className="text-sm">
                  This percentage won&apos;t rise the bid price arbitrarily after your bid, it is
                  only meant for allowing both bid transactions to pass through in case two
                  simultaneous bids occur within the same block.
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
