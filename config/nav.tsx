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

import type { AppLocale } from '@/i18n/routing';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

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

export type NavTranslator = (key: string) => string;

const getNAVs = (
  status: ClaimStatus | null,
  account: string | null,
  t: NavTranslator,
  locale: AppLocale,
) => {
  const NAVS: NavDescriptor[] = [
    {
      title: t('links.gallery.label'),
      route: '/gallery',
      description: t('links.gallery.description'),
      icon: Images,
    },
    {
      title: t('links.explore.label'),
      route: '#',
      children: [
        {
          title: t('links.currentCycle.label'),
          route: '/current-cycle',
          description: t('links.currentCycle.description'),
          icon: Orbit,
        },
        {
          title: t('links.allocationRecipients.label'),
          route: '/allocation',
          description: t('links.allocationRecipients.description'),
          icon: Users,
        },
        {
          title: t('links.anchorDistributions.label'),
          route: '/anchoring',
          description: t('links.anchorDistributions.description'),
          icon: Anchor,
        },
        {
          title: t('links.outreachReserve.label'),
          route: '/marketing',
          description: t('links.outreachReserve.description'),
          icon: Megaphone,
        },
        {
          title: t('links.statistics.label'),
          route: '/statistics',
          description: t('links.statistics.description'),
          icon: ChartColumn,
        },
        {
          title: t('links.contracts.label'),
          route: '/contracts',
          description: t('links.contracts.description'),
          icon: FileCode2,
        },
      ],
    },
    {
      title: t('links.help.label'),
      route: '#',
      children: [
        {
          title: t('links.howItWorks.label'),
          route: '/how-it-works',
          description: t('links.howItWorks.description'),
          icon: Compass,
        },
        {
          title: t('links.faq.label'),
          route: '/faq',
          description: t('links.faq.description'),
          icon: CircleHelp,
        },
        {
          title: t('links.about.label'),
          route: localeHref(LANDING_ORIGIN, '/about', locale),
          description: t('links.about.description'),
          icon: ScrollText,
          external: true,
        },
        {
          title: t('links.learn.label'),
          route: localeHref(LANDING_ORIGIN, '/learn', locale),
          description: t('links.learn.description'),
          icon: GraduationCap,
          external: true,
        },
        {
          title: t('links.discover.label'),
          route: localeHref(LANDING_ORIGIN, '/', locale),
          description: t('links.discover.description'),
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
          {t('links.myAllocations')}
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      ),
      route: '/my-allocations',
    });
  }
  return NAVS;
};

export default getNAVs;
