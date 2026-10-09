'use client';

import { useEffect } from 'react';

import enErrors from '@/messages/en/errors.json';
import jaErrors from '@/messages/ja/errors.json';
import koErrors from '@/messages/ko/errors.json';
import ukErrors from '@/messages/uk/errors.json';
import viErrors from '@/messages/vi/errors.json';
import zhErrors from '@/messages/zh/errors.json';
import zhHkErrors from '@/messages/zh-HK/errors.json';
import zhTwErrors from '@/messages/zh-TW/errors.json';

import { normalizeLocale, type AppLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing } from '@/i18n/routing';
import { splitLocalePrefix } from '@/lib/hostRouting';
import { reportError } from '@/utils/errors';

const ERROR_CATALOGS: LocaleRecord<typeof enErrors> = {
  en: enErrors,
  zh: zhErrors,
  'zh-TW': zhTwErrors,
  'zh-HK': zhHkErrors,
  uk: ukErrors,
  ko: koErrors,
  ja: jaErrors,
  vi: viErrors,
};

/**
 * Last-resort boundary for failures in the root layout itself, where no
 * segment `error.tsx` can help. Next.js swaps out the whole document here, so
 * this component owns `<html>`/`<body>` and cannot rely on the layout's
 * stylesheet or the next-intl provider — hence inline styles and a direct
 * catalog read instead of `useTranslations` (same trade-off as the
 * environment error screen in `providers.tsx`). The inline colours read the
 * palette tokens when the stylesheet is still there and fall back to the
 * default palette (Midnight), so the page keeps the brand's ground, text and
 * wordmark either way. `retry` re-fetches the root instead of re-rendering
 * what just failed.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    reportError(error, 'global-error');
  }, [error]);

  const locale = resolveLocaleFromLocation();
  const copy = ERROR_CATALOGS[locale].global;

  return (
    <html lang={locale} dir={getLocaleConfig(locale).textDirection}>
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 24,
          background: 'hsl(var(--background, 233 33% 5%))',
          color: 'hsl(var(--foreground, 250 38% 97%))',
          fontFamily: 'var(--body-font-stack, system-ui, sans-serif)',
          lineHeight: 1.55,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            translate="no"
            lang="en"
            style={{
              margin: '0 0 24px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'hsl(var(--primary, 254 100% 92%))',
            }}
          >
            Cosmic Signature
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 }}>
            {copy.title}
          </h1>
          <p style={{ margin: '0 0 28px', color: 'hsl(var(--muted-foreground, 247 14% 75%))' }}>
            {copy.message}
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              minHeight: 44,
              padding: '10px 22px',
              borderRadius: 8,
              border: '1px solid hsl(var(--input, 246 14% 46%))',
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              fontWeight: 500,
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
 * so the URL prefix is enough (matched longest-first and case-insensitively,
 * like the proxy). The document `lang` attribute is unusable here: React still
 * owns the old `<html>` at the moment this renders.
 */
function resolveLocaleFromLocation(): AppLocale {
  if (typeof window === 'undefined') return routing.defaultLocale;
  const { locale } = splitLocalePrefix(window.location.pathname);
  return normalizeLocale(locale);
}
