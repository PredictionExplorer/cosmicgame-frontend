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
 * `/detail/25`. A malformed id is a 404; proxy.ts answers those first, with
 * the server-rendered global 404 (lib/paramRoutes.ts mirrors this test). A
 * number not imprinted yet is the page's own business: it renders the
 * Signature's not-found state on the server (`SignatureNotFound`).
 */
export default async function TokenLayout({ children, params }: TokenLayoutProps) {
  const { locale, id } = await params;
  const tokenId = parseTokenId(id);
  if (tokenId === null) notFound();
  if (String(tokenId) !== id) permanentRedirect({ href: `/detail/${tokenId}`, locale });
  return children;
}
