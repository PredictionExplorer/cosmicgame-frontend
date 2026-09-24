/**
 * Single source of truth for the statistics section pages: powers the sticky
 * sub-navigation, the hub's section index, per-page metadata, and tests.
 */
export interface StatisticsSectionDef {
  /** Route segment under /statistics ('' = hub). */
  slug: string;
  href: string;
  /** Message key under statistics.navigation. */
  messageKey: 'overview' | 'participation' | 'tokens' | 'anchoring' | 'activity' | 'performance';
}

export const STATISTICS_HUB: StatisticsSectionDef = {
  slug: '',
  href: '/statistics',
  messageKey: 'overview',
};

export const STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  { slug: 'participation', href: '/statistics/participation', messageKey: 'participation' },
  { slug: 'tokens', href: '/statistics/tokens', messageKey: 'tokens' },
  { slug: 'anchoring', href: '/statistics/anchoring', messageKey: 'anchoring' },
  { slug: 'activity', href: '/statistics/activity', messageKey: 'activity' },
  { slug: 'performance', href: '/statistics/performance', messageKey: 'performance' },
];

export const ALL_STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  STATISTICS_HUB,
  ...STATISTICS_SECTIONS,
];

/** Whether `pathname` (locale-free) is the section's page or one of its sub-pages. */
export function isCurrentSection(section: StatisticsSectionDef, pathname: string): boolean {
  if (section.href === STATISTICS_HUB.href) return pathname === STATISTICS_HUB.href;
  return pathname === section.href || pathname.startsWith(`${section.href}/`);
}
