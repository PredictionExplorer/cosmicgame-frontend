import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { classifyHref, type SiteHost } from '@/config/siteNav';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { UnknownValue } from '@/components/ui/unknown-value';
import { HeaderLede } from '@/components/layout/HeaderLede';
import { PAGE_SECTIONS, type PageSectionId } from '@/components/layout/pageSections';
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';

export type { PageSectionId } from '@/components/layout/pageSections';
export type PageHeaderCrumb = BreadcrumbItem;

/** One summary figure in the header's figure row. */
export interface PageHeaderFigure {
  /** Stable id, rendered as `data-figure` (tests, analytics). */
  id: string;
  label: string;
  /**
   * The formatted figure. `null` means unknown — the read failed or the field
   * is missing — and renders as an em dash with a visible "Unavailable".
   */
  value: ReactNode | null;
  /**
   * A one-sentence definition. The label itself becomes the explanation (a
   * dotted underline, the definition on hover, focus or tap), never an ⓘ.
   */
  info?: string;
  /** A visible qualifier under the value. */
  caption?: ReactNode;
  /**
   * `md` keeps a long value — a date, an address — at the figure-md size on
   * wide screens too, where counts and amounts step up to figure-lg: a
   * timestamp set at 32px outweighs the figures it dates. On phones `md`
   * figures come after the paired ones: one takes the row's full width, two
   * share it.
   */
  size?: 'md';
  /**
   * A short count, a few characters wide. Three compact figures share one
   * row on phones instead of stacking as three label-and-value rows.
   */
  compact?: boolean;
}

/** A related page, rendered as a quiet chip under the header. */
export interface PageHeaderLink {
  href: string;
  label: string;
}

/**
 * `data` (default): every data, record, account and tool page, the gallery and
 * statistics hubs included — `type-display-sm`.
 * `reading`: long-form hubs and the trust and legal template (How it works,
 * FAQ, Security, Audits, Risk disclosures, Terms, Privacy) — `type-display-md`.
 */
export type PageHeaderVariant = 'data' | 'reading';

export interface PageHeaderProps {
  title: ReactNode;
  /**
   * What a record page is about, set directly under the H1 and before the
   * lede: the address of a transfer history or an outreach record (an
   * `AddressChip` and its explorer link), so the reader knows whose figures
   * follow before reading them.
   */
  identity?: ReactNode;
  /**
   * The lede under the H1. On data pages a long lede is clamped to three
   * lines on phones, with a "Read more" toggle; reading pages always show it
   * whole (see `clampLede`).
   */
  subtitle?: ReactNode;
  variant?: PageHeaderVariant;
  /**
   * Clamp a long lede on phones. Defaults to true on `data` pages and false on
   * `reading` pages, whose lede is the page's thesis (the risk disclosure, a
   * policy's scope, a long read) and must not hide words or shift the page
   * when the client removes an unneeded "Read more".
   */
  clampLede?: boolean;
  /**
   * The section the page belongs to (components/layout/pageSections). On a
   * top-level page it is the eyebrow, linked to the section hub; on a record
   * page with `breadcrumbs` it is the first crumb after Home.
   */
  section?: PageSectionId;
  /** The page is its section's hub: the eyebrow names the section without linking to itself. */
  sectionHub?: boolean;
  /**
   * The page's ancestors, for record pages (a gesture, a cycle, an address).
   * Home and the section crumb are added automatically; pass the parents
   * between them and the page. The H1 names the current page, so the trail
   * stops at its parent. A leading `{ href: '/' }` crumb is accepted and
   * replaced with the shared Home label.
   */
  breadcrumbs?: readonly BreadcrumbItem[];
  /**
   * A custom eyebrow. Prefer `section`: an eyebrow names where the page sits,
   * never the H1 again. Ignored when a breadcrumb trail is shown.
   */
  eyebrow?: ReactNode;
  /** The summary figures, as one compact row (a two-column grid on phones). */
  figures?: readonly PageHeaderFigure[];
  /**
   * The meta line under the figures: `SnapshotStamp` (when server data was
   * read), `LiveStatus` (polling pages), `ReviewedStamp` (legal pages), a source.
   */
  meta?: ReactNode;
  /**
   * Related pages, as chips at the foot of the header from 640px. Phones
   * leave them out, so the header stays inside its share of the first screen;
   * the drawer and the footer reach the same pages.
   */
  related?: readonly PageHeaderLink[];
  /** Accessible name of the related-pages nav. Defaults to "Related pages". */
  relatedLabel?: string;
  /**
   * The host the page is served on, so a related link to the other Cosmic
   * Signature host is classified as cross-host (and one to this host as
   * internal). Defaults to `app`; the landing's reading pages pass `landing`.
   */
  host?: SiteHost;
  /** Right-aligned action cluster (buttons, links). Stacks below the title on phones. */
  actions?: ReactNode;
  /** Extra header content, rendered after the related pages (an address chip, a network badge). */
  children?: ReactNode;
  /**
   * Sub-navigation between sibling pages (`PageHeaderTabs`), set on the
   * header's bottom rule, e.g. the Trust Center pages.
   */
  tabs?: ReactNode;
  /** `id` of the H1, for an `aria-labelledby` elsewhere on the page. */
  titleId?: string;
  className?: string;
  align?: 'left' | 'center';
}

