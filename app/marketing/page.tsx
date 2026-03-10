import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewards from './MarketingRewards';

export const metadata: Metadata = createMetadata(
  'Marketing Rewards | Cosmic Signature',
  'Earn marketing rewards by promoting our project online.',
);

export default function Page() {
  return <MarketingRewards />;
}
