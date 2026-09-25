import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { parseGestureId } from '@/utils/routeParams';

interface GestureLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Turns a malformed gesture id away before the page renders, as the
 * Signature route does: `/gesture/abc` once answered 200 with an "Invalid"
 * page instead of a real 404. proxy.ts answers the same ids first, with the
 * server-rendered global 404 (lib/paramRoutes.ts mirrors this test).
 */
export default async function GestureLayout({ children, params }: GestureLayoutProps) {
  const { id } = await params;
  if (parseGestureId(id) === null) notFound();
  return children;
}
