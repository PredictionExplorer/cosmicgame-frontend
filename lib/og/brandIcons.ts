import { MIDNIGHT_TOKENS, hslTripletToHex } from './palette';

/**
 * The brand's icon set: which files exist, how each is drawn, and the small
 * mark tab-sized icons use. `npm run brand:icons` (scripts/build-brand-icons.ts)
 * writes the files; the site metadata, the web manifest and the JSON-LD
 * Organization logo reference them through these paths.
 *
 * Every icon is the lavender orbit mark (`--primary`) on the Midnight ground
 * (`--background`), so it reads on light and dark tab strips and launchers
 * alike and matches the header. Tab sizes use a simplified mark (two orbits,
 * three bodies) because the full mark's hairline orbits dissolve below 32px.
 */

/** Increment whenever an icon file is replaced: browsers cache favicons per origin. */
export const BRAND_ICON_VERSION = '20260923';

const versioned = (path: string) => `${path}?v=${BRAND_ICON_VERSION}`;

export const BRAND_ICON_PATHS = {
  /** 16, 32 and 48px frames of the small mark, for browsers without SVG favicons. */
  faviconIco: '/favicon.ico',
  /** The small mark on its plate, scalable; what modern browsers show in the tab. */
  faviconSvg: '/favicon.svg',
  /** iOS home screen and Safari favorites: full-bleed square, the system rounds it. */
  appleTouchIcon: '/apple-touch-icon.png',
  /** Install icons (manifest `purpose: any`): the full mark on a rounded plate. */
  icon192: '/images/brand/icon-192.png',
  icon512: '/images/brand/icon-512.png',
  /** Android adaptive icon (manifest `purpose: maskable`): the mark inside the safe zone. */
  maskable512: '/images/brand/icon-maskable-512.png',
  /** Search-engine Organization logo (JSON-LD): square, opaque, 512px. */
  logo512: '/images/brand/logo-512.png',
} as const;

export const BRAND_ICON_URLS = {
  faviconIco: versioned(BRAND_ICON_PATHS.faviconIco),
  faviconSvg: versioned(BRAND_ICON_PATHS.faviconSvg),
  appleTouchIcon: versioned(BRAND_ICON_PATHS.appleTouchIcon),
} as const;

export const BRAND_ICON_COLORS = {
  plate: hslTripletToHex(MIDNIGHT_TOKENS.background),
  mark: hslTripletToHex(MIDNIGHT_TOKENS.primary),
} as const;

/**
 * The small mark on a rounded Midnight plate, in a 32-unit grid: two orbits
 * (strokes stay above one pixel at 16px) and the three bodies, placed where
 * the full mark has them (upper left, right, lower left).
 */
export function smallMarkSvg(): string {
  const { plate, mark } = BRAND_ICON_COLORS;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">',
    '<title>Cosmic Signature</title>',
    `<rect width="32" height="32" rx="7" fill="${plate}"/>`,
    `<g fill="none" stroke="${mark}" stroke-width="2.3">`,
    '<ellipse cx="16" cy="16" rx="11.8" ry="6.1" transform="rotate(40 16 16)"/>',
    '<ellipse cx="16" cy="16" rx="11.8" ry="6.1" transform="rotate(-22 16 16)"/>',
    '</g>',
    `<g fill="${mark}">`,
    '<circle cx="8.61" cy="7.34" r="3.05"/>',
    '<circle cx="25.83" cy="20.64" r="2.75"/>',
    '<circle cx="14.79" cy="22.74" r="3.25"/>',
    '</g>',
    '</svg>',
  ].join('');
}
