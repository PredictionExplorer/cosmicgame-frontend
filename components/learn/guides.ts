import { learnPlainText, type LearnArticle } from '@/content/learn';

import {
  OUTBOUND_LINKS,
  classifyHref,
  locateSitePath,
  type OutboundLinkId,
  type SiteLinkKind,
  type SiteRouteId,
} from '@/config/siteNav';
import { APP_ORIGIN, LANDING_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { readingMinutes } from '@/components/reading/readingTime';

/** The minutes a guide takes to read: its summary and sections. */
export function guideMinutes(article: LearnArticle, locale: string): number {
  return readingMinutes(
    [
      article.summary,
      ...article.sections.flatMap((section) => [
        section.heading,
        ...section.body.map(learnPlainText),
        ...(section.steps ?? []).map(learnPlainText),
      ]),
    ],
    locale,
  );
}

/**
 * One reading-time rule for the Learn hub and the guides: a reading time is
 * shown from three minutes, where it tells a reader something ("1 min read"
 * does not).
 */
export const MIN_READING_MINUTES_SHOWN = 3;

/** The guide's reading time as shown ("4 min read"), or `null` below the threshold. */
export function guideReadingTime(
  article: LearnArticle,
  locale: string,
  template: string,
): string | null {
  const minutes = guideMinutes(article, locale);
  return minutes >= MIN_READING_MINUTES_SHOWN
    ? template.replace('{minutes}', String(minutes))
    : null;
}

/**
 * A content link as the landing renders it: a guide on this host becomes a
 * locale-aware internal path, an app page keeps the reader's locale on the
 * other host, and anything else opens in a new tab (config/siteNav).
 */
export function landingLink(href: string, locale: string): { href: string; kind: SiteLinkKind } {
  const kind = classifyHref(href, 'landing');
  if (kind === 'internal') {
    const path = href.startsWith(LANDING_ORIGIN) ? href.slice(LANDING_ORIGIN.length) || '/' : href;
    return { href: path, kind };
  }
  if (kind === 'crossHost') return { href: localizeCrossHostHref(href, locale), kind };
  return { href, kind };
}

/**
 * What a related link points at, so the page can name it after its
 * destination (one grammar for every row: the page's or venue's own name).
 */
export type GuideResourceTarget =
  | { readonly kind: 'route'; readonly id: SiteRouteId }
  | { readonly kind: 'guide'; readonly slug: string }
  | { readonly kind: 'outbound'; readonly id: OutboundLinkId };

/** The destination of a guide's related link, or `null` for an address the site does not name. */
export function guideResourceTarget(href: string): GuideResourceTarget | null {
  if (href === APP_ORIGIN) return { kind: 'route', id: 'observatory' };
  if (href.startsWith(`${LANDING_ORIGIN}/learn/`)) {
    return { kind: 'guide', slug: href.slice(`${LANDING_ORIGIN}/learn/`.length) };
  }
  if (href.startsWith(`${APP_ORIGIN}/`)) {
    const { route, exact } = locateSitePath(href.slice(APP_ORIGIN.length), 'app');
    return route && exact ? { kind: 'route', id: route.id } : null;
  }
  const outbound = OUTBOUND_LINKS.find((link) => link.href === href);
  return outbound ? { kind: 'outbound', id: outbound.id } : null;
}
