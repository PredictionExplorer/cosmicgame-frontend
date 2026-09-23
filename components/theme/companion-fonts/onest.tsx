import { Onest } from 'next/font/google';

/**
 * @font-face rules for Onest: Ukrainian (uk) and Vietnamese (vi) display.
 *
 * Loaded only on the pages of the locales that name this face in
 * LOCALE_COMPANION_FONTS (lib/fonts.ts), through CompanionFontFaces. The face
 * is never applied by class: styles/global.css defines the stack variable
 * with the family name this call declares.
 *
 * `subsets` only names slices to preload (none here); Google Fonts serves
 * Onest's Vietnamese slice in the same stylesheet, and next/font self-hosts
 * every slice of that stylesheet when `preload` is off. The option names the
 * Cyrillic and Latin sets because next/font validates it against bundled
 * metadata that predates Onest's Vietnamese coverage.
 */
export const onest = Onest({
  weight: 'variable',
  subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

/** Renders nothing; importing this module is what links the stylesheet. */
export default function CompanionFace() {
  return null;
}
