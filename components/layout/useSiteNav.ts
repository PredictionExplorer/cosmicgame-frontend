'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  locateSitePath,
  type OutboundLinkId,
  type SiteHost,
  type SiteLocation,
  type SiteRouteGroupId,
  type SiteRouteId,
  type SiteSectionId,
} from '@/config/siteNav';
import { usePathname } from '@/i18n/navigation';
import { publicPathname } from '@/lib/hostRouting';

/** Where the current page sits in the navigation taxonomy. */
export function useSiteLocation(host: SiteHost = 'app'): SiteLocation {
  // The landing home prerenders under its internal route; publicPathname
  // maps it back to '/'.
  const pathname = publicPathname(usePathname());
  return useMemo(() => locateSitePath(pathname, host), [pathname, host]);
}

export interface SiteNavCopy {
  routeLabel: (id: SiteRouteId) => string;
  routeDescription: (id: SiteRouteId) => string;
  /** The compact label of a Statistics section ("Participation"). */
  routeShortLabel: (id: SiteRouteId) => string;
  sectionTitle: (id: SiteSectionId | 'ecosystem' | 'community') => string;
  groupLabel: (id: SiteRouteGroupId) => string;
  groupDescription: (id: SiteRouteGroupId) => string;
  outboundLabel: (id: OutboundLinkId) => string;
  outboundDescription: (id: OutboundLinkId) => string;
}

/** The canonical names of every destination, from `nav.*` in the active locale. */
export function useSiteNavCopy(): SiteNavCopy {
  const t = useTranslations('nav');
  return useMemo(
    () => ({
      routeLabel: (id) => t(`routes.${id}.label`),
      routeDescription: (id) => t(`routes.${id}.description`),
      routeShortLabel: (id) => t(`routes.${id}.short`),
      sectionTitle: (id) => t(`sections.${id}`),
      groupLabel: (id) => t(`groups.${id}.label`),
      groupDescription: (id) => t(`groups.${id}.description`),
      outboundLabel: (id) => t(`outbound.${id}.label`),
      outboundDescription: (id) => t(`outbound.${id}.description`),
    }),
    [t],
  );
}
