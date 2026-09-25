import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { readContribution } from './contributionRecord';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Answers a contribution record the API says does not exist with a real
 * 404, before the page's loading boundary starts streaming: a `notFound()`
 * thrown under `loading.tsx` arrives after the 200 status has been sent. The
 * read is the page's own (React `cache`), so it costs no second request; a
 * failed read is left to the page, never guessed missing.
 */
export default async function ContributionRecordGuard({ children, params }: LayoutProps) {
  const { id } = await params;
  const read = await readContribution(Number(id));
  if (read.status === 'missing') notFound();
  return children;
}
