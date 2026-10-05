import { routing } from '@/i18n/routing';

import { buildWebManifest } from './build-manifest';

/**
 * `/[locale]/manifest.webmanifest`: the app host's localized web app manifest
 * (./build-manifest.ts). Prerendered for every locale; proxy.ts serves the
 * physical `/en/…` path as is, like the generated share cards.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return Response.json(await buildWebManifest(locale), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
