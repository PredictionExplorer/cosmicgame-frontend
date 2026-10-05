import { readFileSync } from 'node:fs';

/**
 * The three-body orbit mark (public/images/brand/orbit-mark.svg, drawn in
 * `currentColor`), tinted for surfaces that take an image rather than CSS:
 * share cards and the generated icons. The header draws the same file in
 * `--primary` through a CSS mask.
 */
const MARK_FILE = new URL('../../public/images/brand/orbit-mark.svg', import.meta.url);

let markSource: string | undefined;
const tinted = new Map<string, string>();

/** The mark's SVG source with every `currentColor` replaced by `color`. */
export function orbitMarkSvg(color: string): string {
  markSource ??= readFileSync(MARK_FILE, 'utf8');
  return markSource.replaceAll('currentColor', color);
}

/** `data:image/svg+xml` URI of the mark in `color`, for Satori `<img>`. */
export function orbitMarkDataUri(color: string): string {
  let uri = tinted.get(color);
  if (!uri) {
    uri = `data:image/svg+xml;base64,${Buffer.from(orbitMarkSvg(color)).toString('base64')}`;
    tinted.set(color, uri);
  }
  return uri;
}
