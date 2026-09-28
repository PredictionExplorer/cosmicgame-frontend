import { SITE_NAME } from '@/utils/seo';

import { MIDNIGHT_TOKENS, hslTripletToHex } from './palette';

/**
 * The brand's icon set: which files exist, how each is drawn, and the version
 * that busts favicon caches. `npm run brand:icons`
 * (scripts/build-brand-icons.ts) writes the files and the version; the site
 * metadata, the web manifest and the JSON-LD Organization logo reference them
 * through these paths.
 *
 * Every icon is the header's own artwork, public/images/brand/orbit-mark.svg
 * (the file BrandMark masks), in tones of the header's lavender (`--primary`);
 * none is redrawn, so the tab shows the logo the page shows.
 *
 * Favicons are transparent, so the tab strip shows through as the page shows
 * through the header's mark. No single tone reads on every strip (white to
 * Firefox's grey dark tab), so each favicon picks its colour by what it knows:
 *
 * - favicon.svg, what every current browser puts in the tab (Safari since
 *   26), follows `prefers-color-scheme`: the header's lavender on dark
 *   strips, a deeper tone on light ones, and a middle tone that reads on
 *   both wherever the query is not evaluated.
 * - favicon.ico, for older browsers and for the tabs of files that link no
 *   icon (PDFs, images), cannot adapt and takes the middle tone.
 *
 * At tab size the artwork's hairline orbits fall below a pixel and fade, so
 * favicons drawn under TAB_WEIGHT_MAX_PX gain TAB_WEIGHT of line. Home-screen,
 * install and logo icons stay opaque (iOS fills transparency with black,
 * Android masks the maskable icon) and set the exact artwork on the Midnight
 * ground (`--background`), as the header does.
 */

/**
 * The icon set's content hash, written by `npm run brand:icons`: replaced
 * files get new URLs, so browsers and installed apps that cached the old icons
 * fetch them again. lib/og/__tests__/brandIcons.test.ts fails when the files
 * and this hash disagree.
 */
export const BRAND_ICON_VERSION = '8f95aaa4cf';

const versioned = (path: string) => `${path}?v=${BRAND_ICON_VERSION}`;

export const BRAND_ICON_PATHS = {
  /** 16, 32 and 48px transparent frames in the middle tone, for browsers without SVG favicons. */
  faviconIco: '/favicon.ico',
  /** The transparent mark, scalable and scheme-aware; what current browsers show in the tab. */
  faviconSvg: '/favicon.svg',
  /** iOS home screen and Safari favorites: full-bleed square, the system rounds it. */
  appleTouchIcon: '/apple-touch-icon.png',
  /** Install icons (manifest `purpose: any`): the mark on a rounded plate. */
  icon192: '/images/brand/icon-192.png',
  icon512: '/images/brand/icon-512.png',
  /** Android adaptive icon (manifest `purpose: maskable`): the mark inside the safe zone. */
  maskable512: '/images/brand/icon-maskable-512.png',
  /** Search-engine Organization logo (JSON-LD): square, opaque, 512px. */
  logo512: '/images/brand/logo-512.png',
} as const;

/**
 * The icons as pages and the manifest link them: versioned, so a replaced
 * file reaches browsers and installed apps that cached the old one.
 */
export const BRAND_ICON_URLS = {
  faviconIco: versioned(BRAND_ICON_PATHS.faviconIco),
  faviconSvg: versioned(BRAND_ICON_PATHS.faviconSvg),
  appleTouchIcon: versioned(BRAND_ICON_PATHS.appleTouchIcon),
  icon192: versioned(BRAND_ICON_PATHS.icon192),
  icon512: versioned(BRAND_ICON_PATHS.icon512),
  maskable512: versioned(BRAND_ICON_PATHS.maskable512),
} as const;

/** `--primary`'s hue and saturation at `lightness`: the lavender, deepened. */
function primaryAt(lightness: number): string {
  const [hue, saturation] = MIDNIGHT_TOKENS.primary.split(' ');
  return hslTripletToHex(`${hue} ${saturation} ${lightness}%`);
}

export const BRAND_ICON_COLORS = {
  /** The Midnight ground (`--background`) under every opaque icon. */
  plate: hslTripletToHex(MIDNIGHT_TOKENS.background),
  /** The header's lavender (`--primary`): the mark on the plate and on dark tab strips. */
  mark: hslTripletToHex(MIDNIGHT_TOKENS.primary),
  /** The favicon on light tab strips, where the lavender is 1.4:1 on white. */
  markOnLight: primaryAt(60),
  /** The favicon where the strip's scheme is unknown: the best worst-case contrast on light and dark. */
  markOnAny: primaryAt(71),
} as const;

