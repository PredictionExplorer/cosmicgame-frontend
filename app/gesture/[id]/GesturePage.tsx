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
import { PageShell } from '@/components/ui/page-shell';
import RandomWalkNFT from '@/components/nft/RandomWalkNFT';
import NFTImage from '@/components/nft/NFTImage';
import { useGestureInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

interface NFTTokenURI {
  image?: string;
  collection_name?: string;
  artist?: string;
  platform?: string;
  description?: string;
  [key: string]: unknown;
}

const GesturePage = ({ gestureId }: { gestureId: number }) => {
  const { data: gestureInfo = null, isLoading: loading } = useGestureInfo(gestureId);

  const [tokenURI, setTokenURI] = useState<NFTTokenURI | null>(null);

  useEffect(() => {
    if (gestureInfo?.NFTTokenURI) {
      axios.get(gestureInfo.NFTTokenURI).then(({ data }) => setTokenURI(data));
    }
  }, [gestureInfo]);

  if (gestureId < 0) {
    return (
      <PageShell variant="form">
        <div className={cn(detailPanelClass, 'mx-auto max-w-lg p-8 text-center')}>
          <p className="font-display text-lg font-semibold text-foreground">Invalid Gesture Id</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Use a non-negative numeric gesture identifier in the URL.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="detail" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Gesture details"
          subtitle={loading ? 'Loading gesture data\u2026' : `Gesture #${gestureId}`}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: `Gesture #${gestureId}` }]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : !gestureInfo ? (
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
                    href={getExplorerUrl('tx', gestureInfo.TxHash)}
                    className={detailLinkClass}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {convertTimestampToDateTime(gestureInfo.TimeStamp)}
                  </a>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Opens the transaction on the block explorer
                  </span>
                </DetailRow>
                <DetailRow label="Participant address">
                  <Link
                    href={`/user/${gestureInfo.BidderAddr}`}
                    className={cn(detailLinkClass, 'font-mono text-[13px] break-all')}
                  >
                    {gestureInfo.BidderAddr}
                  </Link>
                </DetailRow>
                <DetailRow label="Cycle number">
                  <Link href={`/allocation/${gestureInfo.RoundNum}`} className={detailLinkClass}>
                    Cycle {gestureInfo.RoundNum}
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
                    {gestureInfo.GestureType === 2
                      ? `${
                          (gestureInfo.NumCSTTokensEth ?? 0) > 0 &&
                          (gestureInfo.NumCSTTokensEth ?? 0) < 1
                            ? (gestureInfo.NumCSTTokensEth ?? 0).toFixed(7)
                            : (gestureInfo.NumCSTTokensEth ?? 0).toFixed(2)
                        } CST`
                      : `${
                          (gestureInfo.GestureCostEth ?? 0) > 0 &&
                          (gestureInfo.GestureCostEth ?? 0) < 1
                            ? (gestureInfo.GestureCostEth ?? 0).toFixed(7)
                            : (gestureInfo.GestureCostEth ?? 0).toFixed(2)
                        } ETH`}
                  </span>
                </DetailRow>
                <DetailRow label="Participation CST (ETH value)">
                  <span className="font-mono tabular-nums">
                    {(gestureInfo.ERC20RewardAmountEth ?? 0).toFixed(2)} ETH
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
                  {(gestureInfo.RWalkNFTId ?? -1) < 0 ? 'No' : 'Yes'}
                </DetailRow>
                <DetailRow label="Was gesture with Cosmic Signature Token:">
                  {gestureInfo.GestureType === 2 ? 'Yes' : 'No'}
                </DetailRow>
                {(gestureInfo.RWalkNFTId ?? -1) >= 0 ? (
                  <DetailRow label="RandomWalkNFT ID:">
                    <span className="font-mono tabular-nums">{gestureInfo.RWalkNFTId}</span>
                  </DetailRow>
                ) : null}
              </DefinitionList>
            </SectionCard>

            {gestureInfo.DonatedERC20TokenAddr ? (
              <SectionCard
                sectionId="bid-section-erc20"
                title="Attached ERC-20"
                description="Optional ERC-20 token attached to this gesture."
              >
                <DefinitionList>
                  <DetailRow label="Attached ERC-20 Token Address:">
                    <span className="font-mono text-[13px] break-all">
                      {gestureInfo.DonatedERC20TokenAddr}
                    </span>
                  </DetailRow>
                  <DetailRow label="Attached ERC-20 Token Amount (ETH):">
                    <span className="font-mono tabular-nums">
                      {(gestureInfo.DonatedERC20TokenAmountEth ?? 0).toFixed(2)}
                    </span>
                  </DetailRow>
                </DefinitionList>
              </SectionCard>
            ) : null}

            {gestureInfo.NFTDonationTokenAddr !== '' && gestureInfo.NFTDonationTokenId !== -1 ? (
              <SectionCard
                sectionId="bid-section-nft"
                title="Attached NFT"
                description="Metadata for the NFT attached to this gesture, when present."
              >
                <DefinitionList>
                  <DetailRow label="Attached NFT Token Address:">
                    <span className="font-mono text-[13px] break-all">
                      {gestureInfo.NFTDonationTokenAddr}
                    </span>
                  </DetailRow>
                  <DetailRow label="Attached NFT Token ID:">
                    <span className="font-mono tabular-nums">{gestureInfo.NFTDonationTokenId}</span>
                  </DetailRow>
                  <DetailRow label="NFT Token URI:">
                    <span className="break-all text-xs text-muted-foreground">
                      {gestureInfo.NFTTokenURI}
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
                  {gestureInfo.Message || '\u2014'}
                </p>
              </div>
            </SectionCard>

            {(gestureInfo.RWalkNFTId ?? -1) >= 0 ? (
              <section className={cn(detailPanelClass, 'p-5')} aria-label="Random Walk NFT preview">
                <h2 className="mb-4 font-display text-lg font-semibold tracking-tight text-foreground">
                  Random Walk NFT
                </h2>
                <div className="mx-auto max-w-md sm:mx-0">
                  <RandomWalkNFT tokenId={gestureInfo.RWalkNFTId!} selectable={false} />
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  );
};

export default GesturePage;
