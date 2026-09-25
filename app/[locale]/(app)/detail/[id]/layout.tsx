import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { permanentRedirect } from '@/i18n/navigation';

import { loadTokenInfo } from './tokenInfo';
import { parseTokenId } from './tokenId';

interface TokenLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Decides whether the page exists before its loading boundary streams: a
 * `notFound()` inside that boundary arrives after the 200 status is sent, so
 * a malformed id or a token not imprinted yet would answer 200 with a
 * made-up record. Here each gets a real 404 (the Signature not-found state
 * in `detail/not-found.tsx`), and `/detail/025` moves to `/detail/25`, the
 * one URL a Signature has. The record read is the page's own (cached per
 * request and in the data cache), so the page does not read it again.
 */
export default async function TokenLayout({ children, params }: TokenLayoutProps) {
  const { locale, id } = await params;
  const tokenId = parseTokenId(id);
  if (tokenId === null) notFound();
  if (String(tokenId) !== id) permanentRedirect({ href: `/detail/${tokenId}`, locale });
  if ((await loadTokenInfo(tokenId)) === null) notFound();
  return children;
}
