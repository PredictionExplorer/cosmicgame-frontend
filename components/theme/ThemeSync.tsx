'use client';

import { useEffect, useLayoutEffect } from 'react';
// This lifecycle lives above next-intl and observes the real URL; it never navigates.
// eslint-disable-next-line no-restricted-imports
import { usePathname } from 'next/navigation';

import { restoreSiteTheme } from '@/lib/theme/client';
import { THEME_STORAGE_KEY } from '@/lib/theme/config';

/** Lightweight preference lifecycle shared by both hosts; no wallet dependencies. */
export function ThemeSync() {
  const pathname = usePathname();
  useLayoutEffect(restoreSiteTheme, [pathname]);

  useEffect(() => {
    const visible = () => {
      if (document.visibilityState === 'visible') restoreSiteTheme();
    };
    const storage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) restoreSiteTheme();
    };
    // Cookies cross subdomains; focus/visibility handles returning from the
    // other host. Storage events keep tabs on the same origin synchronized.
    window.addEventListener('focus', restoreSiteTheme);
    window.addEventListener('pageshow', restoreSiteTheme);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('focus', restoreSiteTheme);
      window.removeEventListener('pageshow', restoreSiteTheme);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);
  return null;
}
