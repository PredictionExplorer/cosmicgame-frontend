import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseCanonicalNonNegativeSafeInteger } from '@/utils';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Rejects a cycle id that is not canonical (`-1`, `01`, `1.5`) before the
 * page renders, so it is never a soft 404 with an indexable self-canonical.
 * proxy.ts answers the same ids first, with the server-rendered global 404
 * (lib/paramRoutes.ts mirrors this test).
 */
export default async function CycleIdGuard({ children, params }: LayoutProps) {
  const { id } = await params;
  if (parseCanonicalNonNegativeSafeInteger(id) === null) notFound();
  return children;
}
