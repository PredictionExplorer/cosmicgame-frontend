import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewardsPage from './MarketingRewardsPage';

export const metadata: Metadata = createMetadata(
  'Marketing Rewards | Cosmic Signature',
  'View marketing reward history and CST token earnings for a Cosmic Signature promoter. Track referral activity and promotional contributions.',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <MarketingRewardsPage address={address} />;
}
