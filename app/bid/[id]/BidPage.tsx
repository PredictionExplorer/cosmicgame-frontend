'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import RandomWalkNFT from '@/components/nft/RandomWalkNFT';
import NFTImage from '@/components/nft/NFTImage';
import { useBidInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

interface NFTTokenURI {
  image?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  description?: string;
  [key: string]: unknown;
}

const BidPage = ({ bidId }: { bidId: number }) => {
  const { data: bidInfo = null, isLoading: loading } = useBidInfo(bidId);

  const [tokenURI, setTokenURI] = useState<NFTTokenURI | null>(null);

  useEffect(() => {
    if (bidInfo?.NFTTokenURI) {
      axios.get(bidInfo.NFTTokenURI).then(({ data }) => setTokenURI(data));
    }
  }, [bidInfo]);

  if (bidId < 0) {
    return (
      <MainWrapper>
        <div className={cn(detailPanelClass, 'mx-auto max-w-lg p-8 text-center')}>
          <p className="font-display text-lg font-semibold text-foreground">Invalid Gesture Id</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Use a non-negative numeric gesture identifier in the URL.
          </p>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Gesture details"
          subtitle={loading ? 'Loading gesture data\u2026' : `Gesture #${bidId}`}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: `Gesture #${bidId}` }]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : !bidInfo ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="font-medium text-foreground">No gesture information found.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This ID may be invalid or the gesture is not in the current index.
            </p>
          </div>
        ) : (
          <>
            <SectionCard
              sectionId="bid-section-tx"
              title="Transaction and cycle"
              description="When the gesture was made and which cycle it belongs to."
            >
              <DefinitionList>
                <DetailRow label="Gesture datetime">
                  <a
                    href={getExplorerUrl('tx', bidInfo.TxHash)}
                    className={detailLinkClass}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {convertTimestampToDateTime(bidInfo.TimeStamp)}
                  </a>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Opens the transaction on the block explorer
                  </span>
                </DetailRow>
                <DetailRow label="Participant address">
                  <Link
                    href={`/user/${bidInfo.BidderAddr}`}
                    className={cn(detailLinkClass, 'font-mono text-[13px] break-all')}
                  >
                    {bidInfo.BidderAddr}
                  </Link>
                </DetailRow>
                <DetailRow label="Cycle number">
                  <Link href={`/prize/${bidInfo.RoundNum}`} className={detailLinkClass}>
                    Cycle {bidInfo.RoundNum}
                  </Link>
                </DetailRow>
              </DefinitionList>
            </SectionCard>

            <SectionCard
              sectionId="bid-section-amount"
              title="Cost and Participation CST"
              description="What was paid and the Participation CST imprinted by this gesture."
            >
              <DefinitionList>
                <DetailRow label="Gesture cost">
                  <span className="font-mono tabular-nums text-foreground">
                    {bidInfo.BidType === 2
                      ? `${
                          (bidInfo.NumCSTTokensEth ?? 0) > 0 && (bidInfo.NumCSTTokensEth ?? 0) < 1
                            ? (bidInfo.NumCSTTokensEth ?? 0).toFixed(7)
                            : (bidInfo.NumCSTTokensEth ?? 0).toFixed(2)
                        } CST`
                      : `${
                          (bidInfo.BidPriceEth ?? 0) > 0 && (bidInfo.BidPriceEth ?? 0) < 1
                            ? (bidInfo.BidPriceEth ?? 0).toFixed(7)
                            : (bidInfo.BidPriceEth ?? 0).toFixed(2)
                        } ETH`}
                  </span>
                </DetailRow>
                <DetailRow label="Participation CST (ETH value)">
                  <span className="font-mono tabular-nums">
                    {(bidInfo.ERC20RewardAmountEth ?? 0).toFixed(2)} ETH
                  </span>
                </DetailRow>
              </DefinitionList>
            </SectionCard>

            <SectionCard
              sectionId="bid-section-type"
              title="Gesture type"
              description="Whether a Random Walk NFT or CST was used for this gesture."
            >
              <DefinitionList>
                <DetailRow label="Was gesture with RandomWalkNFT:">
                  {(bidInfo.RWalkNFTId ?? -1) < 0 ? 'No' : 'Yes'}
                </DetailRow>
                <DetailRow label="Was gesture with Cosmic Signature Token:">
                  {bidInfo.BidType === 2 ? 'Yes' : 'No'}
                </DetailRow>
                {(bidInfo.RWalkNFTId ?? -1) >= 0 ? (
                  <DetailRow label="RandomWalkNFT ID:">
                    <span className="font-mono tabular-nums">{bidInfo.RWalkNFTId}</span>
                  </DetailRow>
                ) : null}
              </DefinitionList>
            </SectionCard>

            {bidInfo.DonatedERC20TokenAddr ? (
              <SectionCard
                sectionId="bid-section-erc20"
                title="Attached ERC-20"
                description="Optional ERC-20 token attached to this gesture."
              >
                <DefinitionList>
                  <DetailRow label="Attached ERC-20 Token Address:">
                    <span className="font-mono text-[13px] break-all">
                      {bidInfo.DonatedERC20TokenAddr}
                    </span>
                  </DetailRow>
                  <DetailRow label="Attached ERC-20 Token Amount (ETH):">
                    <span className="font-mono tabular-nums">
                      {(bidInfo.DonatedERC20TokenAmountEth ?? 0).toFixed(2)}
                    </span>
                  </DetailRow>
                </DefinitionList>
              </SectionCard>
            ) : null}

            {bidInfo.NFTDonationTokenAddr !== '' && bidInfo.NFTDonationTokenId !== -1 ? (
              <SectionCard
                sectionId="bid-section-nft"
                title="Attached NFT"
                description="Metadata for the NFT attached to this gesture, when present."
              >
                <DefinitionList>
                  <DetailRow label="Attached NFT Token Address:">
                    <span className="font-mono text-[13px] break-all">
                      {bidInfo.NFTDonationTokenAddr}
                    </span>
                  </DetailRow>
                  <DetailRow label="Attached NFT Token ID:">
                    <span className="font-mono tabular-nums">{bidInfo.NFTDonationTokenId}</span>
                  </DetailRow>
                  <DetailRow label="NFT Token URI:">
                    <span className="break-all text-xs text-muted-foreground">
                      {bidInfo.NFTTokenURI}
                    </span>
                  </DetailRow>
                </DefinitionList>
                <div className="border-t border-white/[0.06] px-4 py-5 sm:px-5">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Preview and metadata
                  </p>
                  <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
                    <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
                      <NFTImage src={tokenURI?.image} className="bg-contain" />
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Collection name
                        </p>
                        <p className="mt-0.5 text-foreground">{tokenURI?.collection_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Artist
                        </p>
                        <p className="mt-0.5 text-foreground">{tokenURI?.artist ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Platform
                        </p>
                        <p className="mt-0.5 text-foreground">{tokenURI?.platform ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Description
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-foreground/90">
                          {tokenURI?.description ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard
              sectionId="bid-section-message"
              title="Message"
              description="Message left by the participant with this gesture."
            >
              <div className="px-4 py-4 sm:px-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {bidInfo.Message || '\u2014'}
                </p>
              </div>
            </SectionCard>

            {(bidInfo.RWalkNFTId ?? -1) >= 0 ? (
              <section className={cn(detailPanelClass, 'p-5')} aria-label="Random Walk NFT preview">
                <h2 className="mb-4 font-display text-lg font-semibold tracking-tight text-foreground">
                  Random Walk NFT
                </h2>
                <div className="mx-auto max-w-md sm:mx-0">
                  <RandomWalkNFT tokenId={bidInfo.RWalkNFTId!} selectable={false} />
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </MainWrapper>
  );
};

export default BidPage;
