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
  /** Short label used in the sub-navigation and explore cards. */
  label: string;
  /** Page heading (h1) for the section page. */
  title: string;
  /** Intro sentence rendered server-side and reused as the meta description. */
  description: string;
  icon: LucideIcon;
}

export const STATISTICS_HUB: StatisticsSectionDef = {
  slug: '',
  href: '/statistics',
  label: 'Overview',
  title: 'Cosmic Signature Protocol Statistics',
  description:
    'Historical data and overall metrics for the Cosmic Signature protocol on Arbitrum, with detailed sections for participation, tokens, anchoring, activity, and performance.',
  icon: LayoutGrid,
};

export const STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  {
    slug: 'participation',
    href: '/statistics/participation',
    label: 'Participation',
    title: 'Participation Statistics',
    description:
      'Unique participants, allocation recipients, and ETH contributors indexed across all Cosmic Signature Performance Cycles.',
    icon: Users,
  },
  {
    slug: 'tokens',
    href: '/statistics/tokens',
    label: 'Tokens',
    title: 'Token Distribution Statistics',
    description:
      'Cosmic Signature NFT ownership, CST (ERC-20) balance distribution, total supply history, and assets attached to gestures.',
    icon: Coins,
  },
  {
    slug: 'anchoring',
    href: '/statistics/anchoring',
    label: 'Anchoring',
    title: 'Anchoring Statistics',
    description:
      'Anchor and release actions, currently anchored tokens, and unique anchor-holders for Cosmic Signature and RandomWalk NFTs.',
    icon: Anchor,
  },
  {
    slug: 'activity',
    href: '/statistics/activity',
    label: 'Activity',
    title: 'Gesture Activity Statistics',
    description:
      'Gesture frequency over time, activity spikes, participant active periods, gesture-type mix, cycle timelines, and cycle activations.',
    icon: Activity,
  },
  {
    slug: 'performance',
    href: '/statistics/performance',
    label: 'Performance',
    title: 'Participant Performance Statistics',
    description:
      'Participant performance leaderboard and claimable allocation outcomes for every Cosmic Signature Performance Cycle.',
    icon: Trophy,
  },
];

export const ALL_STATISTICS_SECTIONS: StatisticsSectionDef[] = [
  STATISTICS_HUB,
  ...STATISTICS_SECTIONS,
];
