'use client';

import { Fragment } from 'react';
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
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  'group/row flex w-full cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 text-left no-underline data-[highlighted]:bg-muted focus:bg-muted focus:text-foreground';

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
    <DropdownMenuItem asChild className={ROW_CLASS}>
      <SiteLink href={target.href} kind={target.kind} aria-current={current}>
        <NavRowContent
          icon={icon}
          label={label}
          description={withDescription ? description : undefined}
          current={!!current}
        />
      </SiteLink>
    </DropdownMenuItem>
  );
}

/** Statistics sections as compact chips under the Statistics row. */
function StatisticsChips({ location }: { location: SiteLocation }) {
  const copy = useSiteNavCopy();
  return (
    <div className="flex flex-wrap gap-1.5 pb-1 pl-[3.375rem] pr-2">
      {STATISTICS_SECTION_ROUTE_IDS.map((id) => {
        const current = routeCurrent(location, id);
        return (
          <DropdownMenuItem
            key={id}
            asChild
            className={cn(
              'cursor-pointer rounded-pill border px-2.5 py-1 text-xs leading-4 no-underline transition-colors duration-150 data-[highlighted]:border-input data-[highlighted]:bg-muted data-[highlighted]:text-foreground focus:bg-muted',
              current
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-rule-faint text-muted-foreground',
            )}
          >
            <SiteLink href={getSiteRoute(id).path} kind="internal" aria-current={current}>
              {copy.routeShortLabel(id)}
            </SiteLink>
          </DropdownMenuItem>
        );
      })}
    </div>
  );
}

function PanelColumnHeading({ children }: { children: string }) {
  return (
    <DropdownMenuLabel className="type-eyebrow px-2.5 pb-1.5 pt-2 font-medium text-subtle">
      {children}
    </DropdownMenuLabel>
  );
}

function ExplorePanelExtras({
  location,
  onOpenSearch,
}: {
  location: SiteLocation;
  onOpenSearch: () => void;
}) {
  const t = useTranslations('nav');
  return (
    <>
      <StatisticsChips location={location} />
      <DropdownMenuItem
        onSelect={onOpenSearch}
        className="group/row mx-1 mt-2 flex cursor-pointer items-center gap-3 rounded-control border border-dashed border-rule px-3 py-2.5 data-[highlighted]:border-input data-[highlighted]:bg-muted focus:bg-muted"
      >
        <Search aria-hidden className="size-4 shrink-0 text-subtle" />
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-foreground">{t('search.trigger')}</span>
          <span className="type-caption text-muted-foreground">{t('search.placeholder')}</span>
        </span>
      </DropdownMenuItem>
    </>
  );
}

