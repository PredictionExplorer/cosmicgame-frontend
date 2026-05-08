import type { Metadata } from 'next';

const SITE_URL = 'https://www.cosmicsignature.com';

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

  const metadata: Metadata = { title, description, openGraph, twitter };

  if (path !== undefined) {
    metadata.alternates = { canonical: `${SITE_URL}${path}` };
  }

  return metadata;
}
