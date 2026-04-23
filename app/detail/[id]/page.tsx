import type { Metadata } from 'next';
import axios from 'axios';

import { getAssetsUrl, logoImgUrl } from '@/utils';

import { cosmicGameBaseUrl } from '@/services/api';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';

import DetailPage from './DetailPage';

/** Avoid serving og:image / JSON-LD from an older build or data cache when CDN hosts change per network. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const title = `Token #${id} | Cosmic Signature Token`;
  const description = `Discover the unique attributes and ownership history of Cosmic Signature Token #${id}, an exclusive digital collectible from the Cosmic Signature game.`;

  try {
    const { data } = await axios.get(`${cosmicGameBaseUrl}cst/info/${id}`);
    const fileName = `0x${data.TokenInfo.Seed}`;
    const imageUrl = getAssetsUrl(`cosmicsignature/${fileName}.png`);
    return createMetadata(title, description, imageUrl, '/detail/' + id);
  } catch {
    return createMetadata(title, description, undefined, '/detail/' + id);
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokenId = parseInt(id, 10);

  const name = `Cosmic Signature Token #${id}`;
  const description = `Unique generative NFT from the Cosmic Signature bidding game, featuring artwork based on three-body problem physics.`;
  let imageUrl = logoImgUrl;

  try {
    const { data } = await axios.get(`${cosmicGameBaseUrl}cst/info/${id}`);
    const fileName = `0x${data.TokenInfo.Seed}`;
    imageUrl = getAssetsUrl(`cosmicsignature/${fileName}.png`);
  } catch {
    // fallback to logo
  }

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
