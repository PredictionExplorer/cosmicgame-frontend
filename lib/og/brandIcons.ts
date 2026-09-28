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
 * (the file BrandMark masks), in the header's lavender (`--primary`); none is
 * redrawn or simplified, so the tab shows the logo the page shows.
 *
 * - The SVG favicon, what current browsers put in the tab, is the bare mark,
 *   as the header draws it. Tab strips are light or dark, so it follows
 *   `prefers-color-scheme`: the header's lavender on a dark strip, and a
 *   deeper tone of the same hue on a light one, where the lavender would
 *   vanish (1.4:1 on white).
 * - Raster icons cannot adapt, so each one sets the mark on the Midnight
 *   ground (`--background`), as the header does.
 */

/**
 * The icon set's content hash, written by `npm run brand:icons`: replaced
 * files get new URLs, so browsers and installed apps that cached the old icons
 * fetch them again. lib/og/__tests__/brandIcons.test.ts fails when the files
 * and this hash disagree.
 */
export const BRAND_ICON_VERSION = 'd2072b9cd5';

const versioned = (path: string) => `${path}?v=${BRAND_ICON_VERSION}`;

export const BRAND_ICON_PATHS = {
  /** 16, 32 and 48px frames on the plate, for browsers without SVG favicons. */
  faviconIco: '/favicon.ico',
  /** The bare mark, scalable and scheme-aware; what current browsers show in the tab. */
  faviconSvg: '/favicon.svg',
  /** iOS home screen and Safari favorites: full-bleed square, the system rounds it. */
  appleTouchIcon: '/apple-touch-icon.png',
  /** Install icons (manifest `purpose: any`): the mark on a rounded plate. */
  icon192: '/images/brand/icon-192.png',
  icon512: '/images/brand/icon-512.png',
  /** Android adaptive icon (manifest `purpose: maskable`): the mark inside the safe zone. */
  maskable512: '/images/brand/icon-maskable-512.png',
  /**
   * Search-engine Organization logo (JSON-LD) and the CST token image wallets
   * list (`wallet_watchAsset`): square, opaque, 512px, the mark clear of the
   * circle wallets crop token icons to.
   */
  logo512: '/images/brand/logo-512.png',
} as const;

/**
 * The CST token image before logo512, the 2023 cyan mark. Wallets keep the
 * image URL they were given when CST was added, so the file stays, redrawn as
 * logo512 in SVG. Outside BRAND_ICON_PATHS: nothing links it with a version.
 */
export const LEGACY_CST_IMAGE_PATH = '/images/logo2.svg';

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

/** The primary's hue at a depth that reads on light tab strips (4.5:1 or more on white). */
const MARK_ON_LIGHT = `${MIDNIGHT_TOKENS.primary.split(' ')[0]} 60% 50%`;

export const BRAND_ICON_COLORS = {
  /** The Midnight ground (`--background`) under every raster icon. */
  plate: hslTripletToHex(MIDNIGHT_TOKENS.background),
  /** The header's lavender (`--primary`): the mark on the plate and on dark tab strips. */
  mark: hslTripletToHex(MIDNIGHT_TOKENS.primary),
  /** The favicon's mark on light tab strips. */
  markOnLight: hslTripletToHex(MARK_ON_LIGHT),
} as const;

interface MarkArtwork {
  /** The mark's square viewBox side, in its own units. */
  side: number;
  /** Its `<g>` of paths, filled with `currentColor`. */
  artwork: string;
}

/** The artwork of the orbit mark's source (public/images/brand/orbit-mark.svg). */
function markArtwork(markSvg: string): MarkArtwork {
  const viewBox = /\bviewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(markSvg);
  const artwork = /<g\b[\s\S]*<\/g>/.exec(markSvg)?.[0];
  if (!viewBox || viewBox[1] !== viewBox[2] || !artwork?.includes('currentColor')) {
    throw new Error('The orbit mark must be a square viewBox with a <g> in currentColor');
  }
  return { side: Number(viewBox[1]), artwork: artwork.replace(/>\s+</g, '><') };
}

/**
 * The SVG favicon: the orbit mark's own viewBox and paths on no plate, in the
 * header's lavender on dark tab strips and in `markOnLight` everywhere else
 * (the default, so a renderer that ignores the media query still gets a mark
 * that reads on white).
 */
export function faviconSvg(markSvg: string): string {
  const { side, artwork } = markArtwork(markSvg);
  const { mark, markOnLight } = BRAND_ICON_COLORS;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}">`,
    `<title>${SITE_NAME}</title>`,
    `<style>svg{color:${markOnLight}}@media (prefers-color-scheme:dark){svg{color:${mark}}}</style>`,
    artwork,
    '</svg>',
  ].join('');
}

export interface PlateLayout {
  /** The mark's side as a share of the icon's. */
  markShare: number;
  /** Corner radius as a share of the side: 0 is full bleed, for icons the system masks. */
  radius: number;
}

/**
 * logo512 and the legacy CST image: full bleed, the mark small enough that a
 * circular crop leaves a ring of plate around it.
 */
export const LOGO_LAYOUT: PlateLayout = { markShare: 0.66, radius: 0 };

/** The orbit mark centred on the Midnight plate, as one vector drawing to rasterize. */
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
