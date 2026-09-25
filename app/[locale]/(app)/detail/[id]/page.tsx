import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId, getAssetsUrl, logoImgUrl } from '@/utils';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import {
  fetchNftMetadata,
  normalizeTraitEntry,
  traitProperties,
  type CosmicSignatureMetadata,
  type TraitTranslator,
} from '@/lib/nftMetadata';
import { flattenTx } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { PageMessages } from '@/components/i18n/PageMessages';
import { signatureTitle } from '@/components/nft/nftName';

import DetailPage from './DetailPage';
import { loadTokenInfo } from './tokenInfo';
import { parseTokenId } from './tokenId';

/**
 * ISR (was force-dynamic): token metadata is immutable once imprinted, so a
 * bounded staleness window is safe and turns every repeat visit into a CDN
 * hit instead of a serverless render. The original force-dynamic guarded
 * against og:image URLs surviving from an older build when CDN hosts change
 * per network — deploys purge the ISR cache, and in-between the 5-minute
 * window bounds any host-rotation staleness.
 */
export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

function tokenImageUrl(seed: string | number | undefined): string {
  if (seed === undefined || seed === null || String(seed) === '') return logoImgUrl;
  return getAssetsUrl(`cosmicsignature/0x${seed}.png`);
}

/**
 * The token's metadata document (traits, palette, simulation), read once per
 * render for the JSON-LD and the client's first paint. `null` when the media
 * origin has no document for the id, `undefined` on transport errors — the
 * client then loads it itself; neither ever fails the prerender.
 */
const loadTokenMetadata = cache(
  async (tokenId: number): Promise<CosmicSignatureMetadata | null | undefined> => {
    try {
      return await fetchNftMetadata(tokenId, { next: { revalidate: 300 } });
    } catch {
      return undefined;
    }
  },
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const tokenId = parseTokenId(id);

  if (tokenId === null) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'meta' });
  const tokenInfo = await loadTokenInfo(tokenId);
  if (tokenInfo === null) {
    notFound();
  }

  // A named piece is shared by its name: `Twisted Mind · Cosmic Signature
  // #000025`, the number as the H1 and the JSON-LD write it. The canonical
  // is the one URL a Signature has (the layout moves /detail/025 there).
  const number = formatId(tokenId).slice(1); // "000025": the catalog writes the "#"
  const name = typeof tokenInfo?.TokenName === 'string' ? tokenInfo.TokenName.trim() : '';
  const title = name
    ? t('tokenDetail.titleWithName', { name, id: number })
    : t('tokenDetail.titleFor', { id: number });
  const description = t('tokenDetail.descriptionFor', { id: number });

  // The share image is the co-located artwork card (./opengraph-image.tsx):
  // a 1200×630 PNG of the piece on its black plate, never the multi-MB source.
  return createMetadata(title, description, undefined, `/detail/${tokenId}`, { locale });
}

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  const tokenId = parseTokenId(id);

  if (tokenId === null) {
    notFound();
  }

  setRequestLocale(locale);
  const [t, tCommon, seo, tTraits, tokenInfo, metadata] = await Promise.all([
    getTranslations({ locale, namespace: 'detail' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'traits' }),
    loadTokenInfo(tokenId),
    loadTokenMetadata(tokenId),
  ]);

  const description = t('jsonLd.productDescription');
  const pagePath = `/detail/${tokenId}`;
  const pageUrl = localeHref(APP_ORIGIN, pagePath, locale);

  if (tokenInfo === null) {
    notFound();
  }

  // The page's own title (the H1 and the end of its trail): the name, or
  // "Cosmic Signature #000025" for an unnamed Signature.
  const title = signatureTitle(tTraits, { id: formatId(tokenId), name: tokenInfo?.TokenName });
  const imageUrl = tokenImageUrl(tokenInfo?.Seed);
  const traitEntry = metadata ? normalizeTraitEntry(metadata, tokenId) : null;
  const additionalProperty = traitEntry?.hasArtTraits
    ? traitProperties(tTraits as unknown as TraitTranslator, traitEntry)
    : undefined;

  return (
    <PageMessages namespaces={['detail', 'tables', 'traits']}>
      <>
        <JsonLd
          data={nftProductJsonLd({
            tokenId,
            name: title,
            description,
            imageUrl,
            url: pageUrl,
            category: seo('jsonLd.product.category'),
            additionalProperty,
          })}
        />
        <JsonLd
          data={breadcrumbJsonLd(
            [
              { name: tCommon('breadcrumbs.home'), path: '/' },
              { name: tCommon('breadcrumbs.gallery'), path: '/gallery' },
              { name: title, path: pagePath },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          )}
        />
        <DetailPage
          tokenId={tokenId}
          initialMetadata={metadata}
          // The same record the client reads, so the art and its wall label
          // are in the first HTML paint instead of behind a skeleton.
          initialToken={tokenInfo ? (flattenTx(tokenInfo) as CSTTokenInfo) : undefined}
        />
      </>
    </PageMessages>
  );
}
