import type { ReactNode } from 'react';
import {
  Anchor,
  ChartColumn,
  CircleHelp,
  Compass,
  FileCode2,
  GraduationCap,
  Images,
  Megaphone,
  Orbit,
  ScrollText,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavDescriptor {
  title: string | ReactNode;
  route?: string;
  /** One-line supporting copy shown in rich dropdown panels and drawers. */
  description?: string;
  /** Icon component rendered next to the title in panels and drawers. */
  icon?: LucideIcon;
  /** Marks cross-host links so consumers can add an external affordance. */
  external?: boolean;
  /** Featured items render as a highlighted card at the bottom of a panel. */
  featured?: boolean;
  children?: NavDescriptor[];
}

interface ClaimStatus {
  ETHRaffleToClaim?: number;
  NumDonatedNFTToClaim?: number;
  UnretrievedAnchorDistribution?: number;
}

const getNAVs = (status: ClaimStatus | null, account: string | null) => {
  const NAVS: NavDescriptor[] = [
    {
      title: 'Gallery',
      route: '/gallery',
      description: 'Every Signature imprinted so far',
      icon: Images,
    },
    {
      title: 'Explore',
      route: '#',
      children: [
        {
          title: 'Current Cycle',
          route: '/current-cycle',
          description: 'Live gestures shaping the active cycle',
          icon: Orbit,
        },
        {
          title: 'Allocation Recipients',
          route: '/allocation',
          description: 'Where each cycle\u2019s reserves went',
          icon: Users,
        },
        {
          title: 'Anchor Distributions',
          route: '/anchoring',
          description: 'Anchored NFTs and their distributions',
          icon: Anchor,
        },
        {
          title: 'Outreach Reserve',
          route: '/marketing',
          description: 'Community outreach activity',
          icon: Megaphone,
        },
        {
          title: 'Statistics',
          route: '/statistics',
          description: 'Protocol-wide metrics and records',
          icon: ChartColumn,
        },
        {
          title: 'Contracts',
          route: '/contracts',
          description: 'Verified addresses and source code',
          icon: FileCode2,
        },
      ],
    },
    {
      title: 'Help',
      route: '#',
      children: [
        {
          title: 'How It Works',
          route: '/how-it-works',
          description: 'The cycle mechanics, step by step',
          icon: Compass,
        },
        {
          title: 'FAQ',
          route: '/faq',
          description: 'Answers to common questions',
          icon: CircleHelp,
        },
        {
          title: 'About Cosmic Signature',
          route: 'https://cosmicsignature.com/about',
          description: 'The story behind the protocol',
          icon: ScrollText,
          external: true,
        },
        {
          title: 'Learn Hub',
          route: 'https://cosmicsignature.com/learn',
          description: 'Guides and deep dives',
          icon: GraduationCap,
          external: true,
        },
        {
          title: 'Discover Cosmic Signature',
          route: 'https://cosmicsignature.com',
          description: 'The art, the story, and the protocol',
          icon: Sparkles,
          external: true,
          featured: true,
        },
      ],
    },
  ];
  if (
    account &&
    ((status?.ETHRaffleToClaim ?? 0) > 0 ||
      (status?.NumDonatedNFTToClaim ?? 0) > 0 ||
      (status?.UnretrievedAnchorDistribution ?? 0) > 0)
  ) {
    NAVS.push({
      title: (
        <span className="relative inline-flex items-center gap-1.5">
          My Allocations
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      ),
      route: '/my-allocations',
    });
  }
  return NAVS;
};

export default getNAVs;
