'use client';

import { Fragment, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatAddress, formatCount } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { AttachedNFT as AttachedNFTRecord } from '@/services/api/types';
import { AddressChip } from '@/components/ui/address-chip';
import { DateTime } from '@/components/ui/date-time';
import NFTImage from '@/components/nft/NFTImage';
import { TableLink } from '@/components/ui/data-table';

import { getAttachedNftTokenId, resolveAttachedNftLink } from './attachedNftLinks';
import { useAttachedNftMetadata } from './useAttachedNftMetadata';

type NFT = Partial<
  Pick<
    AttachedNFTRecord,
    'TokenAddr' | 'NFTTokenId' | 'NFTTokenURI' | 'TokenId' | 'RoundNum' | 'DonorAddr' | 'TimeStamp'
  >
> & {
  [key: string]: unknown;
};

interface AttachedNFTProps {
  nft: NFT;
  /**
   * Adds the record under the label: the cycle it was attached in, when,
   * and by whom (the Attached NFT Contributions page).
   */
  showRecord?: boolean;
  className?: string;
}

/** Caption facts joined by middle dots whose leading space never breaks. */
function Caption({ facts, className }: { facts: readonly ReactNode[]; className?: string }) {
  const present = facts.filter((fact) => fact !== null && fact !== undefined && fact !== '');
  if (present.length === 0) return null;
  return (
    <p className={cn('type-caption text-subtle', className)}>
      {present.map((fact, index) => (
        <Fragment key={index}>
          {index > 0 ? '\u00a0· ' : null}
          {fact}
        </Fragment>
      ))}
    </p>
  );
}

/**
 * An NFT attached to a gesture, shown as a work on a black plate: the image
 * whole (object-contain) on a square ground, then its name or number and its
 * collection. The plate and title link to the NFT on its project's site,
 * OpenSea or the explorer (a new tab); `showRecord` adds the cycle, the date
 * and the contributor, each with its own link.
 */
const AttachedNFT = ({ nft, showRecord = false, className }: AttachedNFTProps) => {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const { data: metadata } = useAttachedNftMetadata(nft.NFTTokenURI, {
    tokenAddr: nft.TokenAddr,
    tokenId: nft.NFTTokenId ?? nft.TokenId,
  });
  const link = resolveAttachedNftLink({
    nft,
    metadata,
    labels: {
      viewNft: t('attachedNftLinks.viewNft'),
      viewOpenSea: t('attachedNftLinks.viewOpenSea'),
      viewContract: t('attachedNftLinks.viewContract'),
      detailsUnavailable: t('attachedNftLinks.detailsUnavailable'),
      contractUnavailable: t('attachedNftLinks.contractUnavailable'),
    },
  });
  const tokenId = getAttachedNftTokenId(nft);
  const name = typeof metadata?.name === 'string' ? metadata.name.trim() : '';
  const number = tokenId ? `#${tokenId}` : t('attachedNftCard.unknownToken');
  const collection =
    (typeof metadata?.collection_name === 'string' && metadata.collection_name.trim()) ||
    (nft.TokenAddr ? formatAddress(nft.TokenAddr) : null);
  const accessibleName = name
    ? t('attachedNftCard.viewNamed', { name })
    : tokenId
      ? t('attachedNftCard.viewId', { id: tokenId })
      : link.label;

  const plate = (
    <div className="relative aspect-square overflow-hidden rounded-edge bg-art-ground shadow-[var(--art-edge)] transition-shadow duration-[var(--duration-fast)] group-hover:shadow-[var(--art-edge-active)]">
      <NFTImage
        src={metadata?.image}
        fallbackSrc={metadata?.imageFallback}
        alt={name ? t('attachedNftCard.imageAltNamed', { name }) : t('attachedNftCard.imageAlt')}
        density="compact"
        sizes="(min-width: 1024px) 18rem, (min-width: 640px) 33vw, 50vw"
        className="aspect-square h-full w-full bg-transparent object-contain"
      />
    </div>
  );
  const label = (
    <div className="mt-3 min-w-0">
      <p className="flex items-start gap-1 type-body-sm font-medium text-foreground [overflow-wrap:anywhere]">
        <span className="line-clamp-2 decoration-rule underline-offset-4 group-hover:underline">
          {name || number}
        </span>
        {link.href ? (
          <ArrowUpRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-subtle" />
        ) : null}
      </p>
      <Caption
        facts={[name ? <span className="type-mono">{number}</span> : null, collection]}
        className="mt-0.5 truncate"
      />
    </div>
  );

  return (
    <article className={cn('min-w-0', className)} data-testid="attached-nft">
      {link.href ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={accessibleName}
          className="group block rounded-edge"
        >
          {plate}
          {label}
        </a>
      ) : (
        <div aria-label={accessibleName} role="group" className="group">
          {plate}
          {label}
        </div>
      )}
      {showRecord ? (
        <div className="mt-1.5 space-y-1">
          <Caption
            facts={[
              nft.RoundNum !== undefined && nft.RoundNum !== null ? (
                <TableLink key="cycle" href={`/allocation/${nft.RoundNum}`}>
                  {t('attachedNfts.card.cycle', { cycle: formatCount(nft.RoundNum, locale) })}
                </TableLink>
              ) : null,
              nft.TimeStamp ? <DateTime key="date" timestamp={nft.TimeStamp} /> : null,
            ]}
          />
          {nft.DonorAddr ? (
            <p className="flex min-w-0 items-center gap-1.5 type-caption text-subtle">
              <span className="shrink-0">{t('attachedNfts.card.attachedBy')}</span>
              <AddressChip
                address={nft.DonorAddr}
                variant="plain"
                showCopy={false}
                className="min-w-0"
              />
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

export default AttachedNFT;
