import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewardsPage from './MarketingRewardsPage';

export const metadata: Metadata = createMetadata(
  'Marketing Rewards | Cosmic Signature',
  'Marketing Rewards',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <MarketingRewardsPage address={address} />;
}
