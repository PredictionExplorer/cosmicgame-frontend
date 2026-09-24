import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Rejects an id that can never name a token (`/detail/not-a-token`) before
 * the page's loading boundary starts streaming: a `notFound()` thrown under
 * `loading.tsx` arrives after the 200 status has been sent, which makes a
 * soft 404. The page keeps its own check for a well-formed id that names no
 * token.
 */
export default async function TokenIdGuard({ children, params }: LayoutProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return children;
}
