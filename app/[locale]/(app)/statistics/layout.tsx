import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { PageShell } from '@/components/ui/page-shell';
import { SITE_EDGE_SHELL_CLASS } from '@/components/statistics/shell';

/**
 * Shared shell for the statistics hub and its section pages, on the site's
 * one content edge (`site-container`, the header's and footer's edge). Each
 * page renders its header and, on the header's rule, the sticky section tabs
 * (`StatisticsPageIntro`, `StatisticsSeoSummary`).
 *
 * Horizontal overflow is clipped without creating a scroll container, so the
 * tabs stay sticky within the document.
 */
export default function StatisticsLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell
      variant="data"
      backdrop="signature"
      className={cn(SITE_EDGE_SHELL_CLASS, 'overflow-visible overflow-x-clip')}
    >
      {children}
    </PageShell>
  );
}
