'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink, Gift, ImageOff, ShieldCheck, Sparkles } from 'lucide-react';

import { shortenHex } from '@/utils';

import NFTImage from '@/components/nft/NFTImage';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';
import type { AttachedNFT } from '@/services/api/types';

import {
  buildOpenSeaAssetUrl,
  getAttachedNftTokenId,
  resolveAttachedNftExplorerLink,
  resolveAttachedNftLink,
} from './attachedNftLinks';
import { useAttachedNftMetadata } from './useAttachedNftMetadata';
import { useNFTCollectionEstimate } from './useNFTCollectionEstimate';

interface AttachedNFTAllocationShowcaseProps {
  nfts: AttachedNFT[];
  cycleNumber?: number;
  className?: string;
}

export function AttachedNFTAllocationShowcase({
  nfts,
  cycleNumber,
  className,
}: AttachedNFTAllocationShowcaseProps) {
  if (nfts.length === 0) return null;

  const hasMultiple = nfts.length > 1;

  return (
    <section
      aria-labelledby="attached-nft-allocation-title"
      className={cn('print-motion-visible my-8', className)}
    >
      <Surface variant="gradient-border-accent" radius="xl" padding="none" className="isolate">
        <div className="pointer-events-none absolute -left-20 top-10 h-52 w-52 rounded-full bg-[rgb(var(--solar-gold-rgb)/0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-primary/18 blur-3xl" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--solar-gold-rgb)/0.22)] bg-[rgb(var(--solar-gold-rgb)/0.10)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--solar-gold-rgb))]">
                <Sparkles className="h-3.5 w-3.5" />
                Included in Signature Allocation
              </div>
              <h2
                id="attached-nft-allocation-title"
                className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                {hasMultiple
                  ? 'Bonus NFTs attached to this cycle'
                  : 'Bonus NFT attached to this cycle'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {hasMultiple
                  ? `The Final Gesture participant receives all ${nfts.length} attached NFTs when Cycle #${cycleNumber ?? nfts[0]?.RoundNum ?? 'current'} finalizes.`
                  : `The Final Gesture participant receives this attached NFT when Cycle #${cycleNumber ?? nfts[0]?.RoundNum ?? 'current'} finalizes.`}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
              <Gift className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Attached Allocation
                </p>
                <p className="text-sm font-bold text-white">
                  {nfts.length} ERC-721 token{nfts.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'grid gap-4',
              nfts.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]',
            )}
          >
            {nfts.slice(0, 4).map((nft, index) => (
              <AttachedNFTAllocationCard
                key={String(
                  nft.RecordId ?? `${nft.TokenAddr}-${getAttachedNftTokenId(nft) ?? index}`,
                )}
                nft={nft}
                featured={index === 0}
              />
            ))}
          </div>

          {nfts.length > 4 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Plus {nfts.length - 4} more attached NFT{nfts.length - 4 === 1 ? '' : 's'} in the full
              cycle details.
            </p>
          ) : null}
        </div>
      </Surface>
    </section>
  );
}

function AttachedNFTAllocationCard({ nft, featured }: { nft: AttachedNFT; featured: boolean }) {
  const { data: metadata, isError } = useAttachedNftMetadata(nft.NFTTokenURI);
  const tokenId = getAttachedNftTokenId(nft);
  const primaryLink = resolveAttachedNftLink({ nft, metadata });
  const explorerLink = resolveAttachedNftExplorerLink(nft);
  const openSeaUrl = buildOpenSeaAssetUrl(nft.TokenAddr, tokenId);
  const { data: estimate } = useNFTCollectionEstimate({
    tokenAddr: nft.TokenAddr,
    tokenId,
    enabled: featured,
  });

  const title = metadata?.name ?? (tokenId ? `NFT #${tokenId}` : 'Attached NFT');
  const subtitle = metadata?.collection_name ?? metadata?.platform ?? 'Community-attached ERC-721';
  const imageAlt = metadata?.name ? `Attached NFT ${metadata.name}` : 'Attached NFT allocation';

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4',
        'bg-[linear-gradient(135deg,rgb(255_255_255/0.045),rgb(255_255_255/0.016)_50%,rgb(var(--nebula-violet-rgb)/0.06))]',
        featured && 'md:col-span-2 xl:col-span-1',
      )}
    >
      <div className={cn('grid gap-4', featured ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : '')}>
        <div>
          {primaryLink.href ? (
            <a
              href={primaryLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-xl border border-white/[0.08] bg-black/25"
              aria-label={`${primaryLink.label}: ${title}`}
            >
              <NFTImage
                src={metadata?.image}
                alt={imageAlt}
                priority={featured}
                sizes={featured ? '(max-width: 1024px) 100vw, 720px' : '360px'}
                className="transition-transform duration-500 group-hover:scale-[1.025]"
              />
            </a>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/25">
              <NFTImage src={metadata?.image} alt={imageAlt} priority={featured} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Recipient receives
              </span>
              {estimate ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--solar-gold-rgb)/0.25)] bg-[rgb(var(--solar-gold-rgb)/0.10)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--solar-gold-rgb))]">
                  Floor ~{estimate.floorPriceEth.toFixed(3)} {estimate.currency}
                  <InfoTooltip content="Collection floor estimate, not an appraisal of this specific token." />
                </span>
              ) : null}
            </div>

            <h3 className="truncate font-display text-xl font-bold tracking-tight text-white">
              {title}
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>

            {isError ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
                <ImageOff className="h-3.5 w-3.5" />
                Metadata unavailable. The attached NFT is still part of this cycle allocation.
              </p>
            ) : metadata?.description && featured ? (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {metadata.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Fact label="Token ID" value={tokenId ? `#${tokenId}` : 'Unknown'} />
              <Fact
                label="Attached by"
                value={
                  nft.DonorAddr ? (
                    <Link href={`/user/${nft.DonorAddr}`} className="hover:text-primary">
                      {shortenHex(nft.DonorAddr, 5)}
                    </Link>
                  ) : (
                    'Unknown'
                  )
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {primaryLink.href ? (
                <ExternalAction href={primaryLink.href} label={primaryLink.label} primary />
              ) : null}
              {openSeaUrl && primaryLink.href !== openSeaUrl ? (
                <ExternalAction href={openSeaUrl} label="OpenSea" />
              ) : null}
              {explorerLink.href ? (
                <ExternalAction href={explorerLink.href} label="Explorer" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 truncate font-mono text-xs text-white">{value}</div>
    </div>
  );
}

function ExternalAction({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        primary
          ? 'border-primary/30 bg-primary/12 text-primary hover:bg-primary/18'
          : 'border-white/[0.08] bg-white/[0.035] text-muted-foreground hover:border-primary/25 hover:text-primary',
      )}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
