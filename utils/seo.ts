import type { Metadata } from 'next';

import { logoImgUrl } from './index';

/**
 * Builds App Router Metadata for a page with OpenGraph + Twitter meta tags.
 * Pass a custom `imageUrl` for pages that feature a specific token image;
 * all other pages default to the site logo.
 */
export function createMetadata(
  title: string,
  description: string,
  imageUrl: string = logoImgUrl,
): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, images: [imageUrl] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}
