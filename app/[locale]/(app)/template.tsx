import type { ReactNode } from 'react';

import { RouteEntrance } from '@/components/layout/RouteEntrance';

/**
 * Root template: runs on every route change and fades the new page in
 * (components/layout/RouteEntrance). It sits between the layout (persistent)
 * and the page (per route), so the entrance never re-mounts the providers.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <RouteEntrance>{children}</RouteEntrance>;
}
