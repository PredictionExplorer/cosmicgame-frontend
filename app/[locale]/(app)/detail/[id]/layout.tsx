import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseTokenId } from '@/utils/routeParams';

interface TokenLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Turns a malformed token id away before the page's loading boundary
 * streams: a `notFound()` inside that boundary arrives after the 200 status
 * is sent, so `/detail/not-a-token` answered 200 (with a noindex tag) instead
 * of a real 404. The check is synchronous, so the skeleton still shows at
 * once on a click from a wall.
 */
export default async function TokenLayout({ children, params }: TokenLayoutProps) {
  const { id } = await params;
  if (parseTokenId(id) === null) notFound();
  return children;
}
