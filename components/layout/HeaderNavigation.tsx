'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  APP_HEADER_NAV,
  SITE_ROUTE_GROUPS,
  STATISTICS_SECTION_ROUTE_IDS,
  getSiteRoute,
  outboundLinks,
  resolveRouteHref,
  siteHostLabel,
  type HeaderLinkItem,
  type HeaderPanelEntry,
  type HeaderPanelItem,
  type SiteLocation,
  type SiteRouteId,
} from '@/config/siteNav';
import { SITE_ROUTE_GROUP_ICONS, SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { HostDivider, NavRowContent } from './NavRow';
import { SiteLink } from './SiteLink';
import { useSiteNavCopy } from './useSiteNav';

/** aria-current for a destination: the page itself, or a page inside it. */
export function routeCurrent(location: SiteLocation, id: SiteRouteId): 'page' | 'true' | undefined {
  if (location.route?.id !== id) return undefined;
  return location.exact ? 'page' : 'true';
}

function itemIsCurrent(item: HeaderLinkItem | HeaderPanelItem, location: SiteLocation): boolean {
  return !!location.section && item.sections.includes(location.section);
}

/** The gap kept between an open panel and the viewport's edge. */
const VIEWPORT_MARGIN_PX = 16;

const TRIGGER_CLASS =
  'relative inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-control px-3 text-sm font-medium transition-colors duration-150';

/** The 2px mark on the header's bottom rule under the current section. */
function CurrentMark({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-t-pill bg-primary transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}

const ROW_CLASS =
  'group/row flex w-full items-center gap-3 rounded-control px-2.5 py-2 text-left no-underline transition-colors duration-150 hover:bg-muted focus-visible:bg-muted';

function PanelEntry({
  entry,
  location,
  withDescription = true,
}: {
  entry: HeaderPanelEntry;
  location: SiteLocation;
  withDescription?: boolean;
}) {
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const routeId = entry.kind === 'route' ? entry.id : SITE_ROUTE_GROUPS[entry.id][0]!;
  const target = resolveRouteHref(getSiteRoute(routeId), 'app', locale);
  const current =
    entry.kind === 'route'
      ? routeCurrent(location, entry.id)
      : location.route?.group === entry.id
        ? location.exact && location.route.id === routeId
          ? 'page'
          : 'true'
        : undefined;
  const label = entry.kind === 'route' ? copy.routeLabel(entry.id) : copy.groupLabel(entry.id);
  const description =
    entry.kind === 'route' ? copy.routeDescription(entry.id) : copy.groupDescription(entry.id);
  const icon =
    entry.kind === 'route' ? SITE_ROUTE_ICONS[entry.id] : SITE_ROUTE_GROUP_ICONS[entry.id];

  return (
    <li>
      <SiteLink
        href={target.href}
        kind={target.kind}
        prefetch="intent"
        aria-current={current}
        className={ROW_CLASS}
      >
        <NavRowContent
          icon={icon}
          label={label}
          description={withDescription ? description : undefined}
          current={!!current}
        />
      </SiteLink>
    </li>
  );
}

/** Statistics sections as compact chips under the Statistics row. */
function StatisticsChips({ location }: { location: SiteLocation }) {
  const copy = useSiteNavCopy();
  return (
    <li>
      <ul className="flex flex-wrap gap-1.5 pb-1 pl-[3.375rem] pr-2">
        {STATISTICS_SECTION_ROUTE_IDS.map((id) => {
          const current = routeCurrent(location, id);
          return (
            <li key={id}>
              <SiteLink
                href={getSiteRoute(id).path}
                kind="internal"
                prefetch="intent"
                aria-current={current}
                className={cn(
                  'inline-flex min-h-7 items-center rounded-control border px-2.5 text-xs no-underline transition-colors duration-150 hover:border-input hover:bg-muted hover:text-foreground',
                  current
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-rule-faint text-muted-foreground',
                )}
              >
                {copy.routeShortLabel(id)}
              </SiteLink>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function PanelSearch({ onOpenSearch }: { onOpenSearch: () => void }) {
  const t = useTranslations('nav');
  return (
    <li>
      <button
        type="button"
        onClick={onOpenSearch}
        className="group/row mx-1 mt-2 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-control border border-dashed border-rule px-3 py-2.5 text-left transition-colors duration-150 hover:border-input hover:bg-muted"
      >
        <Search aria-hidden className="size-4 shrink-0 text-subtle" />
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-foreground">{t('search.trigger')}</span>
          <span className="type-caption text-muted-foreground">{t('search.placeholder')}</span>
        </span>
      </button>
    </li>
  );
}

function PanelOutbound({ panel }: { panel: HeaderPanelItem }) {
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const headingId = useId();

  if (panel.id === 'explore') {
    // The heading on its own row and the links on a 2 × 2 grid, so no label
    // is left alone on a second line in any language.
    return (
      <div className="px-1 pt-1">
        <p id={headingId} className="type-eyebrow px-1.5 pb-1 pt-0.5 text-subtle">
          {copy.sectionTitle('ecosystem')}
        </p>
        <ul aria-labelledby={headingId} className="grid grid-cols-2 gap-x-2">
          {outboundLinks('ecosystem').map((link) => (
            <li key={link.id} className="min-w-0">
              <SiteLink
                href={link.href}
                kind="external"
                className="flex min-w-0 items-center gap-1 rounded-control px-1.5 py-1.5 text-sm text-muted-foreground no-underline transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                <span className="truncate">{copy.outboundLabel(link.id)}</span>
              </SiteLink>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const projectSite = resolveRouteHref(getSiteRoute('projectSite'), 'app', locale);
  return (
    <SiteLink href={projectSite.href} kind={projectSite.kind} className={ROW_CLASS}>
      <NavRowContent
        icon={SITE_ROUTE_ICONS.projectSite}
        label={copy.routeLabel('projectSite')}
        description={copy.routeDescription('projectSite')}
        aside={projectSite.hostLabel}
      />
    </SiteLink>
  );
}

/**
 * Splits a column into runs by host, so cross-host rows sit under one small
 * "cosmicsignature.com" heading instead of repeating it on every row.
 */
function entriesByHost(entries: readonly HeaderPanelEntry[]) {
  const runs: { host: 'app' | 'landing'; entries: HeaderPanelEntry[] }[] = [];
  for (const entry of entries) {
    const routeId = entry.kind === 'route' ? entry.id : SITE_ROUTE_GROUPS[entry.id][0]!;
    const host = getSiteRoute(routeId).host;
    const last = runs.at(-1);
    if (last && last.host === host) last.entries.push(entry);
    else runs.push({ host, entries: [entry] });
  }
  return runs;
}

/**
 * Moves focus to the previous or next link of the same column on Up and
 * Down, as an optional shortcut: Tab already walks every link in order.
 */
function onColumnKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button'));
  const index = links.indexOf(document.activeElement as HTMLElement);
  if (index === -1) return;
  event.preventDefault();
  const next = links[index + (event.key === 'ArrowDown' ? 1 : -1)];
  next?.focus();
}

function HeaderPanel({
  panel,
  location,
  open,
  onOpenChange,
  onOpenSearch,
}: {
  panel: HeaderPanelItem;
  location: SiteLocation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch: () => void;
}) {
  const t = useTranslations('nav');
  const copy = useSiteNavCopy();
  const current = itemIsCurrent(panel, location);
  const panelId = useId();
  const secondaryHeadingId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(
    (returnFocus: boolean) => {
      onOpenChange(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [onOpenChange],
  );

  // Opens under its button, pulled left when it would cross the viewport's
  // edge: a layout measurement applied straight to the panel before paint.
  // Measured from the item and the panel's width, which no transform changes,
  // so the shift left from the last opening does not skew it.
  useLayoutEffect(() => {
    const node = panelRef.current;
    const item = itemRef.current;
    if (!open || !node || !item) return;
    const right = item.getBoundingClientRect().left + node.offsetWidth;
    const overflow = right - (window.innerWidth - VIEWPORT_MARGIN_PX);
    node.style.transform = overflow > 0 ? `translateX(${-overflow}px)` : '';
  }, [open]);

  // A press anywhere outside the item closes it.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!itemRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [close, open]);

  const onBlur = (event: FocusEvent<HTMLLIElement>) => {
    // Tabbing past the last link (or back before the button) closes the panel. A
    // press on the panel's own background moves focus nowhere (no related
    // target) and leaves it open; a press outside closes it through pointerdown.
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) close(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation();
      close(true);
    }
  };

  return (
    <li
      ref={itemRef}
      className="relative flex h-full items-center"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={current ? 'true' : undefined}
        onClick={() => onOpenChange(!open)}
        className={cn(
          TRIGGER_CLASS,
          'group',
          open
            ? 'bg-muted text-foreground'
            : current
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
        )}
      >
        {t(`menus.${panel.id}`)}
        <ChevronDown
          aria-hidden
          className={cn(
            'size-3.5 text-subtle transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      <CurrentMark visible={current} />
      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 w-[min(42rem,calc(100vw-2rem))] rounded-surface border border-rule bg-popover p-2 text-popover-foreground shadow-float"
      >
        {/* The links render only while open: the footer and the site map are
            the server-rendered paths to the same pages. */}
        {open ? (
          <>
            <div className="grid gap-x-2 gap-y-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <ul onKeyDown={onColumnKeyDown}>
                {entriesByHost(panel.primary).map((run, runIndex) => (
                  <Fragment key={`${run.host}-${runIndex}`}>
                    {run.host === 'landing' ? (
                      <li className="px-2.5 pb-1 pt-2.5">
                        <HostDivider label={siteHostLabel('landing')} />
                      </li>
                    ) : null}
                    {run.entries.map((entry) => (
                      <Fragment key={`${entry.kind}-${entry.id}`}>
                        <PanelEntry entry={entry} location={location} />
                        {panel.id === 'explore' &&
                        entry.kind === 'route' &&
                        entry.id === 'statistics' ? (
                          <>
                            <StatisticsChips location={location} />
                            <PanelSearch
                              onOpenSearch={() => {
                                close(false);
                                onOpenSearch();
                              }}
                            />
                          </>
                        ) : null}
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </ul>
              <div className="md:border-l md:border-rule-faint md:pl-2">
                <p id={secondaryHeadingId} className="type-eyebrow px-2.5 pb-1.5 pt-2 text-subtle">
                  {copy.sectionTitle(panel.secondary.section)}
                </p>
                <ul aria-labelledby={secondaryHeadingId} onKeyDown={onColumnKeyDown}>
                  {panel.secondary.entries.map((entry) => (
                    <PanelEntry
                      key={`${entry.kind}-${entry.id}`}
                      entry={entry}
                      location={location}
                      withDescription={panel.id === 'learn'}
                    />
                  ))}
                </ul>
              </div>
            </div>
            <hr className="-mx-2 my-2 border-rule-faint" />
            <PanelOutbound panel={panel} />
          </>
        ) : null}
      </div>
    </li>
  );
}

function HeaderLink({ item, location }: { item: HeaderLinkItem; location: SiteLocation }) {
  const copy = useSiteNavCopy();
  const current = itemIsCurrent(item, location);
  const route = getSiteRoute(item.route);
  const ariaCurrent =
    location.route?.id === item.route && location.exact ? 'page' : current ? 'true' : undefined;

  return (
    <li className="relative flex h-full items-center">
      <SiteLink
        href={route.path}
        kind="internal"
        aria-current={ariaCurrent}
        className={cn(
          TRIGGER_CLASS,
          'no-underline',
          current
            ? 'text-foreground'
            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
        )}
      >
        {copy.routeLabel(item.route)}
      </SiteLink>
      <CurrentMark visible={current} />
    </li>
  );
}

interface HeaderNavigationProps {
  location: SiteLocation;
  onOpenSearch: () => void;
  className?: string;
}

/**
 * The desktop navigation (from 1024px): the Observatory and the Gallery as
 * direct links, then the Explore and Learn panels. The item that stands for
 * the current page's section carries `aria-current` and a mark on the
 * header's bottom rule.
 *
 * The panels follow the disclosure pattern for site navigation (WAI-ARIA
 * APG), not the menu pattern: a button with `aria-expanded` shows a panel of
 * ordinary links in labelled lists, so Tab walks them, links keep their
 * semantics (open in a new tab, link lists), Up and Down move within a
 * column, and Escape closes and returns to the button. One panel is open at
 * a time; a press outside, moving focus away or a navigation closes it.
 */
export function HeaderNavigation({ location, onOpenSearch, className }: HeaderNavigationProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  // The open panel belongs to the page it was opened on, so any navigation
  // closes it.
  const [opened, setOpened] = useState<{ id: HeaderPanelItem['id']; pathname: string } | null>(
    null,
  );
  const openPanel = opened?.pathname === pathname ? opened.id : null;

  return (
    <nav aria-label={t('primaryLabel')} className={cn('relative h-full', className)}>
      <ul className="relative flex h-full items-stretch gap-0.5">
        {APP_HEADER_NAV.map((item) =>
          item.kind === 'link' ? (
            <HeaderLink key={item.route} item={item} location={location} />
          ) : (
            <HeaderPanel
              key={item.id}
              panel={item}
              location={location}
              open={openPanel === item.id}
              onOpenChange={(open) => setOpened(open ? { id: item.id, pathname } : null)}
              onOpenSearch={onOpenSearch}
            />
          ),
        )}
      </ul>
    </nav>
  );
}
