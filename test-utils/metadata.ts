import type { Metadata, ResolvedMetadata, ResolvingMetadata } from 'next';

/** Share card an ancestor segment resolved, as `parent` carries it into a page. */
export const PARENT_SHARE_IMAGE = {
  url: 'https://app.cosmicsignature.com/en/opengraph-image-test/default',
  width: 1200,
  height: 630,
  alt: 'Cosmic Signature',
  type: 'image/png',
} as const;

/**
 * The `parent` argument Next.js passes to `generateMetadata`, for unit tests.
 * Defaults to an ancestor that resolved one share card.
 */
export function resolvingMetadata(
  metadata: Partial<ResolvedMetadata> = {
    openGraph: { images: [PARENT_SHARE_IMAGE] } as unknown as ResolvedMetadata['openGraph'],
  },
): ResolvingMetadata {
  return Promise.resolve(metadata as ResolvedMetadata);
}

/** The document `<title>` a page's metadata renders. */
export function documentTitleOf(metadata: Metadata): string | undefined {
  const { title } = metadata;
  if (title == null) return undefined;
  if (typeof title === 'string') return title;
  if ('absolute' in title) return title.absolute;
  return 'default' in title ? title.default : undefined;
}
