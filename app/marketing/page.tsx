import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewards from './MarketingRewards';

export const metadata: Metadata = createMetadata(
  'Outreach Allocations | Cosmic Signature',
  'Contribute to Cosmic Signature outreach and receive CST allocations. See top ecosystem contributors, allocation history, and how to take part.',
  undefined,
  '/marketing',
);

export default function Page() {
  return <MarketingRewards />;
}
