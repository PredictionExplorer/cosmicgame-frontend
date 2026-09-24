import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { notFoundMetadata } from '@/components/layout/notFoundMetadata';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * "Page not found · Cosmic Signature" in the tab. Page metadata resolves
 * independently of the `notFound()` below, and it is the head the browser
 * keeps once the not-found boundary renders; `not-found.tsx` takes none.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return notFoundMetadata(locale);
}

/**
 * Catch-all for unmatched URLs.
 *
 * With two root layouts (route groups) there is no top-level `not-found.tsx`
 * that Next.js can fall back to for unknown paths, so this lowest-priority
 * catch-all routes them into the (app) group's `not-found.tsx` with a real
 * 404 status. Defined routes — including the (landing) group's pages —
 * always take precedence over a dynamic catch-all segment.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
