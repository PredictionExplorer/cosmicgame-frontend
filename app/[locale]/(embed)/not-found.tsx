// Server component: an embed's 404 (a cycle that has not opened, or not a
// cycle number at all) arrives as HTML inside the embed's own document.
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

/**
 * "Page not found · Cosmic Signature" in the tab instead of the site default;
 * the locale comes from this segment's params, never from request headers.
 */
export { generateNotFoundMetadata as generateMetadata } from '@/components/layout/notFoundMetadata';

/**
 * The embed's 404: the code, a plain heading and one way on, to the
 * statistics in the app, in a new window like the embed's own source link.
 * No site navigation, since an embed has none.
 */
export default function EmbedNotFound() {
  const t = useTranslations('errors');
  const tStatistics = useTranslations('statistics');

  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen w-full flex-col items-start gap-3 bg-background px-4 py-10 sm:px-8"
    >
      <p className="type-eyebrow text-subtle">{t('notFound.code')}</p>
      <h1 className="type-heading-3 text-foreground">{t('notFound.title')}</h1>
      <Link
        href="/statistics/activity"
        target="_blank"
        rel="noopener noreferrer"
        className="link-quiet group mt-2 inline-flex min-h-11 items-center gap-1.5 type-label text-muted-foreground hover:text-foreground sm:min-h-8"
      >
        {tStatistics('embed.source')}
        <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
        <span className="sr-only"> {tStatistics('embed.opensNewWindow')}</span>
      </Link>
    </main>
  );
}