const TITLE_CLASS: Record<PageHeaderVariant, string> = {
  data: 'type-display-sm',
  reading: 'type-display-md',
};

/** Grid columns of the figure row from `sm` to `lg`, by figure count. */
const FIGURE_COLUMNS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

/**
 * The trail for a record page: Home, the section crumb (unless the section
 * has no hub, its hub is Home itself or the caller already links it), then
 * the caller's parents. A caller's own Home crumb is replaced so the label is
 * shared.
 */
function buildTrail(
  breadcrumbs: readonly BreadcrumbItem[],
  section: PageSectionId | undefined,
  homeLabel: string,
  sectionLabel: string | null,
): BreadcrumbItem[] {
  const parents = breadcrumbs[0]?.href === '/' ? breadcrumbs.slice(1) : breadcrumbs;
  const hub = section ? PAGE_SECTIONS[section].hub : null;
  const sectionCrumb =
    hub && hub !== '/' && sectionLabel && !parents.some((crumb) => crumb.href === hub)
      ? [{ label: sectionLabel, href: hub }]
      : [];
  return [{ label: homeLabel, href: '/' }, ...sectionCrumb, ...parents];
}

/**
 * The one page header on both hosts: wayfinding (section eyebrow or breadcrumb
 * trail), one H1, the lede, the summary figures, a meta line (snapshot, live
 * status, review date) and related pages. Server-rendered summaries render
 * INTO it; a page never stacks a second header. Renders no client hooks, so it
 * works in server and client components.
 *
 *   <PageHeader
 *     section="records"
 *     title={t('heading')}
 *     subtitle={t('description')}
 *     figures={[{ id: 'records', label: t('records'), value: formatCount(n, locale) }]}
 *     meta={<SnapshotStamp at={readAt} />}
 *     related={[{ href: '/statistics', label: t('links.statistics') }]}
 *   />
 */
