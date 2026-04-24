import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import SampleDetailPage from './SampleDetailPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata(
  'Sample Token | Cosmic Signature Token',
  'Discover the unique attributes and ownership history of Cosmic Signature Token, an exclusive digital collectible from the Cosmic Signature protocol.',
  undefined,
  '/detail/sample',
);

export default function Page() {
  return <SampleDetailPage />;
}
