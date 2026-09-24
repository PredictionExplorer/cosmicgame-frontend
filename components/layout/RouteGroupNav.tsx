import { useTranslations } from 'next-intl';

import {
  SITE_ROUTE_GROUPS,
  getSiteRoute,
  type SiteRouteGroupId,
  type SiteRouteId,
} from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { LedgerSwitcher } from '@/components/ledger/LedgerSwitcher';

interface RouteGroupNavProps {
  /** The group whose sibling pages to link (config/siteNav.ts → SITE_ROUTE_GROUPS). */
  group: SiteRouteGroupId;
  /** The page this renders on; marked with `aria-current="page"`. */
  current: SiteRouteId;
  className?: string;
}

/**
 * The sibling pages of one site-nav route group, e.g. the three Public Goods
 * ledgers (protocol, voluntary, retrievals), as a `LedgerSwitcher`: names and
 * glyphs come from the navigation taxonomy, so the row always matches the
 * header menus. Address-scoped siblings (an address's CST and NFT transfers)
 * render `LedgerSwitcher` directly.
 */
export function RouteGroupNav({ group, current, className }: RouteGroupNavProps) {
  const t = useTranslations('nav');
  return (
    <LedgerSwitcher
      label={t(`groups.${group}.label`)}
      className={className}
      items={SITE_ROUTE_GROUPS[group].map((id) => ({
        href: getSiteRoute(id).path,
        label: t(`routes.${id}.short`),
        icon: SITE_ROUTE_ICONS[id],
        current: id === current,
      }))}
    />
  );
}
