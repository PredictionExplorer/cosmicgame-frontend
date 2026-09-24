import { useTranslations } from 'next-intl';

import {
  SITE_ROUTE_GROUPS,
  getSiteRoute,
  type SiteRouteGroupId,
  type SiteRouteId,
} from '@/config/siteNav';
import { PageHeaderTabs } from '@/components/layout/PageHeader';

interface RouteGroupNavProps {
  /** The group whose sibling pages to link (config/siteNav.ts → SITE_ROUTE_GROUPS). */
  group: SiteRouteGroupId;
  /** The page this renders on; marked with `aria-current="page"`. */
  current: SiteRouteId;
}

/**
 * The sibling pages of one site-nav route group, e.g. the three Public Goods
 * ledgers (protocol, voluntary, retrievals), as underline tabs for
 * `PageHeader`'s `tabs` slot: the group reads as one place, named as the
 * header menus name it. Plain links, so every sibling stays crawlable.
 * Server-safe.
 */
export function RouteGroupNav({ group, current }: RouteGroupNavProps) {
  const t = useTranslations('nav');
  return (
    <PageHeaderTabs
      label={t(`groups.${group}.label`)}
      items={SITE_ROUTE_GROUPS[group].map((id) => ({
        href: getSiteRoute(id).path,
        label: t(`routes.${id}.short`),
        current: id === current,
      }))}
    />
  );
}
