import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import SiteMapPage from './SiteMapPage';

export const metadata: Metadata = createMetadata('Site Map | Cosmic Signature', 'Site Map');

export default function Page() {
  return <SiteMapPage />;
}
