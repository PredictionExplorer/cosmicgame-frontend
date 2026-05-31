import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAssetsUrl, logoImgUrl } from '@/utils';

import { axios, getAPIUrl, isAxiosError } from '@/services/api/client';
import type { CSTTokenInfo } from '@/services/api/types';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';

import DetailPage from './DetailPage';

/** Avoid serving og:image / JSON-LD from an older build or data cache when CDN hosts change per network. */
export const dynamic = 'force-dynamic';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tokenId = parseTokenId(id);

  if (tokenId === null) {
    notFound();
  }

  const title = `Token #${id} | Cosmic Signature Token`;
  const description = `Attributes and ownership history of Cosmic Signature Token #${id} \u2014 a deterministic three-body NFT rendered spectrally on Arbitrum.`;

  const tokenInfo = await loadTokenInfo(tokenId);
  if (tokenInfo === null) {
    notFound();
  }

  return createMetadata(title, description, tokenImageUrl(tokenInfo?.Seed), '/detail/' + id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokenId = parseTokenId(id);

  if (tokenId === null) {
    notFound();
  }

  const name = `Cosmic Signature Token #${id}`;
  const description = `Unique generative NFT from the Cosmic Signature procedural on-chain art protocol, rendered from three-body problem physics.`;
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
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
          { name: `Token #${id}`, path: `/detail/${id}` },
        ])}
      />
      <DetailPage tokenId={tokenId} />
    </>
  );
}
