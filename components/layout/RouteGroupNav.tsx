import { useTranslations } from 'next-intl';

import {
  SITE_ROUTE_GROUPS,
  getSiteRoute,
  type SiteRouteGroupId,
  type SiteRouteId,
} from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface RouteGroupNavProps {
  /** The group whose sibling pages to link (config/siteNav.ts → SITE_ROUTE_GROUPS). */
  group: SiteRouteGroupId;
  /** The page this renders on; marked with `aria-current="page"`. */
  current: SiteRouteId;
  className?: string;
}

/**
 * A segmented row of links between the sibling pages of one route group,
 * e.g. the three Public Goods ledgers (protocol, voluntary, retrievals),
 * so the group reads as one place rather than unrelated tables. Plain
 * links, so every sibling stays crawlable; the row scrolls sideways on
 * phones instead of wrapping.
 */
export function RouteGroupNav({ group, current, className }: RouteGroupNavProps) {
  const t = useTranslations('nav');
  return (
    <nav aria-label={t(`groups.${group}.label`)} className={cn('mb-8 max-w-full', className)}>
      <ul className="scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-rule bg-surface-sunken p-1">
        {SITE_ROUTE_GROUPS[group].map((id) => {
          const route = getSiteRoute(id);
          const Icon = SITE_ROUTE_ICONS[id];
          const selected = id === current;
          return (
            <li key={id} className="shrink-0">
              <Link
                href={route.path}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-pill px-4 text-sm font-medium no-underline transition-colors duration-150 sm:min-h-10',
                  selected
                    ? 'bg-surface-raised text-foreground ring-1 ring-inset ring-rule'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon
                  aria-hidden
                  className={cn('size-4', selected ? 'text-primary' : 'text-subtle')}
                />
                {t(`routes.${id}.short`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
