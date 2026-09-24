'use client';

import { useMemo } from 'react';

import { locateSitePath, type SiteHost, type SiteLocation } from '@/config/siteNav';
import { usePathname } from '@/i18n/navigation';
import { publicPathname } from '@/lib/hostRouting';

export { useSiteNavCopy, type SiteNavCopy } from './siteNavCopy';

/** Where the current page sits in the navigation taxonomy. */
export function useSiteLocation(host: SiteHost = 'app'): SiteLocation {
  // The landing home prerenders under its internal route; publicPathname
  // maps it back to '/'.
  const pathname = publicPathname(usePathname());
  return useMemo(() => locateSitePath(pathname, host), [pathname, host]);
}
