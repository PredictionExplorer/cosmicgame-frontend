import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { notFoundMetadata } from '@/components/layout/notFoundMetadata';
import { routing, type AppLocale } from '@/i18n/routing';
import { APP_ORIGIN, LANDING_ORIGIN, isLandingHost } from '@/lib/hostRouting';
import {
  APP_CHROME_NAMESPACES,
  LANDING_CHROME_NAMESPACES,
  pickMessages,
} from '@/lib/i18n/clientMessages';

import { webManifestPath } from './[locale]/(app)/manifest.webmanifest/build-manifest';
import { AppNotFound, LandingNotFound } from './not-found-shells';
import { RootDocument } from './root-document';
import { createRootMetadata, rootViewport } from './root-metadata';

export const viewport = rootViewport;

/**
 * The locale proxy.ts resolved for this request (next-intl reads it from the
 * header its middleware sets), or the default for a request the proxy never
 * saw, such as a missing static file.
 */
async function requestLocale(): Promise<AppLocale> {
  const locale = await getLocale();
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

/** The host this 404 answers for: both hosts share the deployment. */
async function requestHost(): Promise<'app' | 'landing'> {
  const list = await headers();
  return isLandingHost(list.get('x-forwarded-host') ?? list.get('host')) ? 'landing' : 'app';
}

/**
 * The site-wide defaults a root layout would set (icons, the host's
 * metadata base, the app's manifest), then the 404's own title, description
 * and `noindex, follow`. No canonical: a missing page has no address to
 * claim.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [locale, host] = await Promise.all([requestLocale(), requestHost()]);
  const meta = await getTranslations({ locale, namespace: 'meta' });
  const origin = host === 'landing' ? LANDING_ORIGIN : APP_ORIGIN;
  const defaults = createRootMetadata(
    {
      defaultTitle: meta('shared.defaultTitle'),
      defaultOgTitle: meta('shared.defaultOgTitle'),
      defaultDescription: meta('shared.defaultDescription'),
    },
    {
      origin,
      canonical: origin,
      manifest: host === 'app' ? webManifestPath(locale) : undefined,
    },
  );
  return { ...defaults, alternates: null, ...(await notFoundMetadata(locale)) };
}

/**
 * Every URL that matches no route, on both hosts and in every locale
 * (`experimental.globalNotFound` in next.config.ts). The site has a root
 * layout per host under the dynamic `[locale]` segment, so no layout can
 * frame an unknown URL; this file renders the whole document instead, with
 * the host's own chrome: the app header and footer on app.cosmicsignature.com,
 * the landing header and footer (and no wallet stack) on
 * cosmicsignature.com. Rendered on the server like any page, so the 404
 * arrives styled and complete, script or no script. Each host's page comes
 * in behind a dynamic import (app/not-found-shells.tsx), because Next.js
 * ships this file's client references with every route.
 */
export default async function GlobalNotFound() {
  const [locale, host] = await Promise.all([requestLocale(), requestHost()]);
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  if (host === 'landing') {
    const { cycle, art, tracks } = getLandingContent(locale);
    return (
      <RootDocument locale={locale}>
        <NextIntlClientProvider messages={pickMessages(messages, LANDING_CHROME_NAMESPACES)}>
          <LandingNotFound
            sections={{ cycle: cycle.eyebrow, art: art.eyebrow, tracks: tracks.eyebrow }}
          />
        </NextIntlClientProvider>
      </RootDocument>
    );
  }

  return (
    <RootDocument locale={locale}>
      <NextIntlClientProvider messages={pickMessages(messages, APP_CHROME_NAMESPACES)}>
        <AppNotFound />
      </NextIntlClientProvider>
    </RootDocument>
  );
}
