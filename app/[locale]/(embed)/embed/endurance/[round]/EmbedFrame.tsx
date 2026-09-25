import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/layout/Wordmark';

interface EmbedFrameProps {
  /** The window's H1: what it shows. */
  title: string;
  /** Where "Open in Cosmic Signature" leads: the chart's own section in the app. */
  sourceHref: string;
  /** Beside the H1: whether the cycle is live or final. */
  status?: ReactNode;
  children: ReactNode;
}

/**
 * An endurance embed's window: it says whose it is and what it is, for a
 * reader who meets it on its own. The Cosmic Signature lockup (to the
 * Observatory), a link to the chart's section in the app, the H1 and, beside
 * it, the cycle's status; the chart, or what stands in for it, below. Every
 * link opens a new window, so the embed stays itself. No client hooks, so the
 * chart (in the browser) and the server's view of a cycle that has not
 * opened share it.
 */
export function EmbedFrame({ title, sourceHref, status, children }: EmbedFrameProps) {
  const t = useTranslations('statistics');

  return (
    <main
      id="main"
      tabIndex={-1}
      className="min-h-screen w-full bg-background px-4 py-5 sm:px-8 sm:py-7"
    >
      <header className="mb-6 border-b border-rule pb-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-control no-underline sm:min-h-8"
          >
            {/* The mark alone on a phone, so the source link shares its row; the name stays
                the link's name. */}
            <Wordmark size="sm" nameClassName="max-sm:sr-only" />
            <span className="sr-only"> {t('embed.opensNewWindow')}</span>
          </Link>
          <Link
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet group inline-flex min-h-11 items-center gap-1.5 type-label text-muted-foreground hover:text-foreground sm:min-h-8"
          >
            {t('embed.source')}
            <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
            <span className="sr-only"> {t('embed.opensNewWindow')}</span>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="type-heading-3 text-foreground">{title}</h1>
          {status}
        </div>
      </header>
      {children}
    </main>
  );
}