/** Line the tab-sized mark gains, as a share of the icon's side: 0.3px at 16px, 0.6px at 32. */
export const TAB_WEIGHT = 0.3 / 16;

/** From this rendered size up the favicon draws the exact artwork. */
export const TAB_WEIGHT_MAX_PX = 64;

interface MarkArtwork {
  /** The mark's square viewBox side, in its own units. */
  side: number;
  /** Its `<g>` of paths, filled with `currentColor`. */
  artwork: string;
  /** How many viewBox units one unit of a path's own space spans (its uniform transform scale). */
  pathScale: number;
}

/** The artwork of the orbit mark's source (public/images/brand/orbit-mark.svg). */
function markArtwork(markSvg: string): MarkArtwork {
  const viewBox = /\bviewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(markSvg);
  const artwork = /<g\b[\s\S]*<\/g>/.exec(markSvg)?.[0];
  if (!viewBox || viewBox[1] !== viewBox[2] || !artwork?.includes('currentColor')) {
    throw new Error('The orbit mark must be a square viewBox with a <g> in currentColor');
  }
  const scales = new Set(
    [...artwork.matchAll(/<path\b[^>]*>/g)].map(([path]) => {
      const matrix = /\btransform="matrix\(([^)]+)\)"/.exec(path)?.[1]?.split(',').map(Number);
      if (!matrix) return 1;
      const [a, b, c, d] = matrix;
      if (b !== 0 || c !== 0 || Math.abs(a!) !== Math.abs(d!)) {
        throw new Error('Every orbit mark path must be scaled uniformly, without rotation');
      }
      return Math.abs(a!);
    }),
  );
  if (scales.size !== 1) throw new Error('Every orbit mark path must share one scale');
  return {
    side: Number(viewBox[1]),
    artwork: artwork.replace(/>\s+</g, '><'),
    pathScale: [...scales][0]!,
  };
}

/** TAB_WEIGHT as a stroke width in the paths' own units (a stroke adds half on each side). */
function tabStrokeWidth({ side, pathScale }: MarkArtwork): number {
  return Math.round(((TAB_WEIGHT * side) / pathScale) * 100) / 100;
}

/**
 * The SVG favicon: the orbit mark's own viewBox and paths on a transparent
 * ground, coloured by the tab strip's scheme (the middle tone where the query
 * is not evaluated), with TAB_WEIGHT of line below TAB_WEIGHT_MAX_PX.
 */
export function faviconSvg(markSvg: string): string {
  const mark = markArtwork(markSvg);
  const { mark: onDark, markOnLight, markOnAny } = BRAND_ICON_COLORS;
  const style = [
    `svg{color:${markOnAny}}`,
    `@media (prefers-color-scheme:light){svg{color:${markOnLight}}}`,
    `@media (prefers-color-scheme:dark){svg{color:${onDark}}}`,
    `path{stroke:currentColor;stroke-width:${tabStrokeWidth(mark)};stroke-linejoin:round}`,
    `@media (min-width:${TAB_WEIGHT_MAX_PX}px){path{stroke:none}}`,
  ].join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mark.side} ${mark.side}">`,
    `<title>${SITE_NAME}</title>`,
    `<style>${style}</style>`,
    mark.artwork,
    '</svg>',
  ].join('');
}

/**
 * A favicon.ico frame: the tab-weight mark in the middle tone on a
 * transparent ground, as literal attributes (a rasterizer evaluates no scheme).
 */
export function faviconFrameSvg(markSvg: string): string {
  const mark = markArtwork(markSvg);
  const { markOnAny } = BRAND_ICON_COLORS;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mark.side} ${mark.side}">`,
    mark.artwork
      .replaceAll('currentColor', markOnAny)
      .replace(
        /^<g\b/,
        `<g stroke="${markOnAny}" stroke-width="${tabStrokeWidth(mark)}" stroke-linejoin="round"`,
      ),
    '</svg>',
  ].join('');
}

export interface PlateLayout {
  /** The mark's side as a share of the icon's. */
  markShare: number;
  /** Corner radius as a share of the side: 0 is full bleed, for icons the system masks. */
  radius: number;
}

/** The exact orbit mark centred on the Midnight plate, as one vector drawing to rasterize. */
export function plateIconSvg(markSvg: string, { markShare, radius }: PlateLayout): string {
  const { side, artwork } = markArtwork(markSvg);
  const { plate, mark } = BRAND_ICON_COLORS;
  const plateSide = side / markShare;
  const inset = (plateSide - side) / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-inset} ${-inset} ${plateSide} ${plateSide}">`,
    `<rect x="${-inset}" y="${-inset}" width="${plateSide}" height="${plateSide}" rx="${plateSide * radius}" fill="${plate}"/>`,
    artwork.replaceAll('currentColor', mark),
    '</svg>',
  ].join('');
}
