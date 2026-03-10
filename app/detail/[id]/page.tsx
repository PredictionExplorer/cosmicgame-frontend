import type { Metadata } from 'next';
import axios from 'axios';

import { getAssetsUrl } from '@/utils';

import { cosmicGameBaseUrl } from '@/services/api';
import { createMetadata } from '@/utils/seo';

import DetailPage from './DetailPage';

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
    return createMetadata(title, description, imageUrl);
  } catch {
    return createMetadata(title, description);
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailPage tokenId={parseInt(id, 10)} />;
}
