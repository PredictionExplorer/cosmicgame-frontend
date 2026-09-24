'use client';

import { Fragment, type ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  SITE_ORIGINS,
  SITE_SECTION_IDS,
  getSiteRoute,
  outboundLinks,
  resolveRouteHref,
  routesInSection,
  siteHostLabel,
  type OutboundGroupId,
  type SiteRoute,
} from '@/config/siteNav';
import {
  OUTBOUND_GROUP_ICONS,
  OUTBOUND_ICONS,
  SITE_ROUTE_ICONS,
  SITE_SECTION_ICONS,
} from '@/config/siteNavIcons';
import { HostDivider, NavRowContent } from '@/components/layout/NavRow';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhoneFold } from '@/components/layout/PhoneFold';
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/useSiteNav';
import { PageShell } from '@/components/ui/page-shell';
import { localeHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';

export interface SiteMapArticle {
  readonly slug: string;
  readonly title: string;
}

const ROW_CLASS =
  'group/row flex items-center gap-3 rounded-control px-2 py-2 no-underline transition-colors duration-150 hover:bg-muted sm:px-3';

/**
 * One section of the map. From 640px its rows are always listed; on phones
 * they fold behind the section's heading (its one-line description stays),
 * so the page reads as nine sections instead of six screens of rows. The
 * rows stay in the HTML either way, as the crawl path for the header menus.
 */
function SiteMapSection({
  id,
  title,
  description,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const headingId = `sitemap-${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className="break-inside-avoid border-t border-rule max-sm:border-rule-faint sm:mb-10 sm:pt-6"
    >
      <PhoneFold
        headingId={headingId}
        heading={
          <>
            <Icon aria-hidden className="size-5 shrink-0 text-primary" />
            {title}
          </>
        }
        headingClassName="type-heading-3 flex items-center gap-2.5 text-foreground max-sm:min-h-12 max-sm:pr-10"
        lead={
          <p className="type-body-sm mt-1.5 text-muted-foreground max-sm:mt-0 max-sm:pb-4">
            {description}
          </p>
        }
        panelClassName="max-sm:pb-4"
      >
        <ul className="mt-4 flex flex-col gap-0.5 max-sm:mt-0">{children}</ul>
      </PhoneFold>
    </section>
  );
}

function RouteRow({ route, nested }: { route: SiteRoute; nested?: boolean }) {
  const locale = useLocale();
  const copy = useSiteNavCopy();
  const target = resolveRouteHref(route, 'app', locale);
  return (
    <li className={cn(nested && 'ml-4 border-l border-rule-faint pl-2 sm:ml-[1.625rem]')}>
      <SiteLink href={target.href} kind={target.kind} prefetch="intent" className={ROW_CLASS}>
        <NavRowContent
          icon={nested ? undefined : SITE_ROUTE_ICONS[route.id]}
          label={copy.routeLabel(route.id)}
          description={
            <span className="max-sm:line-clamp-1">{copy.routeDescription(route.id)}</span>
          }
        />
        {target.kind === 'internal' ? (
          <ChevronRight
            aria-hidden
            className="size-4 shrink-0 text-subtle opacity-0 transition-opacity duration-150 group-hover/row:opacity-100"
          />
        ) : null}
      </SiteLink>
    </li>
  );
}

function ArticleRows({ articles }: { articles: readonly SiteMapArticle[] }) {
  const locale = useLocale();
  return (
    <>
      {articles.map((article) => (
        <li key={article.slug} className="ml-4 border-l border-rule-faint pl-2 sm:ml-[1.625rem]">
          <SiteLink
            href={localeHref(
              SITE_ORIGINS.landing,
              `${getSiteRoute('learnHub').path}/${article.slug}`,
              locale,
            )}
            kind="crossHost"
            className={ROW_CLASS}
          >
            <NavRowContent label={article.title} />
          </SiteLink>
        </li>
      ))}
    </>
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
    >
      {outboundLinks(group).map((link) => (
        <li key={link.id}>
          <SiteLink href={link.href} kind="external" className={ROW_CLASS}>
            <NavRowContent
              icon={OUTBOUND_ICONS[link.id]}
              label={copy.outboundLabel(link.id)}
              description={
                <span className="max-sm:line-clamp-1">{copy.outboundDescription(link.id)}</span>
              }
            />
          </SiteLink>
        </li>
      ))}
    </SiteMapSection>
  );
}

interface SiteMapPageProps {
  /** The learn articles in the active locale, listed under the Learn Hub. */
  articles?: readonly SiteMapArticle[];
}

/**
 * Every destination of both hosts, grouped exactly like the header, drawer
 * and footers (config/siteNav.ts). Rows share the menus' icons; links to the
 * other Cosmic Signature host name it and stay in the tab, third-party links
 * open a new tab with an arrow.
 */
const SiteMapPage = ({ articles = [] }: SiteMapPageProps) => {
  const t = useTranslations('siteMap');
  const copy = useSiteNavCopy();

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title={t('page.title')}
        subtitle={t('page.subtitle')}
        breadcrumbs={[{ label: t('page.home'), href: '/' }, { label: t('page.title') }]}
        align="left"
        className="mb-10 max-sm:mb-4"
      />

      <div className="gap-x-12 md:columns-2 xl:columns-3">
        {SITE_SECTION_IDS.map((section) => (
          <SiteMapSection
            key={section}
            id={section}
            title={copy.sectionTitle(section)}
            description={t(`sections.${section}`)}
            icon={SITE_SECTION_ICONS[section]}
          >
            {routesInSection(section).map((route, index, routes) => (
              <Fragment key={route.id}>
                {route.host !== (routes[index - 1]?.host ?? 'app') ? (
                  <li>
                    <HostDivider
                      label={siteHostLabel(route.host)}
                      className="px-2 pb-1 pt-3 sm:px-3"
                    />
                  </li>
                ) : null}
                <RouteRowWithChildren
                  route={route}
                  articles={route.id === 'learnHub' ? articles : []}
                />
              </Fragment>
            ))}
          </SiteMapSection>
        ))}
        <OutboundSection group="ecosystem" />
        <OutboundSection group="community" />
      </div>
    </PageShell>
  );
};

function RouteRowWithChildren({
  route,
  articles,
}: {
  route: SiteRoute;
  articles: readonly SiteMapArticle[];
}) {
  return (
    <>
      <RouteRow route={route} nested={!!route.parent} />
      {articles.length ? <ArticleRows articles={articles} /> : null}
    </>
  );
}

export default SiteMapPage;
