'use client';

import type { MouseEvent } from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { rememberLocale } from '@/i18n/localeCookie';
import { getPathname, usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_LABELS, routing, type AppLocale } from '@/i18n/routing';
import { publicPathname } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';

interface LanguageDirectoryProps {
  className?: string;
}

/** A left click without modifiers: the browser would navigate in this tab. */
function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Footer language directory (docs/i18n/README.md §2.4): every language as a
 * crawlable link to the current page in that language, labeled in itself.
 *
 * The `LanguageSwitcher` menus are client-only, so this is the one surface
 * where crawlers and no-JS readers can discover the other seven editions of
 * a page. Hrefs are the canonical URLs from `getPathname` (English unprefixed,
 * everything else under its prefix), the same URLs the `hreflang` alternates
 * in `<head>` advertise, and each link carries `hreflang` and `rel="alternate"`
 * so the relationship is explicit in the markup.
 *
 * Clicking is progressively enhanced. A plain click switches like the pill:
 * `router.replace(pathname + search + hash, { locale })`, which writes the
 * `NEXT_LOCALE` cookie and keeps the query and hash. A modified or middle
 * click leaves the browser's open-in-new-tab behavior alone and only records
 * the choice, because the middleware redirects unprefixed URLs to the
 * remembered language and an English page would otherwise reopen in the old
 * one (see `rememberLocale`).
 */
export function LanguageDirectory({ className }: LanguageDirectoryProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  // The landing home prerenders under its internal `/landing-site` route;
  // its public path is `/` (see `publicPathname`).
  const pathname = publicPathname(usePathname());
  const label = t('languageSwitcher.label');

  const switchTo = (next: AppLocale) => {
    // Read query/hash at click time to avoid a useSearchParams() Suspense
    // boundary in every layout that mounts the directory.
    const suffix = `${window.location.search}${window.location.hash}`;
    router.replace(`${pathname}${suffix}`, { locale: next });
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>, option: AppLocale) => {
    if (option === locale) return;
    if (isPlainLeftClick(event)) {
      event.preventDefault();
      switchTo(option);
      return;
    }
    rememberLocale(option);
  };

  const onAuxClick = (event: MouseEvent<HTMLAnchorElement>, option: AppLocale) => {
    // Middle click opens a new tab without firing `click`; a right click also
    // reaches here but only opens the context menu, so it changes nothing.
    if (option !== locale && event.button === 1) rememberLocale(option);
  };

  return (
    <nav
      aria-label={label}
      data-testid="language-directory"
      className={cn(
        'flex flex-col gap-3 text-xs sm:flex-row sm:items-baseline sm:gap-6',
        className,
      )}
    >
      <p className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
        <Globe className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {routing.locales.map((option) => {
          const current = option === locale;
          return (
            <li key={option}>
              <a
                href={getPathname({ href: pathname, locale: option })}
                lang={option}
                hrefLang={option}
                rel={current ? undefined : 'alternate'}
                aria-current={current ? 'true' : undefined}
                onClick={(event) => onClick(event, option)}
                onAuxClick={(event) => onAuxClick(event, option)}
                className={cn(
                  'inline-flex min-h-8 items-center text-sm no-underline transition-colors sm:min-h-6',
                  current
                    ? 'font-medium text-white underline decoration-sky-400/60 decoration-1 underline-offset-4'
                    : 'text-white/60 hover:text-white',
                )}
              >
                {LOCALE_LABELS[option]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
