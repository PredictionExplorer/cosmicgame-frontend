import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseAnchorActionParams } from './params';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; IsRwalk: string; actionId: string }>;
}

/**
 * Rejects a collection flag or action id that is not canonical before the
 * page's loading boundary starts streaming: a `notFound()` thrown under
 * `loading.tsx` arrives after the 200 status, a soft 404.
 */
export default async function AnchorActionGuard({ children, params }: LayoutProps) {
  const { IsRwalk, actionId } = await params;
  if (parseAnchorActionParams(IsRwalk, actionId) === null) notFound();
  return children;
}
