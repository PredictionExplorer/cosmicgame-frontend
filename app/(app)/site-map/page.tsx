import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import SiteMapPage from './SiteMapPage';

export const metadata: Metadata = createMetadata(
  'Site Map | Cosmic Signature',
  'Navigate every section of the Cosmic Signature game — from bidding and NFT gallery to staking, statistics, prizes, and charity contributions.',
  undefined,
  '/site-map',
);

export default function Page() {
  return <SiteMapPage />;
}
