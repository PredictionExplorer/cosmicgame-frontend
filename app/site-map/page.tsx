import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import SiteMapPage from './SiteMapPage';

export const metadata: Metadata = createMetadata(
  'Site Map | Cosmic Signature',
  'Navigate every section of the Cosmic Signature protocol \u2014 gestures, NFT gallery, anchoring, statistics, allocations, and public-goods contributions.',
  undefined,
  '/site-map',
);

export default function Page() {
  return <SiteMapPage />;
}
