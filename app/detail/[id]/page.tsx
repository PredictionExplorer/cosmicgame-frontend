import type { Metadata } from 'next';
import axios from 'axios';

import { getAssetsUrl, logoImgUrl } from '@/utils';

import { cosmicGameBaseUrl } from '@/services/api';
import { createMetadata } from '@/utils/seo';
import { JsonLd, nftProductJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';

import DetailPage from './DetailPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const title = `Token #${id} | Cosmic Signature Token`;
  const description = `Attributes and ownership history of Cosmic Signature Token #${id} \u2014 a deterministic three-body NFT rendered spectrally on Arbitrum.`;

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
  const description = `Unique generative NFT from the Cosmic Signature procedural on-chain art protocol, rendered from three-body problem physics.`;
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
