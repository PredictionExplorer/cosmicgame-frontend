'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { AddressChip } from '@/components/ui/address-chip';
import { PendingPlate } from '@/components/ui/art-frame';
import NFTImage from '@/components/nft/NFTImage';
import {
  getAttachedNftTokenId,
  resolveAttachedNftLink,
} from '@/components/attachments/attachedNftLinks';
import { useAttachedNftMetadata } from '@/components/attachments/useAttachedNftMetadata';
import type { AttachedNFT } from '@/services/api/types';

/** The plate's black ground and its 1px edge, drawn above the image. */
const PLATE_CLASS = cn(
  'relative block overflow-hidden rounded-edge bg-art-ground',
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
  'after:shadow-[var(--art-edge)] after:transition-shadow after:duration-fast',
);

/**
 * One NFT attached to the cycle: its image on the black art ground at its
 * own ratio, linking to the NFT (its project page, OpenSea or the explorer),
 * and a wall label below with its name, token number and who attached it.
 * Nothing is drawn over the image.
 */
export function AttachedNftPlate({ nft }: { nft: AttachedNFT }) {
  const t = useTranslations('currentCycle');
  const tStatistics = useTranslations('statistics');
  const tokenId = getAttachedNftTokenId(nft);
  const metadata = useAttachedNftMetadata(nft.NFTTokenURI, {
    tokenAddr: nft.TokenAddr,
    tokenId,
  });
  const name = metadata.data?.name ?? null;
  const link = resolveAttachedNftLink({
    nft,
    metadata: metadata.data,
    labels: {
      viewNft: tStatistics('attachedNftLinks.viewNft'),
      viewOpenSea: tStatistics('attachedNftLinks.viewOpenSea'),
      viewContract: tStatistics('attachedNftLinks.viewContract'),
      detailsUnavailable: tStatistics('attachedNftLinks.detailsUnavailable'),
      contractUnavailable: tStatistics('attachedNftLinks.contractUnavailable'),
    },
  });
  const title =
    name ??
    (tokenId
      ? t('showcase.nftCard.fallbackTitle', { id: tokenId })
      : t('showcase.nftCard.fallbackTitleUnknown'));
  const alt = name
    ? tStatistics('attachedNftCard.imageAltNamed', { name })
    : tStatistics('attachedNftCard.imageAlt');

  const image = metadata.isLoading ? (
    <PendingPlate variant="media" busy />
  ) : (
    <NFTImage
      src={metadata.data?.image}
      fallbackSrc={metadata.data?.imageFallback}
      alt={alt}
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
    />
  );

  return (
    <figure className="min-w-0" data-testid="attached-nft">
      {link.href ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(PLATE_CLASS, 'hover:after:shadow-[var(--art-edge-active)]')}
        >
          {image}
        </a>
      ) : (
        <div className={PLATE_CLASS}>{image}</div>
      )}
      <figcaption className="mt-3 min-w-0">
        <p className="truncate type-title text-foreground" title={title}>
          {title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 type-caption text-subtle">
          {name && tokenId ? (
            <span className="type-mono">{t('showcase.facts.tokenIdValue', { id: tokenId })}</span>
          ) : null}
          {nft.DonorAddr ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              {name && tokenId ? <span aria-hidden>·</span> : null}
              {t('showcase.facts.attachedBy')}
              <AddressChip address={nft.DonorAddr} variant="plain" showCopy={false} />
            </span>
          ) : null}
        </p>
      </figcaption>
    </figure>
  );
}
