import { getImageProps } from 'next/image';

/** One file of a responsive set: its URL and its pixel width. */
export interface Rendition {
  src: string;
  width: number;
}

/**
 * Widths the image optimizer adds between an artwork's published files. The
 * media server publishes a 640px thumbnail and the 3456px original only, so
 * a 720px plate on a 2x screen, or a phone at 3x, fetched the original:
 * about five times the pixels it could show. 1200 and 1920 serve those slots
 * at 1.5x or better. Both are default `images.deviceSizes`, so the optimizer
 * accepts them.
 */
export const OPTIMIZED_ART_WIDTHS: readonly number[] = [1200, 1920];

/**
 * A responsive set with optimizer-made renditions (`/_next/image`, resized
 * from the widest file) between its narrowest and widest published files.
 * Only for media on a host in `images.remotePatterns` (the protocol's own
 * media servers): the optimizer refuses any other host. When the optimizer
 * is off or rejects the source, the set is returned as published, and a
 * failed optimized file falls back along the plate's source chain like any
 * other.
 */
export function withOptimizedRenditions(
  renditions: readonly Rendition[],
  aspectRatio: number,
): Rendition[] {
  const published = renditions
    .filter((rendition) => rendition.src.length > 0)
    .sort((a, b) => a.width - b.width);
  const narrowest = published[0];
  const widest = published.at(-1);
  if (!narrowest || !widest || narrowest === widest) return published;

  let srcSet: string | undefined;
  try {
    ({
      props: { srcSet },
    } = getImageProps({
      src: widest.src,
      alt: '',
      width: widest.width,
      height: Math.round(widest.width / aspectRatio),
      sizes: '100vw',
    }));
  } catch {
    // Development refuses a host outside images.remotePatterns: keep the files.
    return published;
  }

  const offered = new Map<number, string>();
  for (const candidate of srcSet?.split(', ') ?? []) {
    const match = /^(\S+) (\d+)w$/.exec(candidate.trim());
    if (match) offered.set(Number(match[2]), match[1]!);
  }
  const added = OPTIMIZED_ART_WIDTHS.filter(
    (width) => width > narrowest.width && width < widest.width,
  ).flatMap((width) => {
    const src = offered.get(width);
    // An unoptimized build hands back the original itself: nothing to add.
    return src && src !== widest.src ? [{ src, width }] : [];
  });
  return [...published, ...added].sort((a, b) => a.width - b.width);
}
