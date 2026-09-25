import type { Metadata, Viewport } from 'next';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { LANDING_ORIGIN } from '@/lib/hostRouting';
import { BRAND_ICON_URLS } from '@/lib/og/brandIcons';
import { SITE_NAME, X_HANDLE } from '@/utils/seo';
import { DEFAULT_SITE_THEME, THEME_CHROME } from '@/lib/theme/config';

export interface RootMetadataCopy {
  defaultTitle: string;
  defaultOgTitle: string;
  defaultDescription: string;
}

export interface RootMetadataOptions {
  origin: string;
  canonical: string;
  /** The web app manifest to link; only the app host installs, so the landing passes none. */
  manifest?: string;
}

// Default OG/Twitter title is intentionally punchier than the document
// title — most embed cards crop after ~70 chars and we want the
// brand-line tagline visible in Discord/Slack/X previews.
const englishRootMetadataCopy: RootMetadataCopy = {
  defaultTitle: SITE_NAME,
  defaultOgTitle: 'Cosmic Signature \u2014 Every Gesture Shapes the Signature.',
  defaultDescription:
    'A procedural on-chain art protocol on Arbitrum. Every gesture you make shapes the cycle\u2019s final Signature. When the cycle finalizes, the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
};

/** Maps a routing locale to the OpenGraph `og:locale` value. */
export function openGraphLocale(locale: string): string {
  return getLocaleConfig(locale).ogLocale;
}

/**
 * Site-wide metadata defaults shared by every root layout
 * (`app/[locale]/(app)/layout.tsx`, `app/[locale]/(landing)/layout.tsx` and
 * `app/[locale]/(embed)/layout.tsx`).
 *
 * `openGraph.images` and `twitter.images` are intentionally not set here.
 * Next.js auto-populates them from the file-system convention
 * (the nearest `opengraph-image.tsx` in the route tree), which produces a real PNG via
 * `next/og`. SVG og:image is rejected by Discord, Slack, X, Facebook, and
 * LinkedIn, which is why the previous `logoImgUrl` (an SVG) failed to preview.
 */
export function createRootMetadata(
  copy: RootMetadataCopy,
  { origin, canonical, manifest }: RootMetadataOptions,
): Metadata {
  return {
    metadataBase: new URL(origin),
    title: { default: copy.defaultTitle, template: '%s' },
    description: copy.defaultDescription,
    // The ICO is declared with its sizes, not `any`, so browsers that read
    // SVG favicons choose the SVG; iOS takes the apple-touch icon
    // (lib/og/brandIcons.ts, `npm run brand:icons`).
    icons: {
      icon: [
        { url: BRAND_ICON_URLS.faviconIco, sizes: '16x16 32x32 48x48' },
        { url: BRAND_ICON_URLS.faviconSvg, type: 'image/svg+xml' },
      ],
      apple: [{ url: BRAND_ICON_URLS.appleTouchIcon, sizes: '180x180', type: 'image/png' }],
    },
    ...(manifest ? { manifest } : {}),
    verification: {
      google: 'ZUw5gzqw7CFIEZgCJ2pLy-MhDe7Fdotpc31fS75v3dE',
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: copy.defaultOgTitle,
      description: copy.defaultDescription,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: X_HANDLE,
      title: copy.defaultOgTitle,
      description: copy.defaultDescription,
    },
    // No site-wide `keywords`: one English list served on every locale's
    // pages helped no search engine, and the landing home sets its own
    // localized list (content/landing).
  };
}

export const rootMetadata: Metadata = createRootMetadata(englishRootMetadataCopy, {
  origin: LANDING_ORIGIN,
  canonical: LANDING_ORIGIN,
});

/**
 * `themeColor` is the default palette's page colour. The theme bootstrap
 * (lib/theme/config.ts) rewrites it before first paint for the visitor's
 * palette, so mobile browser chrome always blends into the page.
 *
 * `viewportFit: 'cover'` lets iOS report the safe-area insets: without it
 * `env(safe-area-inset-*)` is 0, and the dock, the gesture sheet's submit
 * row and the floating pills sat in the home-indicator zone. The content
 * edge (`--gutter`, styles/tokens.css) keeps clear of the notch in landscape.
 */
export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_CHROME[DEFAULT_SITE_THEME],
};
