import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAssetsUrl, logoImgUrl } from '@/utils';

import { axios, getAPIUrl, isAxiosError } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';

import DetailPage from './DetailPage';

/** Avoid serving og:image / JSON-LD from an older build or data cache when CDN hosts change per network. */
export const dynamic = 'force-dynamic';

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

async function loadTokenInfo(tokenId: number): Promise<CSTTokenInfo | null | undefined> {
  try {
    const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
    return (data.TokenInfo ?? null) as CSTTokenInfo | null;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    return undefined;
  }
}

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
  const [t, tCommon] = await Promise.all([getTranslations('detail'), getTranslations('common')]);

  const name = t('jsonLd.productName', { id });
  const description = t('jsonLd.productDescription');
  const tokenInfo = await loadTokenInfo(tokenId);

  if (tokenInfo === null) {
    notFound();
  }

  const imageUrl = tokenImageUrl(tokenInfo?.Seed);

  return (
    <>
      <JsonLd data={nftProductJsonLd({ tokenId, name, description, imageUrl })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCommon('breadcrumbs.home'), path: '/' },
          { name: tCommon('breadcrumbs.gallery'), path: '/gallery' },
          { name: t('jsonLd.breadcrumbToken', { id }), path: `/detail/${id}` },
        ])}
      />
      <DetailPage tokenId={tokenId} />
    </>
  );
}
