import type { ReactNode } from 'react';

import { RouteEntrance } from '@/components/layout/RouteEntrance';

/**
 * Root template of the landing: runs on every route change and fades the new
 * page in, as on the app (components/layout/RouteEntrance).
 */
export default function Template({ children }: { children: ReactNode }) {
  return <RouteEntrance>{children}</RouteEntrance>;
}
