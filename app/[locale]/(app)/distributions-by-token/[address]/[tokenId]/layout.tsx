import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseTokenDistributionParams } from './params';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; address: string; tokenId: string }>;
}

/**
 * Rejects a segment that is not an address or a canonical token id before
 * the page renders, so it is a 404 and never a page for a made-up token.
 */
export default async function TokenDistributionGuard({ children, params }: LayoutProps) {
  const { address, tokenId } = await params;
  if (parseTokenDistributionParams(address, tokenId) === null) notFound();
  return children;
}