export function PageHeader({
  title,
  identity,
  subtitle,
  variant = 'data',
  clampLede = variant === 'data',
  section,
  sectionHub = false,
  breadcrumbs,
  eyebrow,
  figures,
  meta,
  related,
  relatedLabel,
  host = 'app',
  actions,
  children,
  tabs,
  titleId,
  className,
  align = 'left',
}: PageHeaderProps) {
  const t = useTranslations('common');
  const copy = useSiteNavCopy();
  const sectionLabel = section ? copy.sectionTitle(section) : null;
  const trail =
    breadcrumbs !== undefined && !sectionHub
      ? buildTrail(breadcrumbs, section, t('breadcrumbs.home'), sectionLabel)
      : null;
  const centered = align === 'center' && !actions;

  // A hub titled with its section's own name ("Admin") would say it twice.
  const eyebrowEchoesTitle =
    sectionHub &&
    typeof title === 'string' &&
    sectionLabel?.trim().toLocaleLowerCase() === title.trim().toLocaleLowerCase();
  const hub = section ? PAGE_SECTIONS[section].hub : null;
  const eyebrowContent =
    eyebrow ??
    (!trail && sectionLabel && !eyebrowEchoesTitle ? (
      sectionHub || !hub ? (
        sectionLabel
      ) : (
        <Link
          href={hub}
          className="inline-flex min-h-6 items-center transition-colors duration-fast hover:text-foreground hover:underline hover:underline-offset-4"
        >
          {sectionLabel}
        </Link>
      )
    ) : null);

  return (
    <header
      className={cn(
        'relative mb-8 border-b border-rule print:relative print:z-[2] print:text-foreground sm:mb-10',
        tabs ? 'pb-0' : 'pb-6 sm:pb-10',
        centered && 'text-center',
        className,
      )}
    >
      {trail ? (
        <Breadcrumbs
          items={trail}
          className={cn('mb-4 sm:mb-5', centered && '[&_ol]:justify-center')}
        />
      ) : null}
      {eyebrowContent ? (
        <div
          className={cn(
            // The eyebrow pairs with the subtle tier everywhere (docs/design-system.md).
            'mb-3 type-eyebrow text-subtle sm:mb-4',
            centered && 'flex justify-center',
          )}
        >
          {eyebrowContent}
        </div>
      ) : null}

      <div
        className={cn(
          actions && 'flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8',
        )}
      >
        <div className="min-w-0">
          <h1
            id={titleId}
            className={cn('text-foreground print:!text-foreground', TITLE_CLASS[variant])}
          >
            {title}
          </h1>
          {identity ? (
            <div
              data-slot="page-header-identity"
              className={cn(
                'mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 type-body-sm text-muted-foreground sm:mt-3',
                centered && 'justify-center',
              )}
            >
              {identity}
            </div>
          ) : null}
          {subtitle ? (
            <HeaderLede
              moreLabel={t('pageHeader.readMore')}
              lessLabel={t('pageHeader.readLess')}
              clamp={clampLede}
              className={cn(
                // 16px on phones keeps the header inside the first screen.
                'mt-3 type-lede text-muted-foreground max-sm:text-base print:!text-foreground/85 sm:mt-4',
                centered && 'mx-auto',
              )}
            >
              {subtitle}
            </HeaderLede>
          ) : null}
        </div>
        {actions ? (
          <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {figures && figures.length > 0 ? <PageHeaderFigures figures={figures} /> : null}

      {meta ? (
        <div
          className={cn(
            'mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 type-caption text-subtle sm:mt-6',
            centered && 'justify-center',
          )}
        >
          {meta}
        </div>
      ) : null}

      {related && related.length > 0 ? (
        <nav
          aria-label={relatedLabel ?? t('pageHeader.relatedPages')}
          className={cn('max-sm:hidden', meta ? 'mt-4' : 'mt-6')}
        >
          <ul className={cn('flex flex-wrap gap-2', centered && 'justify-center')}>
            {related.map((link) => {
              // Third-party pages open in a new tab and carry its arrow; the
              // other Cosmic Signature host stays in this tab, like a page here.
              const kind = classifyHref(link.href, host);
              const Icon = kind === 'external' ? ArrowUpRight : ArrowRight;
              return (
                <li key={link.href}>
                  <SiteLink
                    href={link.href}
                    kind={kind}
                    externalIcon={false}
                    className="group inline-flex min-h-8 items-center gap-1.5 rounded-control border border-rule px-3 type-label text-muted-foreground no-underline transition-colors duration-fast hover:border-input hover:text-foreground pointer-coarse:min-h-11"
                  >
                    {link.label}
                    <Icon
                      aria-hidden
                      className="size-3.5 shrink-0 text-subtle transition-colors duration-fast group-hover:text-foreground"
                    />
                  </SiteLink>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      {children}

      {tabs ? <div className="mt-6 sm:mt-8">{tabs}</div> : null}
    </header>
  );
}

export interface PageHeaderTab {
  href: string;
  label: string;
  /** The page being viewed. */
  current?: boolean;
}

/**
 * Underline tabs between sibling pages, for `PageHeader`'s `tabs` slot: they
 * sit on the header's bottom rule, the current page marked with a 2px primary
 * rule and `aria-current="page"`. A row wider than the screen scrolls on a
 * ScrollRail, fading only at an edge with more to see and keeping the current
 * page in view. Links, not ARIA tabs: each one is its own page.
 */
export function PageHeaderTabs({
  label,
  items,
}: {
  /** Accessible name of the nav. */
  label: string;
  items: readonly PageHeaderTab[];
}) {
  return (
    <nav aria-label={label} className="-mb-px">
      <ScrollRail>
        <ul className="flex gap-6">
          {items.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={cn(
                  'focus-ring-inset inline-flex min-h-11 items-center whitespace-nowrap border-b-2 type-label transition-colors duration-[var(--duration-fast)]',
                  item.current
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-rule hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollRail>
    </nav>
  );
}

/**
 * The layout of the figure row on phones:
 * - `strip`: three compact figures (short counts) side by side.
 * - `grid`: two columns; figures with `size: 'md'` (dates, addresses) sit
 *   under the paired others, across the full width, or side by side when
 *   there are two of them.
 * - `rows`: when the paired figures are an odd number, which would leave a
 *   hole in the grid, every figure becomes a label-and-value row instead.
 */
export function figurePhoneLayout(figures: readonly PageHeaderFigure[]): 'grid' | 'rows' | 'strip' {
  if (figures.length === 3 && figures.every((figure) => figure.compact)) return 'strip';
  const paired = figures.filter((figure) => figure.size !== 'md').length;
  return figures.length > 1 && paired % 2 === 1 ? 'rows' : 'grid';
}

/** The phone columns of the figure row, by layout. */
const PHONE_FIGURE_LAYOUT_CLASS: Record<ReturnType<typeof figurePhoneLayout>, string> = {
  grid: 'grid-cols-2 max-sm:-mb-3',
  strip: 'grid-cols-3 max-sm:-mb-3',
  rows: 'grid-cols-1 max-sm:flex max-sm:flex-col max-sm:divide-y max-sm:divide-rule',
};

/**
 * The header's figure row: label over value, one row divided by hairlines
 * from `lg`, a grid by count from `sm`, and on phones a two-column grid,
 * three short counts side by side, or a list of label-and-value rows (see
 * `figurePhoneLayout`).
 *
 * Every figure is a subgrid of three shared rows (label, value, caption), so
 * values sit on one baseline however their labels wrap and whatever their
 * size; in the phone rows a value that wraps under its label keeps to the end
 * edge. Each figure appears once per page — the page body never repeats it
 * in a second stat row.
 */
export function PageHeaderFigures({
  figures,
  className,
}: {
  figures: readonly PageHeaderFigure[];
  className?: string;
}) {
  const t = useTranslations('common');
  const unavailable = t('status.unavailable');
  const layout = figurePhoneLayout(figures);
  const rows = layout === 'rows';
  // Two full-width figures (a date and an address) share the last phone row
  // rather than taking one row each; a single one keeps the full width.
  const pairWideFigures = figures.filter((figure) => figure.size === 'md').length === 2;
  return (
    <dl
      data-layout={layout}
      className={cn(
        // Phones: tighter rhythm, so the header stays near the top of the first screen.
        'mt-4 grid gap-x-4 gap-y-1 sm:mt-8 sm:gap-x-6',
        PHONE_FIGURE_LAYOUT_CLASS[layout],
        FIGURE_COLUMNS[Math.min(figures.length, 4)],
        'sm:-mb-5',
        'lg:mb-0 lg:grid-flow-col lg:grid-cols-none lg:grid-rows-[auto_auto_auto] lg:auto-cols-[minmax(0,max-content)] lg:justify-start lg:gap-x-0 lg:divide-x lg:divide-rule',
        className,
      )}
    >
      {figures.map((figure) => (
        <div
          key={figure.id}
          data-figure={figure.id}
          className={cn(
            'row-span-3 grid min-w-0 grid-rows-subgrid content-start pb-3 sm:pb-5 lg:px-8 lg:pb-0 lg:first:pl-0 lg:last:pr-0',
            rows
              ? 'max-sm:flex max-sm:flex-wrap max-sm:items-baseline max-sm:gap-x-4 max-sm:py-2 max-sm:first:pt-0 max-sm:last:pb-0'
              : figure.size === 'md' &&
                  cn('max-sm:order-last', !pairWideFigures && 'max-sm:col-span-2'),
          )}
        >
          <dt className="self-end type-label text-subtle">
            {figure.info ? (
              <ExplainedTerm
                definition={figure.info}
                title={figure.label}
                announce="moreInformation"
                // A label on its own line: on touch it grows a 44px hit area
                // (touch-hit-area) that hands its space back, so the figures
                // do not move apart.
                placement="standalone"
              >
                {figure.label}
              </ExplainedTerm>
            ) : (
              // The label is its own text node, so the dt reads exactly as the label.
              <span>{figure.label}</span>
            )}
          </dt>
          {/* A date may wrap in a narrow column rather than overflow it. */}
          <dd
            className={cn(
              // Positioned after the label, so a linked value stays above the
              // label's touch pad where the two meet.
              'self-baseline type-figure-md text-foreground [&_time]:whitespace-normal max-sm:relative',
              figure.size !== 'md' && 'lg:type-figure-lg',
              rows && 'max-sm:ms-auto max-sm:text-right',
            )}
          >
            {figure.value === null ? (
              <>
                <UnknownValue label={unavailable} />
                {/* Seen, not heard (the dash above already announces it), and drawn
                    as generated content so the figure's text stays the dash alone. */}
                <span
                  aria-hidden
                  data-caption={unavailable}
                  className="block type-caption text-subtle after:content-[attr(data-caption)]"
                />
              </>
            ) : (
              figure.value
            )}
          </dd>
          {figure.caption ? (
            <dd className={cn('type-caption text-subtle', rows && 'max-sm:basis-full')}>
              {figure.caption}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
