import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId, getAssetsUrl, logoImgUrl, parseTokenId } from '@/utils';

import { capCacheWindow } from '@/lib/cacheWindow';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import {
  fetchNftMetadata,
  normalizeTraitEntry,
  traitProperties,
  type CosmicSignatureMetadata,
  type TraitTranslator,
} from '@/lib/nftMetadata';
import { SERVER_READ_TIMEOUT_MS, flattenTx } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { PageMessages } from '@/components/i18n/PageMessages';
import { notFoundMetadata } from '@/components/layout/notFoundMetadata';
import { signatureTitle } from '@/components/nft/nftName';

import DetailPage from './DetailPage';
import { SignatureNotFound } from './SignatureNotFound';
import { loadTokenInfo } from './tokenInfo';

/**
 * No Signature renders at build time: each one renders on its first visit
 * and is then served from the cache (ISR), so every repeat visit is a CDN
 * hit instead of a serverless render. The art never changes once imprinted,
 * but the page also shows the owner, the name and the anchoring, so a render
 * is kept for the live window (`CACHE_WINDOW.live`, five minutes; the client
 * refreshes the record right after hydration), and a number not imprinted
 * yet, or a render whose record read failed, for a minute. Deploys purge the
 * cache, and the window bounds any og:image host rotation in between.
 */
export function generateStaticParams() {
  return [];
}

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
 * origin has no document for the id, `undefined` on transport errors or
 * after `SERVER_READ_TIMEOUT_MS` — the client then loads it itself; neither
 * ever fails or holds up the prerender.
 */
const loadTokenMetadata = cache(
  async (tokenId: number): Promise<CosmicSignatureMetadata | null | undefined> => {
    try {
      return await fetchNftMetadata(tokenId, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(SERVER_READ_TIMEOUT_MS),
      });
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
  // A number not imprinted yet: the 404's own title and `noindex, follow`.
  if (tokenInfo === null) return notFoundMetadata(locale);

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
  const tokenInfo = await loadTokenInfo(tokenId);
  // A number not imprinted yet: the Signature's not-found state, rendered on the server and
  // kept a minute, since the number may be imprinted at the next finalization.
  if (tokenInfo === null) {
    await capCacheWindow('pending');
    return <SignatureNotFound locale={locale} tokenId={tokenId} />;
  }
  // A record the server could not read is loaded by the browser: keep that render briefly.
  if (tokenInfo === undefined) await capCacheWindow('pending');

  const [t, tCommon, seo, tTraits, metadata] = await Promise.all([
    getTranslations({ locale, namespace: 'detail' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'traits' }),
    loadTokenMetadata(tokenId),
  ]);

  const description = t('jsonLd.productDescription');
  const pagePath = `/detail/${tokenId}`;
  const pageUrl = localeHref(APP_ORIGIN, pagePath, locale);

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
