import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewards from './MarketingRewards';

export const metadata: Metadata = createMetadata(
  'Marketing Rewards | Cosmic Signature',
  'Promote Cosmic Signature and earn CST token rewards. View top marketers, reward history, and learn how to join the program.',
);

export default function Page() {
  return <MarketingRewards />;
}
