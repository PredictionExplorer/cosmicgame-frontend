'use client';

import { useSearchParams } from 'next/navigation';

import { GalleryView } from './GalleryView';

/**
 * The gallery body for the reader's URL. Reading the search params makes
 * everything under the route's Suspense boundary render on the client in the
 * prerendered page, so the route's fallback is this same view with the default
 * query: the static HTML already holds the first page of plates, and the
 * client render replaces it in place (for the plain `/gallery`, identically).
 */
export default function GalleryPage() {
  const searchParams = useSearchParams();
  return <GalleryView search={searchParams.toString()} />;
}
