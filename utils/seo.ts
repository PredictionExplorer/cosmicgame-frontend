/**
 * Page metadata for both hosts.
 *
 * Next.js merges metadata SHALLOWLY: a page that returns `openGraph` replaces
 * its layout's whole `openGraph` object. So every field the layouts set once
 * (`og:site_name`, `og:type`, `twitter:site`, the card type) is emitted again
 * by `createMetadata` for every page; nothing is left to inheritance except
 * the share image, which comes from one of three places:
 *
 *   - an explicit `imageUrl`;
 *   - an `opengraph-image.tsx` next to the page (the file convention fills
 *     `og:image` after the page's object merges): use `createMetadata`;
 *   - the nearest ancestor's card, for every other page: use
 *     `createPageMetadata(parent, …)`, which carries it over the merge.
 *
 * `app/[locale]/(app)/__tests__/sitewide-metadata.test.ts` enforces the
 * choice per route and `npm run seo:share-check` checks the built HTML.
 */

import type { Metadata, ResolvingMetadata } from 'next';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { languageAlternates } from '@/lib/hreflang';

export type CanonicalHost = 'app' | 'landing';

/** The brand as every share card, `og:site_name`, and tab title spells it, in every locale. */
export const SITE_NAME = 'Cosmic Signature';

/**
 * The brand in 12 characters or fewer, where a launcher or home screen would
 * cut the full name off (the web manifest's `short_name`). The brand is
 * written in Latin letters in every locale, so one form serves all of them.
 */
export const SITE_SHORT_NAME = 'Cosmic Sig';

/** The protocol's X account, emitted as `twitter:site` on every page. */
export const X_HANDLE = '@CosmicSignature';

/**
 * Joins a page title to the brand in the document `<title>`. One separator
 * site-wide: the page name leads so a crowded tab strip still tells tabs
 * apart, and the brand closes every title exactly once.
 */
export const TITLE_BRAND_SEPARATOR = ' · ';

const CANONICAL_ORIGINS: Record<CanonicalHost, string> = {
  app: APP_ORIGIN,
  landing: LANDING_ORIGIN,
};
const OPEN_GRAPH_IMAGE_WIDTH = 1200;
const OPEN_GRAPH_IMAGE_HEIGHT = 630;

export interface MetadataOptions {
  canonicalHost?: CanonicalHost;
  /**
   * Public indexable pages should be explicit about snippets/previews. Private,
   * wallet-specific, admin, and thin utility routes should pass `false` so the
   * directive is generated consistently across the app.
   */
  index?: boolean;
  /**
   * Locale of the page being rendered (from `params.locale`). When set
   * together with `path`, the canonical points at the locale's own URL and
   * hreflang alternates (every locale, its aliases, `x-default`) are emitted.
   */
  locale?: string;
  /** `og:type`. Long-form editorial pages are `article`; everything else is a `website` page. */
  ogType?: 'website' | 'article';
}

function normalizeCanonicalPath(path: string): string {
  // Keep metadata canonicals clean. View-state query parameters are handled by
  // the app, but crawlers should consolidate signals on the base URL.
  const [pathname = '/'] = path.split('?');
  const prefixedPath = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
  return prefixedPath.length > 1 && prefixedPath.endsWith('/')
    ? prefixedPath.replace(/\/+$/, '')
    : prefixedPath;
}

/**
 * The document title for a page title: `FAQ · Cosmic Signature`. A title that
 * already names the brand (the home pages, "What Is Cosmic Signature?") is
 * used as is, so no tab ever repeats it.
 */
export function documentTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title}${TITLE_BRAND_SEPARATOR}${SITE_NAME}`;
}

/**
 * A page's metadata: title, description, canonical and hreflang alternates,
 * robots, and complete Open Graph and Twitter blocks. `title` is the page
 * title without the brand: the document `<title>` gets the brand suffix
 * (`documentTitle`), while `og:title` stays bare because `og:site_name`
 * names the site in every preview. For a page with no card of its own, use
 * `createPageMetadata`.
 */
export function createMetadata(
  title: string,
  description: string,
  imageUrl?: string,
  path?: string,
  options: MetadataOptions = {},
): Metadata {
  const origin = CANONICAL_ORIGINS[options.canonicalHost ?? 'app'];
  const canonicalPath = path === undefined ? undefined : normalizeCanonicalPath(path);
  const canonical =
    canonicalPath === undefined
      ? undefined
      : options.locale === undefined
        ? `${origin}${canonicalPath}`
        : localeHref(origin, canonicalPath, options.locale);

  const openGraph: NonNullable<Metadata['openGraph']> = {
    type: options.ogType ?? 'website',
    siteName: SITE_NAME,
    title,
    description,
    ...(canonical !== undefined ? { url: canonical } : {}),
    ...(options.locale !== undefined ? { locale: getLocaleConfig(options.locale).ogLocale } : {}),
  };
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    site: X_HANDLE,
    title,
    description,
  };

  if (imageUrl !== undefined) {
    openGraph.images = [
      {
        url: imageUrl,
        width: OPEN_GRAPH_IMAGE_WIDTH,
        height: OPEN_GRAPH_IMAGE_HEIGHT,
        alt: title,
      },
    ];
    twitter.images = [imageUrl];
  }

  const index = options.index ?? true;
  const metadata: Metadata = {
    title: { absolute: documentTitle(title) },
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

  if (canonicalPath !== undefined) {
    metadata.alternates =
      options.locale !== undefined
        ? { canonical, languages: languageAlternates(origin, canonicalPath) }
        : { canonical };
  }

  return metadata;
}

/**
 * `createMetadata` for a page without its own `opengraph-image.tsx`: keeps
 * the nearest ancestor's share card, which the shallow `openGraph` merge
 * would otherwise drop. Pass the `parent` that Next.js hands to
 * `generateMetadata` as its second argument. `twitter:image` follows
 * `og:image`; an explicit `imageUrl` wins over the parent.
 */
export async function createPageMetadata(
  parent: ResolvingMetadata,
  ...args: Parameters<typeof createMetadata>
): Promise<Metadata> {
  const metadata = createMetadata(...args);
  if (args[2] !== undefined) return metadata;

  const images = (await parent).openGraph?.images;
  if (!images || images.length === 0) return metadata;
  return { ...metadata, openGraph: { ...metadata.openGraph, images } };
}
