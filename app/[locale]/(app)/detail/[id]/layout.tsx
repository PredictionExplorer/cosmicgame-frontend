import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { permanentRedirect } from '@/i18n/navigation';
import { parseTokenId } from '@/utils/routeParams';

interface TokenLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Gives a Signature one URL before the page renders: `/detail/025` moves to
 * `/detail/25`, and a malformed id is a 404. proxy.ts answers both first
 * (lib/paramRoutes.ts mirrors these tests): the global 404 renders on the
 * server, and a redirect raised in this cached render would carry its
 * Location header twice. A number not imprinted yet is the page's own
 * business: it renders the Signature's not-found state on the server
 * (`SignatureNotFound`).
 */
export default async function TokenLayout({ children, params }: TokenLayoutProps) {
  const { locale, id } = await params;
  const tokenId = parseTokenId(id);
  if (tokenId === null) notFound();
  if (String(tokenId) !== id) permanentRedirect({ href: `/detail/${tokenId}`, locale });
  return children;
}
