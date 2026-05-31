import type { Metadata } from 'next';

import { APP_ORIGIN, LANDING_ORIGIN } from '@/lib/hostRouting';

export type CanonicalHost = 'app' | 'landing';

const CANONICAL_ORIGINS: Record<CanonicalHost, string> = {
  app: APP_ORIGIN,
  landing: LANDING_ORIGIN,
};

interface MetadataOptions {
  canonicalHost?: CanonicalHost;
  /**
   * Public indexable pages should be explicit about snippets/previews. Private,
   * wallet-specific, admin, and thin utility routes should pass `false` so the
   * directive is generated consistently across the app.
   */
  index?: boolean;
}

function normalizeCanonicalPath(path: string): string {
  const [pathname = '/', query = ''] = path.split('?');
  const prefixedPath = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
  const normalizedPath =
    prefixedPath.length > 1 && prefixedPath.endsWith('/')
      ? prefixedPath.replace(/\/+$/, '')
      : prefixedPath;

  if (!query) return normalizedPath;

  // Keep metadata canonicals clean. View-state query parameters are handled by
  // the app, but crawlers should consolidate signals on the base URL.
  return normalizedPath;
}

/**
 * Builds App Router Metadata with OpenGraph + Twitter tags and an
 * optional canonical URL.
 *
 * When `imageUrl` is omitted, no `og:image` / `twitter:image` is set;
 * Next.js then resolves the nearest `opengraph-image.tsx` PNG. Pass
 * `imageUrl` only when a page has its own asset (e.g. `/detail/[id]`
 * surfaces the actual NFT PNG). Pass `path` (e.g. "/faq") to add a
 * self-referencing canonical URL.
 */
export function createMetadata(
  title: string,
  description: string,
  imageUrl?: string,
  path?: string,
  options: MetadataOptions = {},
): Metadata {
  const openGraph: NonNullable<Metadata['openGraph']> = { title, description };
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title,
    description,
  };

  if (imageUrl !== undefined) {
    openGraph.images = [imageUrl];
    twitter.images = [imageUrl];
  }

  const index = options.index ?? true;
  const metadata: Metadata = {
    title,
    description,
    openGraph,
    twitter,
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        },
  };

  if (path !== undefined) {
    const origin = CANONICAL_ORIGINS[options.canonicalHost ?? 'app'];
    metadata.alternates = { canonical: `${origin}${normalizeCanonicalPath(path)}` };
  }

  return metadata;
}
