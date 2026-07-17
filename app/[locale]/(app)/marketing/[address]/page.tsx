import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MarketingRewardsPage from './MarketingRewardsPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return createMetadata(
    'Outreach Allocations | Cosmic Signature',
    'Outreach allocation history and CST allocations for a Cosmic Signature ecosystem contributor. Review referral activity and contributions.',
    undefined,
    `/marketing/${address}`,
    { index: false },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <MarketingRewardsPage address={address} />;
}
