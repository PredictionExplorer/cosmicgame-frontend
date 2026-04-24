import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StakingActionDetailPage from './StakingActionDetailPage';

export const metadata: Metadata = createMetadata(
  'Anchor Action Detail | Cosmic Signature',
  'Details of a specific anchor action in Cosmic Signature \u2014 token type, anchored amounts, and distribution retrieval status.',
);

export default async function Page({
  params,
}: {
  params: Promise<{ IsRwalk: string; actionId: string }>;
}) {
  const { IsRwalk, actionId } = await params;
  return <StakingActionDetailPage IsRwalk={Number(IsRwalk)} actionId={Number(actionId)} />;
}
