import type { LucideIcon } from 'lucide-react';
import { Activity, Anchor, Coins, LayoutGrid, Trophy, Users } from 'lucide-react';

/**
 * Single source of truth for the statistics section pages: powers the sticky
 * sub-navigation, the hub explore cards, per-page metadata, and tests.
 */
export interface StatisticsSectionDef {
  /** Route segment under /statistics ('' = hub). */
  slug: string;
  href: string;
  /** Message key under statistics.navigation. */
  messageKey: 'overview' | 'participation' | 'tokens' | 'anchoring' | 'activity' | 'performance';
  icon: LucideIcon;
}

export const STATISTICS_HUB: StatisticsSectionDef = {
  slug: '',
  href: '/statistics',
  messageKey: 'overview',
  icon: LayoutGrid,
};

export const STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  {
    slug: 'participation',
    href: '/statistics/participation',
    messageKey: 'participation',
    icon: Users,
  },
  {
    slug: 'tokens',
    href: '/statistics/tokens',
    messageKey: 'tokens',
    icon: Coins,
  },
  {
    slug: 'anchoring',
    href: '/statistics/anchoring',
    messageKey: 'anchoring',
    icon: Anchor,
  },
  {
    slug: 'activity',
    href: '/statistics/activity',
    messageKey: 'activity',
    icon: Activity,
  },
  {
    slug: 'performance',
    href: '/statistics/performance',
    messageKey: 'performance',
    icon: Trophy,
  },
];

export const ALL_STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  STATISTICS_HUB,
  ...STATISTICS_SECTIONS,
];
