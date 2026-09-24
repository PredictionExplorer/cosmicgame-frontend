'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
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
import { SiteLink } from './SiteLink';
import { useSiteNavCopy } from './useSiteNav';
import { Wordmark } from './Wordmark';

const LINK_CLASS =
  'link-quiet inline-flex min-h-10 max-w-full items-center gap-1 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground sm:min-h-8';

/**
 * One group of the footer. From 640px it is a heading over its links; on
 * phones the links fold behind a toggle on the heading row. The folding is
 * CSS (`max-sm:hidden`), not `<details>`: the server's HTML is already right
 * at every width, so nothing shifts when the page hydrates, and the links
 * stay in the markup as the crawl path for the client-only header menus.
 */
function FooterGroup({
  title,
  layout = 'column',
  children,
  className,
}: {
  title: string;
  /** `row`: heading and links on one line from 640px (ecosystem, community, language). */
  layout?: 'column' | 'row';
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const panelId = useId();
  return (
    <div
      className={cn(
        'relative min-w-0 border-b border-rule-faint sm:border-b-0',
        layout === 'row' && 'sm:flex sm:items-baseline sm:gap-6',
        className,
      )}
    >
      <h2
        id={headingId}
        className={cn(
          'type-eyebrow flex min-h-12 items-center pr-10 text-subtle sm:min-h-0 sm:pr-0',
          layout === 'column' ? 'sm:pb-3' : 'sm:min-w-32 sm:shrink-0',
        )}
      >
        {title}
      </h2>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={headingId}
        onClick={() => setOpen((value) => !value)}
        className="absolute inset-x-0 top-0 flex h-12 items-center justify-end rounded-control text-subtle sm:hidden"
      >
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      <div id={panelId} className={cn('min-w-0 pb-4 sm:pb-0', !open && 'max-sm:hidden')}>
        {children}
      </div>
    </div>
  );
}

/** A route as a footer link; sibling groups collapse to one row. */
function footerEntries(section: (typeof FOOTER_SECTIONS)[number]) {
  const seen = new Set<string>();
  const entries: { key: string; route: SiteRoute; group?: keyof typeof SITE_ROUTE_GROUPS }[] = [];
  for (const route of footerRoutes(section)) {
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

function OutboundRow({ group }: { group: OutboundGroupId }) {
  const copy = useSiteNavCopy();
  return (
    <FooterGroup title={copy.sectionTitle(group)} layout="row">
      <ul className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-5">
        {outboundLinks(group).map((link) => (
          <li key={link.id} className="min-w-0">
            <SiteLink href={link.href} kind="external" className={LINK_CLASS}>
              {copy.outboundLabel(link.id)}
            </SiteLink>
          </li>
        ))}
      </ul>
    </FooterGroup>
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
 * (config/siteNav.ts): six section columns, the ecosystem and community
 * rows, the language directory and the legal line. Directory links prefetch
 * on intent only, so scrolling to the footer no longer downloads every
 * route. On phones each group folds behind its heading.
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
        <div className="flex flex-col gap-6 pb-8 pt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-14">
          <div className="min-w-0">
            <Link
              href={home.path}
              aria-label={navT('brand.homeLabel')}
              className="inline-flex min-h-11 items-center no-underline"
            >
              <Wordmark size="lg" />
            </Link>
            <p className="type-body-sm mt-3 max-w-md text-muted-foreground">{tagline}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        <nav
          aria-label={t('accessibility.footer')}
          className="grid border-t border-rule-faint sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 sm:pt-10 lg:grid-cols-6"
        >
          {FOOTER_SECTIONS.map((section) => (
            <FooterGroup key={section} title={copy.sectionTitle(section)}>
              <ul>
                {footerEntries(section).map(({ key, route, group }) => {
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
            </FooterGroup>
          ))}
        </nav>

        <div className="grid border-rule-faint sm:mt-10 sm:gap-y-3 sm:border-t sm:py-6">
          <OutboundRow group="ecosystem" />
          <OutboundRow group="community" />
          <FooterGroup title={t('languageSwitcher.label')} layout="row">
            <LanguageDirectory
              hideLabel
              className="max-sm:[&_ul]:grid max-sm:[&_ul]:grid-cols-2 max-sm:[&_ul]:gap-x-4 sm:[&_a]:min-h-8"
            />
          </FooterGroup>
        </div>

        <div className="flex flex-col gap-4 border-rule-faint py-6 sm:flex-row sm:items-center sm:justify-between sm:border-t">
          <div className="type-caption flex flex-col gap-1 text-subtle">
            <p>{copyright.replace('{year}', String(new Date().getFullYear()))}</p>
            {meta}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {LEGAL_ROUTE_IDS.map((id) => {
              const target = resolveRouteHref(getSiteRoute(id), host, locale);
              return (
                <SiteLink
                  key={id}
                  href={target.href}
                  kind={target.kind}
                  prefetch="intent"
                  className="link-quiet type-caption inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground sm:min-h-8"
                >
                  {copy.routeLabel(id)}
                </SiteLink>
              );
            })}
            <SiteLink
              href={security.href}
              kind={security.kind}
              prefetch="intent"
              className="type-eyebrow inline-flex min-h-10 items-center text-subtle transition-colors duration-150 hover:text-foreground sm:min-h-8"
            >
              {colophon}
            </SiteLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
