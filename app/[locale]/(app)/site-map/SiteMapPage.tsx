import { Fragment, type ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  SITE_ORIGINS,
  getSiteRoute,
  outboundLinks,
  resolveRouteHref,
  routesInSection,
  siteHostLabel,
  type OutboundGroupId,
  type SiteRoute,
  type SiteSectionId,
} from '@/config/siteNav';
import {
  OUTBOUND_GROUP_ICONS,
  OUTBOUND_ICONS,
  SITE_ROUTE_ICONS,
  SITE_SECTION_ICONS,
} from '@/config/siteNavIcons';
import { HostDivider, NavRowContent } from '@/components/layout/NavRow';
import { PageHeader } from '@/components/layout/PageHeader';
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';
import { PageShell } from '@/components/ui/page-shell';
import { localeHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';

export interface SiteMapArticle {
  readonly slug: string;
  readonly title: string;
}

/**
 * Phones: a compact two-column row, name only, a long single word (GeckoTerminal)
 * breaking rather than overflowing its half. From 640px: icon, name and description.
 */
const ROW_CLASS =
  'group/row flex min-h-11 items-center gap-3 rounded-control px-2 py-1.5 no-underline transition-colors duration-150 [overflow-wrap:anywhere] hover:bg-muted sm:min-h-0 sm:px-3 sm:py-2 sm:[overflow-wrap:normal]';

/** Phones drop the row's icon and description, so two names fit side by side. */
const ROW_ICON_CLASS = 'max-sm:hidden';
const ROW_DESCRIPTION_CLASS = 'max-sm:hidden';

/** A section's rows: one column from 640px, two on phones. */
const ROWS_CLASS = 'mt-2 grid grid-cols-2 gap-x-2 sm:mt-4 sm:flex sm:flex-col sm:gap-0.5';

/** Ecosystem and Community sit side by side from 768px: their rows pair up from 1280px. */
const OUTBOUND_ROWS_CLASS =
  'mt-2 grid grid-cols-2 gap-x-2 sm:mt-4 sm:flex sm:flex-col sm:gap-0.5 xl:grid xl:gap-x-6';

/**
 * The map's columns from 1280px, one per header menu (config/siteNav
 * APP_HEADER_NAV): the Observatory and the Gallery with the account pages
 * of the wallet menu, the Explore panel, the Learn panel. Each column runs
 * about as long as the others. Below 1280px the same sections, in the same
 * order, flow through two balanced columns, and phones stack them.
 */
export const SITE_MAP_COLUMNS: readonly (readonly SiteSectionId[])[] = [
  ['participate', 'collection', 'account'],
  ['explore', 'records'],
  ['learn', 'trust'],
];

/**
 * One section of the map: its heading, its one-line description and every
 * row, open at every width and without script (the site map is the
 * server-rendered crawl path for the header's client-only menus). Its `id`
 * is the section's anchor (`/site-map#records`), where page headers lead the
 * Records eyebrow.
 *
 * From 640px every section opens with a rule, so each column starts on one
 * (the page header drops its own there). On phones the sections are divided
 * by faint rules, and the first one sits under the header's rule.
 */
function SiteMapSection({
  id,
  title,
  description,
  icon: Icon,
  lead = false,
  rowsClassName = ROWS_CLASS,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** The first section of the page, directly under the header on phones. */
  lead?: boolean;
  rowsClassName?: string;
  children: ReactNode;
}) {
  const headingId = `sitemap-${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'scroll-mt-[calc(var(--header-height)+1.5rem)] break-inside-avoid border-t border-rule-faint py-5 sm:mb-10 sm:border-rule sm:py-0 sm:pt-6',
        lead && 'max-sm:border-t-0 max-sm:pt-0',
      )}
    >
      <h2 id={headingId} className="type-heading-3 flex items-center gap-2.5 text-foreground">
        <Icon aria-hidden className="size-5 shrink-0 text-primary" />
        {title}
      </h2>
      <p className="type-body-sm mt-1.5 text-muted-foreground">{description}</p>
      <ul className={rowsClassName}>{children}</ul>
    </section>
  );
}

function RouteRow({ route }: { route: SiteRoute }) {
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const target = resolveRouteHref(route, 'app', locale);
  const nested = !!route.parent;
  return (
    <li
      className={cn(
        'min-w-0',
        nested && 'sm:ml-[1.625rem] sm:border-l sm:border-rule-faint sm:pl-2',
      )}
    >
      <SiteLink href={target.href} kind={target.kind} prefetch="intent" className={ROW_CLASS}>
        <NavRowContent
          icon={nested ? undefined : SITE_ROUTE_ICONS[route.id]}
          iconClassName={ROW_ICON_CLASS}
          label={copy.routeLabel(route.id)}
          description={copy.routeDescription(route.id)}
          descriptionClassName={ROW_DESCRIPTION_CLASS}
        />
        {target.kind === 'internal' ? (
          <ChevronRight
            aria-hidden
            className="size-4 shrink-0 text-subtle opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 max-sm:hidden"
          />
        ) : null}
      </SiteLink>
    </li>
  );
}

function OutboundSection({ group }: { group: OutboundGroupId }) {
  const t = useTranslations('siteMap');
  const copy = useSiteNavCopy();
  return (
    <SiteMapSection
      id={group}
      title={copy.sectionTitle(group)}
      description={t(`sections.${group}`)}
      icon={OUTBOUND_GROUP_ICONS[group]}
      rowsClassName={OUTBOUND_ROWS_CLASS}
    >
      {outboundLinks(group).map((link) => (
        <li key={link.id} className="min-w-0">
          <SiteLink href={link.href} kind="external" className={ROW_CLASS}>
            <NavRowContent
              icon={OUTBOUND_ICONS[link.id]}
              iconClassName={ROW_ICON_CLASS}
              label={copy.outboundLabel(link.id)}
              description={copy.outboundDescription(link.id)}
              descriptionClassName={ROW_DESCRIPTION_CLASS}
            />
          </SiteLink>
        </li>
      ))}
    </SiteMapSection>
  );
}

/**
 * The Learn Hub's guides, as a full-width band under the sections: listed
 * inside the Learn section they made its column twice as long as the rest.
 */
function GuidesBand({ articles }: { articles: readonly SiteMapArticle[] }) {
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const learnHub = getSiteRoute('learnHub');
  const Icon = SITE_ROUTE_ICONS.learnHub;
  return (
    <section
      id="guides"
      aria-labelledby="sitemap-guides-heading"
      className="scroll-mt-[calc(var(--header-height)+1.5rem)] border-t border-rule-faint py-5 sm:border-rule sm:pb-0 sm:pt-6"
    >
      <h2
        id="sitemap-guides-heading"
        className="type-heading-3 flex items-center gap-2.5 text-foreground"
      >
        <Icon aria-hidden className="size-5 shrink-0 text-primary" />
        {copy.routeLabel('learnHub')}
      </h2>
      <p className="type-body-sm mt-1.5 text-muted-foreground">
        {copy.routeDescription('learnHub')} · {siteHostLabel(learnHub.host)}
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-x-2 sm:mt-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-0.5 xl:grid-cols-3">
        {articles.map((article) => (
          <li key={article.slug} className="min-w-0">
            <SiteLink
              href={localeHref(SITE_ORIGINS.landing, `${learnHub.path}/${article.slug}`, locale)}
              kind="crossHost"
              className={ROW_CLASS}
            >
              <NavRowContent label={article.title} />
            </SiteLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface SiteMapPageProps {
  /** The learn articles in the active locale, listed as the Learn Hub's guides. */
  articles?: readonly SiteMapArticle[];
}

/**
 * Every destination of both hosts, grouped exactly like the header, drawer
 * and footers (config/siteNav.ts). Rows share the menus' icons; links to the
 * other Cosmic Signature host name it and stay in the tab, third-party links
 * open a new tab with an arrow. A server component: every link is in the
 * HTML and readable without script, on phones too.
 */
const SiteMapPage = ({ articles = [] }: SiteMapPageProps) => {
  const t = useTranslations('siteMap');
  const copy = useSiteNavCopy();
  const leadSection = SITE_MAP_COLUMNS[0]?.[0];

  return (
    <PageShell variant="data" backdrop="signature">
      {/* From 640px each column opens on its own section rule; a header
          rule 40px above it would draw two hairlines. */}
      <PageHeader
        title={t('page.title')}
        subtitle={t('page.subtitle')}
        section="trust"
        className="mb-6 sm:mb-10 sm:border-b-0 sm:pb-0"
      />

      {/* Columns are wrappers from 1280px and dissolve below it, where the
          sections balance themselves across two columns. */}
      {/* Multi-column layout drops the last section's margin at a column's
          foot, so the flow keeps the gap itself. */}
      <div className="gap-x-12 md:columns-2 md:pb-10 xl:grid xl:grid-cols-3 xl:pb-0">
        {SITE_MAP_COLUMNS.map((column) => (
          <div key={column.join('-')} className="contents xl:block xl:min-w-0">
            {column.map((section) => (
              <SiteMapSection
                key={section}
                id={section}
                title={copy.sectionTitle(section)}
                description={t(`sections.${section}`)}
                icon={SITE_SECTION_ICONS[section]}
                lead={section === leadSection}
              >
                {routesInSection(section).map((route, index, routes) => (
                  <Fragment key={route.id}>
                    {route.host !== (routes[index - 1]?.host ?? 'app') ? (
                      <li className="col-span-2">
                        <HostDivider
                          label={siteHostLabel(route.host)}
                          className="px-2 pb-1 pt-3 sm:px-3"
                        />
                      </li>
                    ) : null}
                    <RouteRow route={route} />
                  </Fragment>
                ))}
              </SiteMapSection>
            ))}
          </div>
        ))}
      </div>

      {/* The destinations outside the app, as one row under the columns. */}
      <div className="gap-x-12 md:grid md:grid-cols-2">
        <OutboundSection group="ecosystem" />
        <OutboundSection group="community" />
      </div>

      {articles.length > 0 ? <GuidesBand articles={articles} /> : null}
    </PageShell>
  );
};

export default SiteMapPage;
