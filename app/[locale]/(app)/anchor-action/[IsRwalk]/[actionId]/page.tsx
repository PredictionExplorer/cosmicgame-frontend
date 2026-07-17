import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import AnchorActionDetailPage from './AnchorActionDetailPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ IsRwalk: string; actionId: string }>;
}): Promise<Metadata> {
  const { IsRwalk, actionId } = await params;
  return createMetadata(
    'Anchor Action Detail | Cosmic Signature',
    'Details of a specific anchor action in Cosmic Signature \u2014 token type, anchored amounts, and distribution retrieval status.',
    undefined,
    `/anchor-action/${IsRwalk}/${actionId}`,
    { index: false },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ IsRwalk: string; actionId: string }>;
}) {
  const { IsRwalk, actionId } = await params;
  return <AnchorActionDetailPage IsRwalk={Number(IsRwalk)} actionId={Number(actionId)} />;
}
