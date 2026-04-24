import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewardsPage from './MarketingRewardsPage';

export const metadata: Metadata = createMetadata(
  'Outreach Allocations | Cosmic Signature',
  'Outreach allocation history and CST allocations for a Cosmic Signature ecosystem contributor. Review referral activity and contributions.',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <MarketingRewardsPage address={address} />;
}
