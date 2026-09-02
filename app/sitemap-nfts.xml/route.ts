import { networkConfig } from '@/config/networks';
import { routing } from '@/i18n/routing';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { languageAlternates } from '@/lib/hreflang';
import { getAPIUrl } from '@/services/api/client';

/**
 * Image sitemap for the artwork detail pages (`/detail/[id]`).
 *
 * The main host-aware sitemap (`app/sitemap.ts`) lists only static routes, so
 * the individual artworks — the heart of an art protocol — were reachable to
 * crawlers only by paginating the gallery. This route lists the most recent
 * imprints with Google image-sitemap entries so search and AI crawlers can
 * discover every artwork page and index the PNGs directly.
 *
 * Fail-safe by design: any API problem produces a valid empty urlset (HTTP
 * 200), never a 5xx that could get the sitemap dropped from search consoles.
 */
export const revalidate = 3600;

/** Newest tokens to list. Well under the 50k-URL/50MB sitemap limits. */
const MAX_TOKENS = 2000;

interface SitemapTokenInfo {
  TokenId: number;
  Seed?: string | number;
}

/**
 * Image URLs pin the stable media origin (not the hourly-rotated API pick):
 * a sitemap whose image hosts alternate every regeneration would look like
 * constant churn to crawlers.
 */
function stableMediaOrigin(): string {
  return (networkConfig.nftApiUrl || '').replace(/\/+$/, '');
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadRecentTokens(): Promise<SitemapTokenInfo[]> {
  try {
    const response = await fetch(getAPIUrl(`cst/list/all/0/${MAX_TOKENS}`), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { CosmicSignatureTokenList?: SitemapTokenInfo[] };
    return (body.CosmicSignatureTokenList ?? []).filter(
      (token) =>
        Number.isFinite(token.TokenId) && token.Seed !== undefined && String(token.Seed) !== '',
    );
  } catch {
    return [];
  }
}

function renderUrlEntry(token: SitemapTokenInfo, mediaOrigin: string): string {
  const path = `/detail/${token.TokenId}`;
  const imageLoc = xmlEscape(`${mediaOrigin}/images/new/cosmicsignature/0x${token.Seed}.png`);
  const alternates = Object.entries(languageAlternates(APP_ORIGIN, path))
    .map(
      ([hreflang, href]) =>
        `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${xmlEscape(href)}"/>`,
    )
    .join('');

  return routing.locales
    .map(
      (locale) =>
        `<url><loc>${xmlEscape(localeHref(APP_ORIGIN, path, locale))}</loc>${alternates}<image:image><image:loc>${imageLoc}</image:loc></image:image></url>`,
    )
    .join('');
}

export async function GET(): Promise<Response> {
  const tokens = await loadRecentTokens();
  const mediaOrigin = stableMediaOrigin();

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
    'xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    tokens.map((token) => renderUrlEntry(token, mediaOrigin)).join('') +
    '</urlset>';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Mirrors the route-level ISR window for CDN/proxy caches.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
