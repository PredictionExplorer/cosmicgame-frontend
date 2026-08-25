import type { ReactNode } from 'react';

import { PageMessages } from '@/components/i18n/PageMessages';
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
      {/* The sub-nav renders from this LAYOUT, outside every page's
          <PageMessages> boundary, so it needs its own scoped provider —
          the chrome-only layout catalog has no statistics namespace. */}
      <PageMessages namespaces={['statistics']}>
        <StatisticsSubNav />
      </PageMessages>
      {children}
    </PageShell>
  );
}
