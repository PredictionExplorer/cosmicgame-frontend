import type { ReactNode } from 'react';

import {
  PageHeader,
  type PageHeaderFigure,
  type PageHeaderLink,
} from '@/components/layout/PageHeader';

import { StatisticsSubNav } from './StatisticsSubNav';

/**
 * The page header's own bottom rule and margin give way to the sub-navigation,
 * whose tab row is the header's rule on these pages.
 */
export const STATISTICS_HEADER_CLASS = 'mb-0 border-b-0 pb-6 sm:mb-0 sm:pb-8';

export interface StatisticsPageIntroProps {
  title: string;
  description: string;
  /** The page's headline figures, once each (`PageHeaderFigure`). */
  figures?: readonly PageHeaderFigure[];
  /** The meta line: a `LiveStatus` for polled figures. */
  meta?: ReactNode;
  related?: readonly PageHeaderLink[];
  relatedLabel?: string;
}

/**
 * Server-rendered header for the statistics section pages: the shared
 * `PageHeader` with the Explore eyebrow linked to the hub, then the sticky
 * section tabs on its bottom rule, so the H1, intro, figures and navigation
 * are all in the initial HTML while the panels hydrate.
 */
export function StatisticsPageIntro({
  title,
  description,
  figures,
  meta,
  related,
  relatedLabel,
}: StatisticsPageIntroProps) {
  return (
    <>
      <PageHeader
        section="explore"
        title={title}
        subtitle={description}
        figures={figures}
        meta={meta}
        related={related}
        relatedLabel={relatedLabel}
        className={STATISTICS_HEADER_CLASS}
      />
      <StatisticsSubNav />
    </>
  );
}
