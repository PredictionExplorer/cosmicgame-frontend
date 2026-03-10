import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StakingActionDetailPage from './StakingActionDetailPage';

export const metadata: Metadata = createMetadata(
  'Staking Action Detail | Cosmic Signature',
  'Staking Action Detail',
);

export default async function Page({
  params,
}: {
  params: Promise<{ IsRwalk: string; actionId: string }>;
}) {
  const { IsRwalk, actionId } = await params;
  return <StakingActionDetailPage IsRwalk={Number(IsRwalk)} actionId={Number(actionId)} />;
}
