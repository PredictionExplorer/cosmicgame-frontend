import type { LearnArticle } from '@/content/learn';

import { classifyHref, type SiteLinkKind } from '@/config/siteNav';
import { LANDING_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { readingMinutes } from '@/components/reading/readingTime';

/** The minutes a guide takes to read: its summary and sections. */
export function guideMinutes(article: LearnArticle, locale: string): number {
  return readingMinutes(
    [article.summary, ...article.sections.flatMap((section) => [section.heading, ...section.body])],
    locale,
  );
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
