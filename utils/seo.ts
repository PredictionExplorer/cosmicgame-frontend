import type { Metadata } from 'next';

import { logoImgUrl } from './index';

const SITE_URL = 'https://www.cosmicsignature.com';

/**
 * Builds App Router Metadata for a page with OpenGraph + Twitter meta tags
 * and a self-referencing canonical URL.
 *
 * Pass a custom `imageUrl` for pages that feature a specific token image;
 * all other pages default to the site logo.
 *
 * Pass `path` (e.g. "/faq") to generate a canonical URL. When omitted the
 * canonical is not set (root layout already sets metadataBase).
 */
export function createMetadata(
  title: string,
  description: string,
  imageUrl: string = logoImgUrl,
  path?: string,
): Metadata {
  const metadata: Metadata = {
    title,
    description,
    openGraph: { title, description, images: [imageUrl] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };

  if (path !== undefined) {
    metadata.alternates = { canonical: `${SITE_URL}${path}` };
  }

  return metadata;
}
