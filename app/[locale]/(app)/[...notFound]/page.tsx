import { notFound } from 'next/navigation';

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
