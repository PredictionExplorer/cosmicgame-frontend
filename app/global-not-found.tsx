import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { NotFoundView } from '@/components/layout/NotFoundView';
import { notFoundMetadata } from '@/components/layout/notFoundMetadata';
import { PageShell } from '@/components/ui/page-shell';
import { routing, type AppLocale } from '@/i18n/routing';
import { APP_ORIGIN, LANDING_ORIGIN, isLandingHost } from '@/lib/hostRouting';

import { AppChrome } from './[locale]/(app)/app-chrome';
import { webManifestPath } from './[locale]/(app)/manifest.webmanifest/build-manifest';
import { LandingChrome } from './[locale]/(landing)/landing-chrome';
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
 * arrives styled and complete, script or no script.
 */
export default async function GlobalNotFound() {
  const [locale, host] = await Promise.all([requestLocale(), requestHost()]);
  setRequestLocale(locale);

  return (
    <RootDocument locale={locale}>
      {host === 'landing' ? (
        <LandingChrome locale={locale}>
          <main id="main" tabIndex={-1} className="site-container relative">
            <NotFoundView host="landing" />
          </main>
        </LandingChrome>
      ) : (
        <AppChrome locale={locale}>
          <PageShell variant="data" backdrop="subtle">
            <NotFoundView host="app" />
          </PageShell>
        </AppChrome>
      )}
    </RootDocument>
  );
}
