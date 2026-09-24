'use client';

import { useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
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

/** Below 640px the directory folds into disclosures; above it every group stays open. */
const PHONE_QUERY = '(max-width: 639.98px)';

const phoneQuery = () =>
  typeof window.matchMedia === 'function' ? window.matchMedia(PHONE_QUERY) : null;

function subscribeToPhoneQuery(onChange: () => void) {
  const query = phoneQuery();
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}

/** Folded on phones; the server and hydration render the open desktop layout. */
function usePhoneFolding(): boolean {
  return useSyncExternalStore(
    subscribeToPhoneQuery,
    () => phoneQuery()?.matches ?? false,
    () => false,
  );
}

const LINK_CLASS =
  'link-quiet inline-flex min-h-10 max-w-full items-center gap-1 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground sm:min-h-8';

/**
 * One group of the footer: a `<details>` whose links are always in the HTML
 * (the crawl path for the client-only header menus). It is open from 640px,
 * where its summary reads as a plain heading, and folded on phones.
 */
function FooterGroup({
  title,
  folded,
  children,
  className,
}: {
  title: string;
  folded: boolean;
  children: ReactNode;
  className?: string;
}) {
  const keepOpen = (event: MouseEvent<HTMLElement>) => {
    if (!folded) event.preventDefault();
  };
  return (
    <details
      open={!folded}
      className={cn('group/footer min-w-0 border-b border-rule-faint sm:border-b-0', className)}
    >
      <summary
        onClick={keepOpen}
        className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 sm:min-h-0 sm:cursor-default sm:pb-3 [&::-webkit-details-marker]:hidden"
      >
        <h2 className="type-eyebrow text-subtle">{title}</h2>
        <ChevronDown
          aria-hidden
          className="size-4 text-subtle transition-transform duration-200 group-open/footer:rotate-180 motion-reduce:transition-none sm:hidden"
        />
      </summary>
      <div className="pb-4 sm:pb-0">{children}</div>
    </details>
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

function OutboundRow({ group, folded }: { group: OutboundGroupId; folded: boolean }) {
  const copy = useSiteNavCopy();
  return (
    <FooterGroup
      title={copy.sectionTitle(group)}
      folded={folded}
      className="sm:flex sm:items-baseline sm:gap-6"
    >
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
 * route. On phones each group folds into a disclosure.
 */
export function SiteFooter({ host, tagline, copyright, colophon, action, meta }: SiteFooterProps) {
  const t = useTranslations('common');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const folded = usePhoneFolding();
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
            <FooterGroup key={section} title={copy.sectionTitle(section)} folded={folded}>
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

        <div className="grid border-rule-faint sm:mt-10 sm:gap-y-3 sm:border-t sm:pt-6">
          <OutboundRow group="ecosystem" folded={folded} />
          <OutboundRow group="community" folded={folded} />
        </div>

        <FooterLanguages folded={folded} />

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

/** The language directory; a disclosure on phones, one open row above. */
function FooterLanguages({ folded }: { folded: boolean }) {
  const t = useTranslations('common');
  if (!folded) {
    return (
      <div className="mt-6 border-t border-rule-faint py-5">
        <LanguageDirectory />
      </div>
    );
  }
  return (
    <FooterGroup title={t('languageSwitcher.label')} folded={folded}>
      <LanguageDirectory hideLabel className="[&_ul]:grid [&_ul]:grid-cols-2 [&_ul]:gap-x-4" />
    </FooterGroup>
  );
}
