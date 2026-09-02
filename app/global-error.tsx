'use client';

import { useEffect } from 'react';

import enErrors from '@/messages/en/errors.json';
import zhErrors from '@/messages/zh/errors.json';

import { isAppLocale, type AppLocale, type LocaleRecord } from '@/i18n/locale';
import { routing } from '@/i18n/routing';
import { reportError } from '@/utils/errors';

const ERROR_CATALOGS: LocaleRecord<typeof enErrors> = {
  en: enErrors,
  zh: zhErrors,
};

/**
 * Last-resort boundary for failures in the root layout itself, where no
 * segment `error.tsx` can help. Next.js swaps out the whole document here, so
 * this component owns `<html>`/`<body>` and cannot rely on the layout's
 * stylesheet or the next-intl provider — hence inline styles and a direct
 * catalog read instead of `useTranslations` (same trade-off as the
 * environment error screen in `providers.tsx`).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, 'global-error');
  }, [error]);

  const locale = resolveLocaleFromLocation();
  const copy = ERROR_CATALOGS[locale].global;

  return (
    <html lang={locale}>
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 24,
          background: '#0a0a0a',
          color: '#e5e5e5',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{copy.title}</h1>
          <p style={{ marginBottom: 24, opacity: 0.9 }}>{copy.message}</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            {copy.retry}
          </button>
        </div>
      </body>
    </html>
  );
}

/**
 * `localePrefix: 'as-needed'` means only the default locale goes unprefixed,
 * so the first path segment is enough. The document `lang` attribute is
 * unusable here: React still owns the old `<html>` at the moment this renders.
 */
function resolveLocaleFromLocation(): AppLocale {
  if (typeof window === 'undefined') return routing.defaultLocale;
  const [, first] = window.location.pathname.split('/');
  return isAppLocale(first) ? first : routing.defaultLocale;
}
