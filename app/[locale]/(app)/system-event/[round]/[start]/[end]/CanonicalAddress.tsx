'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

import { getPathname } from '@/i18n/navigation';

/**
 * Puts the page's one URL in the address bar once it has loaded, without a
 * navigation: the page already shows what that URL shows. For a link the
 * server answered in place rather than with a redirect (a redirect raised in
 * a cached render reaches the browser with its Location header twice); the
 * page's canonical link says the same to a crawler.
 */
export function CanonicalAddress({ href }: { href: string }) {
  const locale = useLocale();
  useEffect(() => {
    const pathname = getPathname({ href, locale });
    if (window.location.pathname === pathname) return;
    // The App Router keeps its state in step with a replaceState call.
    window.history.replaceState(
      null,
      '',
      `${pathname}${window.location.search}${window.location.hash}`,
    );
  }, [href, locale]);
  return null;
}
