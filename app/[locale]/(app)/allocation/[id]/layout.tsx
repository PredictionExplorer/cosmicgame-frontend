import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseCanonicalNonNegativeSafeInteger } from '@/utils';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Rejects a cycle id that is not canonical (`-1`, `01`, `1.5`) before the
 * page's loading boundary starts streaming: a `notFound()` thrown under
 * `loading.tsx` arrives after the 200 status has been sent, which makes a
 * soft 404 with an indexable self-canonical.
 */
export default async function CycleIdGuard({ children, params }: LayoutProps) {
  const { id } = await params;
  if (parseCanonicalNonNegativeSafeInteger(id) === null) notFound();
  return children;
}
