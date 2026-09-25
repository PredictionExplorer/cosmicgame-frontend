import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseAnchorActionParams } from '@/utils/routeParams';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; IsRwalk: string; actionId: string }>;
}

/**
 * Rejects a collection flag or action id that is not canonical before the
 * page renders, so it is a 404 and never a record page for a made-up id.
 */
export default async function AnchorActionGuard({ children, params }: LayoutProps) {
  const { IsRwalk, actionId } = await params;
  if (parseAnchorActionParams(IsRwalk, actionId) === null) notFound();
  return children;
}
