import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  FOOTER_SECTIONS,
  LEGAL_ROUTE_IDS,
  SITE_ROUTE_GROUPS,
  footerRoutes,
  getSiteRoute,
  outboundLinks,
  resolveRouteHref,
  type OutboundGroupId,
  type SiteHost,
  type SiteRoute,
} from '@/config/siteNav';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { LanguageDirectory } from './LanguageDirectory';
import { PhoneFold } from './PhoneFold';
import { SiteLink } from './SiteLink';
import { useSiteNavCopy } from './siteNavCopy';
import { Wordmark } from './Wordmark';

const LINK_CLASS =
  'link-quiet inline-flex min-h-10 max-w-full items-center gap-1 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground sm:min-h-8';

/**
 * Spread on the site map's page element. The site map IS the footer's
 * directory, so on that page the footer leaves the directory and the
 * ecosystem and community rows out rather than repeat them. The footer
 * renders on the server in the root layout, where the page is unknown, so a
 * stylesheet rule reads the marker: the links stay in the HTML and CSS
 * removes them from view and from the accessibility tree.
 */
export const SITE_MAP_MARKER_PROPS = { 'data-site-map': '' } as const;

/** Hidden on the site map (see `SITE_MAP_MARKER_PROPS`). */
const HIDDEN_ON_SITE_MAP = '[:root:has([data-site-map])_&]:hidden';

/** A group's heading: a 44px row on phones, the touch target the fold toggle over it needs. */
const GROUP_HEADING_CLASS = 'type-eyebrow flex min-h-11 items-center text-subtle sm:min-h-0';
const FOLD_HEADING_CLASS = cn(GROUP_HEADING_CLASS, 'pr-10 sm:pr-0');
const FOLD_TOGGLE_CLASS = 'h-11';

/**
 * A route as a footer link; sibling groups collapse to one row. The landing
 * footer leaves out nested destinations (the Statistics sections): it points
 * visitors into the app, and the full directory is the site map's job. It
 * also leaves out "Project Site", which is the landing home itself: the
 * wordmark above already leads there.
 */
export function footerEntries(section: (typeof FOOTER_SECTIONS)[number], host: SiteHost) {
  const seen = new Set<string>();
  const entries: { key: string; route: SiteRoute; group?: keyof typeof SITE_ROUTE_GROUPS }[] = [];
  for (const route of footerRoutes(section)) {
    if (host === 'landing' && (route.parent || route.id === 'projectSite')) continue;
    if (route.group) {
      if (seen.has(route.group)) continue;
      seen.add(route.group);
      entries.push({
        key: route.group,
        route: getSiteRoute(SITE_ROUTE_GROUPS[route.group][0]!),
        group: route.group,
      });
    } else {
      entries.push({ key: route.id, route });
    }
  }
  return entries;
}

/**
 * The ecosystem or community links: a fold on phones, and from 640px a row
 * with its heading beside the links.
 */
function OutboundGroup({ group }: { group: OutboundGroupId }) {
  const copy = useSiteNavCopy();
  return (
    <PhoneFold
      heading={copy.sectionTitle(group)}
      headingClassName={cn(FOLD_HEADING_CLASS, 'sm:min-w-32 sm:shrink-0')}
      toggleClassName={FOLD_TOGGLE_CLASS}
      className={cn(
        'border-b border-rule-faint sm:flex sm:items-baseline sm:gap-6 sm:border-b-0',
        HIDDEN_ON_SITE_MAP,
      )}
      panelClassName="pb-3 sm:flex-1 sm:pb-0"
    >
      <ul className="grid grid-cols-2 gap-x-4 sm:flex sm:flex-wrap sm:gap-x-5">
        {outboundLinks(group).map((link) => (
          <li key={link.id} className="min-w-0">
            <SiteLink href={link.href} kind="external" className={LINK_CLASS}>
              {copy.outboundLabel(link.id)}
            </SiteLink>
          </li>
        ))}
      </ul>
    </PhoneFold>
  );
}

interface SiteFooterProps {
  /** The host this footer renders on: links to the other host go out in the same tab. */
  host: SiteHost;
  tagline: string;
  /** Copyright line; `{year}` is replaced with the current year. */
  copyright: string;
  /** The "CC0 · Verified · Reproducible" colophon, linked to its sources on /security. */
  colophon: string;
  /** Extra content beside the wordmark (e.g. the landing's "Open the app"). */
  action?: ReactNode;
  /** Extra lines under the copyright (e.g. the preview build's commit). */
  meta?: ReactNode;
}

