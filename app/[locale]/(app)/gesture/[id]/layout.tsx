import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseGestureId } from './gestureId';

interface GestureLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Turns a malformed gesture id away before the page's loading boundary
 * streams, as the Signature route does: a `notFound()` inside that boundary
 * arrives after the 200 status is sent, so `/gesture/abc` answered 200 with
 * an "Invalid" page instead of a real 404.
 */
export default async function GestureLayout({ children, params }: GestureLayoutProps) {
  const { id } = await params;
  if (parseGestureId(id) === null) notFound();
  return children;
}
