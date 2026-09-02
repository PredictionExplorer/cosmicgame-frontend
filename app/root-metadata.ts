import type { Metadata, Viewport } from 'next';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { LANDING_ORIGIN } from '@/lib/hostRouting';

// Browsers cache favicons separately from normal HTTP cache entries and per
// origin. Increment this value whenever either favicon asset is replaced.
export const FAVICON_VERSION = '20260825';
export const FAVICON_SVG_URL = `/favicon.svg?v=${FAVICON_VERSION}`;
export const FAVICON_ICO_URL = `/favicon.ico?v=${FAVICON_VERSION}`;

export interface RootMetadataCopy {
  defaultTitle: string;
  defaultOgTitle: string;
  defaultDescription: string;
}

export interface RootMetadataOptions {
  origin: string;
  canonical: string;
}

// Default OG/Twitter title is intentionally punchier than the document
// title — most embed cards crop after ~70 chars and we want the
// brand-line tagline visible in Discord/Slack/X previews.
const englishRootMetadataCopy: RootMetadataCopy = {
  defaultTitle: 'Cosmic Signature',
  defaultOgTitle: 'Cosmic Signature \u2014 Every Gesture Shapes the Signature.',
  defaultDescription:
    'A procedural on-chain art protocol on Arbitrum. Every gesture you make shapes the cycle\u2019s final Signature. When the cycle finalizes, the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
};

/** Maps a routing locale to the OpenGraph `og:locale` value. */
export function openGraphLocale(locale: string): string {
  return getLocaleConfig(locale).ogLocale;
}

/**
 * Site-wide metadata defaults shared by both root layouts
 * (`app/[locale]/(app)/layout.tsx` and `app/[locale]/(landing)/layout.tsx`).
 *
 * `openGraph.images` and `twitter.images` are intentionally not set here.
 * Next.js auto-populates them from the file-system convention
 * (the nearest `opengraph-image.tsx` in the route tree), which produces a real PNG via
 * `next/og`. SVG og:image is rejected by Discord, Slack, X, Facebook, and
 * LinkedIn, which is why the previous `logoImgUrl` (an SVG) failed to preview.
 */
export function createRootMetadata(
  copy: RootMetadataCopy,
  { origin, canonical }: RootMetadataOptions,
): Metadata {
  return {
    metadataBase: new URL(origin),
    title: { default: copy.defaultTitle, template: '%s' },
    description: copy.defaultDescription,
    icons: {
      icon: [
        { url: FAVICON_SVG_URL, type: 'image/svg+xml' },
        { url: FAVICON_ICO_URL, sizes: 'any' },
      ],
    },
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
      siteName: copy.defaultTitle,
      title: copy.defaultOgTitle,
      description: copy.defaultDescription,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@CosmicSignature',
      title: copy.defaultOgTitle,
      description: copy.defaultDescription,
    },
    keywords: [
      'Cosmic Signature',
      'NFT',
      'procedural art protocol',
      'Arbitrum',
      'Ethereum',
      'generative art',
      'three-body problem',
      'anchoring',
      'CC0',
      'formally verified',
      'on-chain art',
      'public goods',
      'Protocol Guild',
      'ERC-721',
      'RandomWalkNFT',
      'Cosmic Signature CST Token',
      'CST',
    ],
  };
}

export const rootMetadata: Metadata = createRootMetadata(englishRootMetadataCopy, {
  origin: LANDING_ORIGIN,
  canonical: LANDING_ORIGIN,
});

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15BFFD',
};