/**
 * The one footer both hosts render, from the navigation taxonomy
 * (config/siteNav.ts): six section columns, the ecosystem, community and
 * language rows, and the legal line. Directory links prefetch on intent
 * only, so scrolling to the footer no longer downloads every route.
 *
 * A server component wherever its parent is one (the landing shell gets it
 * as a slot); only the phone folds (`PhoneFold`), the links and the language
 * directory hydrate. On phones the six sections and the ecosystem and
 * community rows fold behind their headings (without script they stay
 * open), while the languages always show, the tagline gives way, and the
 * legal line keeps clear of a fixed action dock (`--dock-clearance`, set in
 * styles/global.css while one is on the page). The site map, which is the
 * directory, hides the footer's copy of it (`SITE_MAP_MARKER`).
 */
export function SiteFooter({ host, tagline, copyright, colophon, action, meta }: SiteFooterProps) {
  const t = useTranslations('common');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const security = resolveRouteHref(getSiteRoute('security'), host, locale);
  const home = host === 'app' ? getSiteRoute('observatory') : getSiteRoute('projectSite');

  return (
    <footer className="relative mt-auto border-t border-rule bg-background">
      <div className="site-container">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pb-6 pt-8 sm:pb-8 sm:pt-14">
          <div className="min-w-0">
            <Link
              href={home.path}
              aria-label={navT('brand.homeLabel')}
              className="inline-flex min-h-11 items-center no-underline"
            >
              <Wordmark size="lg" />
            </Link>
            <p className="type-body-sm mt-3 max-w-md text-muted-foreground max-sm:hidden">
              {tagline}
            </p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        <nav
          aria-label={t('accessibility.footer')}
          className={cn(
            'grid border-t border-rule-faint sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 sm:pt-10 lg:grid-cols-6',
            HIDDEN_ON_SITE_MAP,
          )}
        >
          {FOOTER_SECTIONS.map((section) => (
            <PhoneFold
              key={section}
              heading={copy.sectionTitle(section)}
              headingClassName={cn(FOLD_HEADING_CLASS, 'sm:pb-3')}
              toggleClassName={FOLD_TOGGLE_CLASS}
              className="border-b border-rule-faint sm:border-b-0"
              panelClassName="pb-3 sm:pb-0"
            >
              <ul>
                {footerEntries(section, host).map(({ key, route, group }) => {
                  const target = resolveRouteHref(route, host, locale);
                  return (
                    <li key={key} className={cn('min-w-0', route.parent && 'sm:pl-3')}>
                      <SiteLink
                        href={target.href}
                        kind={target.kind}
                        prefetch="intent"
                        className={LINK_CLASS}
                      >
                        {group ? copy.groupLabel(group) : copy.routeLabel(route.id)}
                      </SiteLink>
                    </li>
                  );
                })}
              </ul>
            </PhoneFold>
          ))}
        </nav>

        {/* From 640px three rows under the directory; on phones two folds and the languages.
            On the site map only the languages remain, under their own rule. */}
        <div
          className={cn(
            'border-rule-faint sm:mt-10 sm:grid sm:gap-y-3 sm:border-t sm:py-6',
            '[:root:has([data-site-map])_&]:mt-0 [:root:has([data-site-map])_&]:border-t',
          )}
        >
          <OutboundGroup group="ecosystem" />
          <OutboundGroup group="community" />
          <div className="min-w-0 border-b border-rule-faint pb-3 sm:flex sm:items-baseline sm:gap-6 sm:border-b-0 sm:pb-0">
            <h2 className={cn(GROUP_HEADING_CLASS, 'sm:min-w-32 sm:shrink-0')}>
              {t('languageSwitcher.label')}
            </h2>
            <LanguageDirectory
              hideLabel
              className="max-sm:[&_ul]:grid max-sm:[&_ul]:grid-cols-2 max-sm:[&_ul]:gap-x-4 sm:[&_a]:min-h-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-rule-faint pb-[calc(1.5rem+var(--dock-clearance,0px))] pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:border-t sm:pt-6">
          <div className="type-caption flex flex-col gap-1 text-subtle">
            <p>{copyright.replace('{year}', String(new Date().getFullYear()))}</p>
            {meta}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-0">
            {LEGAL_ROUTE_IDS.map((id) => {
              const target = resolveRouteHref(getSiteRoute(id), host, locale);
              return (
                <SiteLink
                  key={id}
                  href={target.href}
                  kind={target.kind}
                  prefetch="intent"
                  className="link-quiet type-caption inline-flex min-h-8 items-center text-muted-foreground hover:text-foreground"
                >
                  {copy.routeLabel(id)}
                </SiteLink>
              );
            })}
            <SiteLink
              href={security.href}
              kind={security.kind}
              prefetch="intent"
              className="type-eyebrow inline-flex min-h-8 items-center text-subtle transition-colors duration-150 hover:text-foreground"
            >
              {colophon}
            </SiteLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
