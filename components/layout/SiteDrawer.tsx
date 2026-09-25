'use client';

import { Fragment, useEffect, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  FOOTER_SECTIONS,
  outboundLinks,
  resolveRouteHref,
  routesInSection,
  siteHostLabel,
  type SiteLocation,
  type SiteRoute,
  type SiteRouteId,
  type SiteSectionId,
} from '@/config/siteNav';
import { OUTBOUND_ICONS, SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { NavSheet } from './NavSheet';
import { HostDivider, NavRowContent } from './NavRow';
import { SiteLink } from './SiteLink';
import { routeCurrent } from './HeaderNavigation';
import { useSiteNavCopy } from './useSiteNav';

/**
 * Sections listed in the drawer, in order: the footer's own columns (the
 * account section leads them when a wallet is connected).
 */
const DRAWER_SECTIONS: readonly SiteSectionId[] = FOOTER_SECTIONS;

/** Where the header's own navigation takes over (Tailwind `lg`). */
const DESKTOP_QUERY = '(min-width: 1024px)';

/** Open on arrival: where most visits go, plus wherever the visitor already is. */
const OPEN_BY_DEFAULT: readonly SiteSectionId[] = ['participate', 'collection'];

const SUMMARY_CLASS =
  'group/summary flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-control px-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted [&::-webkit-details-marker]:hidden';

const ROW_CLASS =
  'group/row flex min-h-11 items-center gap-3 rounded-control px-2 py-1.5 no-underline transition-colors duration-150 hover:bg-muted';

function DrawerRow({
  route,
  location,
  onNavigate,
  badge,
  nested = false,
}: {
  route: SiteRoute;
  location: SiteLocation;
  onNavigate: () => void;
  badge?: ReactNode;
  nested?: boolean;
}) {
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const target = resolveRouteHref(route, 'app', locale);
  const current = routeCurrent(location, route.id);
  return (
    <li className={cn(nested && 'ml-[1.1875rem] border-l border-rule-faint pl-2')}>
      <SiteLink
        href={target.href}
        kind={target.kind}
        prefetch="intent"
        aria-current={current}
        onClick={onNavigate}
        className={cn(ROW_CLASS, current && 'bg-primary/[0.06]')}
      >
        <NavRowContent
          iconStyle="inline"
          icon={nested ? undefined : SITE_ROUTE_ICONS[route.id]}
          label={copy.routeLabel(route.id)}
          current={!!current}
        />
        {badge}
      </SiteLink>
    </li>
  );
}

function DrawerSection({
  section,
  location,
  onNavigate,
  defaultOpen,
  badges,
}: {
  section: SiteSectionId;
  location: SiteLocation;
  onNavigate: () => void;
  defaultOpen: boolean;
  badges?: Partial<Record<SiteRouteId, ReactNode>>;
}) {
  const copy = useSiteNavCopy();
  const routes = routesInSection(section);

  return (
    <details
      open={defaultOpen}
      className="group/section border-b border-rule-faint py-1 last:border-b-0"
    >
      <summary className={SUMMARY_CLASS}>
        <span>{copy.sectionTitle(section)}</span>
        <ChevronDown
          aria-hidden
          className="size-4 text-subtle transition-transform duration-200 group-open/section:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="pb-2">
        {routes.map((route, index) => {
          const hostChanged = index > 0 && route.host !== routes[index - 1]!.host;
          return (
            <Fragment key={route.id}>
              {hostChanged ? (
                <li>
                  <HostDivider label={siteHostLabel(route.host)} className="px-2 pb-1 pt-2" />
                </li>
              ) : null}
              <DrawerRow
                route={route}
                location={location}
                onNavigate={onNavigate}
                nested={!!route.parent}
                badge={badges?.[route.id]}
              />
            </Fragment>
          );
        })}
      </ul>
    </details>
  );
}

function DrawerEcosystem() {
  const copy = useSiteNavCopy();
  return (
    <details className="group/section py-1">
      <summary className={SUMMARY_CLASS}>
        <span>{copy.sectionTitle('ecosystem')}</span>
        <ChevronDown
          aria-hidden
          className="size-4 text-subtle transition-transform duration-200 group-open/section:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="pb-2">
        {outboundLinks('ecosystem').map((link) => {
          const Icon = OUTBOUND_ICONS[link.id];
          return (
            <li key={link.id}>
              <SiteLink
                href={link.href}
                kind="external"
                className={ROW_CLASS}
                externalIconClassName="ml-auto"
              >
                <NavRowContent iconStyle="inline" icon={Icon} label={copy.outboundLabel(link.id)} />
              </SiteLink>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

interface SiteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: SiteLocation;
  /** The menu button; the drawer wires it up as its trigger. */
  trigger: ReactNode;
  onOpenSearch: () => void;
  /** Show the account section (a wallet is connected). */
  showAccount: boolean;
  /** Per-route badges, e.g. the retrieve signal on My Allocations. */
  badges?: Partial<Record<SiteRouteId, ReactNode>>;
}

/**
 * The navigation drawer below 1024px, in the sheet both hosts share
 * (`NavSheet`: the wordmark row, the preferences at the foot): every section
 * of the taxonomy as a disclosure (the everyday ones open, the rest
 * collapsed unless the visitor is inside them) and a search entry at the
 * top. Choosing a language is an explicit pick in a menu, never a change of
 * page as a select is arrowed through.
 */
export function SiteDrawer({
  open,
  onOpenChange,
  location,
  trigger,
  onOpenSearch,
  showAccount,
  badges,
}: SiteDrawerProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const close = () => onOpenChange(false);

  // Close after any navigation, including browser back and forward.
  // `onOpenChange` is the parent's state setter, so only a route change runs this.
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  // From 1024px the header shows the full navigation; a drawer left open
  // while the window widens closes instead of floating over the page.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const wide = window.matchMedia(DESKTOP_QUERY);
    const close = () => {
      if (wide.matches) onOpenChange(false);
    };
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [onOpenChange]);

  const sections: readonly SiteSectionId[] = showAccount
    ? ['account', ...DRAWER_SECTIONS]
    : DRAWER_SECTIONS;

  return (
    <NavSheet open={open} onOpenChange={onOpenChange} trigger={trigger}>
      <button
        type="button"
        onClick={() => {
          close();
          onOpenSearch();
        }}
        className="mb-2 flex min-h-11 w-full items-center gap-3 rounded-control border border-input bg-surface-sunken px-3 text-left text-sm text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:text-foreground"
      >
        <Search aria-hidden className="size-4 shrink-0 text-subtle" />
        <span className="truncate">{t('search.triggerLabel')}</span>
      </button>

      {sections.map((section) => (
        <DrawerSection
          key={section}
          section={section}
          location={location}
          onNavigate={close}
          defaultOpen={
            section === 'account' ||
            OPEN_BY_DEFAULT.includes(section) ||
            location.section === section
          }
          badges={badges}
        />
      ))}
      <DrawerEcosystem />
    </NavSheet>
  );
}
