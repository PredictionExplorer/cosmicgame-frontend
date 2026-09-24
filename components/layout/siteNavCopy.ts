import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type {
  OutboundLinkId,
  SiteRouteGroupId,
  SiteRouteId,
  SiteSectionId,
} from '@/config/siteNav';

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

/**
 * The canonical names of every destination, from `nav.*` in the active
 * locale. No `'use client'`: server components (the footer, the 404 page)
 * and client components (the header, the drawer) read the same names.
 */
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
