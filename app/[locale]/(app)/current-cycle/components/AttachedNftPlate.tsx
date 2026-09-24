'use client';

import { useTranslations } from 'next-intl';

import { SiteLink } from '@/components/layout/SiteLink';
import { AddressChip } from '@/components/ui/address-chip';
import { MEDIA_PLATE_CLASS, PendingPlate, WallLabel } from '@/components/ui/art-frame';
import NFTImage from '@/components/nft/NFTImage';
import {
  getAttachedNftTokenId,
  resolveAttachedNftLink,
} from '@/components/attachments/attachedNftLinks';
import { useAttachedNftMetadata } from '@/components/attachments/useAttachedNftMetadata';
import type { AttachedNFT } from '@/services/api/types';

/**
 * One NFT attached to the cycle: its image on the media plate at its own
 * ratio, and a wall label below with its name, token number, who attached it
 * and where to see it ("View on OpenSea ↗", a new tab). Nothing is drawn over
 * the image. The plate is a pointer shortcut to the same page; keyboard and
 * screen-reader users reach it once, through the named link in the label.
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
          tabIndex={-1}
          aria-hidden
          className={MEDIA_PLATE_CLASS}
        >
          {image}
        </a>
      ) : (
        <div className={MEDIA_PLATE_CLASS}>{image}</div>
      )}
      <WallLabel
        as="figcaption"
        className="mt-3"
        title={title}
        meta={[
          name && tokenId ? (
            <span className="type-mono">{t('showcase.facts.tokenIdValue', { id: tokenId })}</span>
          ) : null,
          nft.DonorAddr ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              {t('showcase.facts.attachedBy')}
              <AddressChip address={nft.DonorAddr} variant="plain" showCopy={false} />
            </span>
          ) : null,
        ]}
      >
        {link.href ? (
          <SiteLink
            kind="external"
            href={link.href}
            className="link-quiet inline-flex min-h-6 w-fit items-center gap-1 type-caption"
          >
            {link.label}
          </SiteLink>
        ) : null}
      </WallLabel>
    </figure>
  );
}