function PanelOutbound({ panel }: { panel: HeaderPanelItem }) {
  const locale = useLocale();
  const copy = useSiteNavCopy();

  if (panel.id === 'explore') {
    // The eyebrow on its own row and the links on a 2 × 2 grid, so no label
    // is left alone on a second line in any language.
    return (
      <DropdownMenuGroup className="px-1 pt-1">
        <DropdownMenuLabel className="type-eyebrow px-1.5 pb-1 pt-0.5 font-medium text-subtle">
          {copy.sectionTitle('ecosystem')}
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-x-2">
          {outboundLinks('ecosystem').map((link) => (
            <DropdownMenuItem
              key={link.id}
              asChild
              className="flex min-w-0 cursor-pointer items-center gap-1 rounded-control px-1.5 py-1.5 text-sm text-muted-foreground no-underline data-[highlighted]:bg-muted data-[highlighted]:text-foreground focus:bg-muted"
            >
              <SiteLink href={link.href} kind="external">
                <span className="truncate">{copy.outboundLabel(link.id)}</span>
              </SiteLink>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuGroup>
    );
  }

  const projectSite = resolveRouteHref(getSiteRoute('projectSite'), 'app', locale);
  return (
    <DropdownMenuItem asChild className={ROW_CLASS}>
      <SiteLink href={projectSite.href} kind={projectSite.kind}>
        <NavRowContent
          icon={SITE_ROUTE_ICONS.projectSite}
          label={copy.routeLabel('projectSite')}
          description={copy.routeDescription('projectSite')}
          aside={projectSite.hostLabel}
        />
      </SiteLink>
    </DropdownMenuItem>
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

function HeaderPanel({
  panel,
  location,
  onOpenSearch,
}: {
  panel: HeaderPanelItem;
  location: SiteLocation;
  onOpenSearch: () => void;
}) {
  const t = useTranslations('nav');
  const copy = useSiteNavCopy();
  const current = itemIsCurrent(panel, location);

  return (
    <li className="relative flex h-full items-center">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-current={current ? 'true' : undefined}
          className={cn(
            TRIGGER_CLASS,
            'group data-[state=open]:bg-muted data-[state=open]:text-foreground',
            current
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
          )}
        >
          {t(`menus.${panel.id}`)}
          <ChevronDown
            aria-hidden
            className="size-3.5 text-subtle transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={14}
          collisionPadding={16}
          className="w-[min(42rem,calc(100vw-2rem))] rounded-surface border-rule bg-popover p-2 shadow-float"
        >
          <div className="grid gap-x-2 gap-y-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <DropdownMenuGroup>
              {entriesByHost(panel.primary).map((run, runIndex) => (
                <Fragment key={`${run.host}-${runIndex}`}>
                  {run.host === 'landing' ? (
                    <DropdownMenuLabel className="px-2.5 pb-1 pt-2.5 font-normal">
                      <HostDivider label={siteHostLabel('landing')} />
                    </DropdownMenuLabel>
                  ) : null}
                  {run.entries.map((entry) => (
                    <Fragment key={`${entry.kind}-${entry.id}`}>
                      <PanelEntry entry={entry} location={location} />
                      {panel.id === 'explore' &&
                      entry.kind === 'route' &&
                      entry.id === 'statistics' ? (
                        <ExplorePanelExtras location={location} onOpenSearch={onOpenSearch} />
                      ) : null}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuGroup className="md:border-l md:border-rule-faint md:pl-2">
              <PanelColumnHeading>{copy.sectionTitle(panel.secondary.section)}</PanelColumnHeading>
              {panel.secondary.entries.map((entry) => (
                <PanelEntry
                  key={`${entry.kind}-${entry.id}`}
                  entry={entry}
                  location={location}
                  withDescription={panel.id === 'learn'}
                />
              ))}
            </DropdownMenuGroup>
          </div>
          <DropdownMenuSeparator className="-mx-2 my-2 bg-rule-faint" />
          <PanelOutbound panel={panel} />
        </DropdownMenuContent>
      </DropdownMenu>
      <CurrentMark visible={current} />
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
  /** The experimental route's liquid-glass material. */
  liquid?: boolean;
}

/**
 * The desktop navigation (from 1024px): the Observatory and the Gallery as
 * direct links, then the Explore and Learn panels. The item that stands for
 * the current page's section carries `aria-current` and a mark on the
 * header's bottom rule.
 */
export function HeaderNavigation({
  location,
  onOpenSearch,
  className,
  liquid,
}: HeaderNavigationProps) {
  const t = useTranslations('nav');
  return (
    <nav aria-label={t('primaryLabel')} className={cn('relative h-full', className)}>
      {/* The experimental route's glass pill is drawn behind the items, centred
          on the header, so the items keep the header's full height and the
          current mark still sits on the header's bottom rule. */}
      {liquid ? (
        <span
          aria-hidden
          data-testid="header-nav-pill"
          className="liquid-glass-control liquid-glass-static pointer-events-none absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 rounded-pill"
        />
      ) : null}
      <ul className={cn('relative flex h-full items-stretch gap-0.5', liquid && 'px-1.5')}>
        {APP_HEADER_NAV.map((item) =>
          item.kind === 'link' ? (
            <HeaderLink key={item.route} item={item} location={location} />
          ) : (
            <HeaderPanel
              key={item.id}
              panel={item}
              location={location}
              onOpenSearch={onOpenSearch}
            />
          ),
        )}
      </ul>
    </nav>
  );
}
