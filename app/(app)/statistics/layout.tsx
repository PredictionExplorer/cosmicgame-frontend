import type { ReactNode } from 'react';

import { PageShell } from '@/components/ui/page-shell';

import { StatisticsSubNav } from './StatisticsSubNav';

/**
 * Shared shell for the statistics hub and its section pages.
 *
 * `overflow-visible overflow-x-clip` replaces PageShell's default
 * `overflow-hidden`: horizontal clipping still contains the decorative
 * backdrop glows, but without creating a scroll container, so the sticky
 * sub-navigation actually sticks.
 */
export default function StatisticsLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell variant="data" backdrop="signature" className="overflow-visible overflow-x-clip">
      <StatisticsSubNav />
      {children}
    </PageShell>
  );
}
