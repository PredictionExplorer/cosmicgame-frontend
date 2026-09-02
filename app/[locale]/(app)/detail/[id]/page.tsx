import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAssetsUrl, logoImgUrl } from '@/utils';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import {
  fetchNftMetadata,
  normalizeTraitEntry,
  traitProperties,
  type CosmicSignatureMetadata,
  type TraitTranslator,
} from '@/lib/nftMetadata';
import { getAPIUrl } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { PageMessages } from '@/components/i18n/PageMessages';

import DetailPage from './DetailPage';

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

function parseTokenId(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  const tokenId = Number(id);
  return Number.isSafeInteger(tokenId) ? tokenId : null;
}

function tokenImageUrl(seed: string | number | undefined): string {
  if (seed === undefined || seed === null || String(seed) === '') return logoImgUrl;
  return getAssetsUrl(`cosmicsignature/0x${seed}.png`);
}

/**
 * `fetch` (not axios) so the read lands in the Next.js Data Cache, and
 * React `cache()` so generateMetadata and the page body share one request
 * per render instead of the two this page used to make.
 * Returns null for a confirmed missing token (404), undefined on transport
 * errors — callers 404 the page only on the former.
 */
const loadTokenInfo = cache(async (tokenId: number): Promise<CSTTokenInfo | null | undefined> => {
  try {
    const response = await fetch(getAPIUrl(`cst/info/${tokenId}`), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (response.status === 404) return null;
    if (!response.ok) return undefined;
    const data = (await response.json()) as { TokenInfo?: CSTTokenInfo | null };
    return data.TokenInfo ?? null;
  } catch {
    return undefined;
  }
});

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
  const title = t('tokenDetail.titleFor', { id });
  const description = t('tokenDetail.descriptionFor', { id });

  const tokenInfo = await loadTokenInfo(tokenId);
  if (tokenInfo === null) {
    notFound();
  }

  return createMetadata(title, description, tokenImageUrl(tokenInfo?.Seed), '/detail/' + id, {
    locale,
  });
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

  const name = t('jsonLd.productName', { id });
  const description = t('jsonLd.productDescription');
  const pageUrl = localeHref(APP_ORIGIN, `/detail/${id}`, locale);

  if (tokenInfo === null) {
    notFound();
  }

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
            name,
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
              { name: t('jsonLd.breadcrumbToken', { id }), path: `/detail/${id}` },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          )}
        />
        <DetailPage tokenId={tokenId} initialMetadata={metadata} />
      </>
    </PageMessages>
  );
}
