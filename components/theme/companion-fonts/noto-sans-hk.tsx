import { Noto_Sans_HK } from 'next/font/google';

/**
 * @font-face rules for Noto Sans HK: Traditional Chinese, Hong Kong (zh-HK).
 *
 * Loaded only on the pages of the locales that name this face in
 * LOCALE_COMPANION_FONTS (lib/fonts.ts), through CompanionFontFaces. The face
 * is never applied by class: styles/global.css defines the stack variable
 * with the family name this call declares, and that stack names the faces
 * that follow it, so the call declares no `fallback` (next/font would only
 * add it to a class and a variable nothing reads).
 *
 * Google serves the cut as ~100 small `unicode-range` slices and browsers
 * fetch only the ranges a page uses. `subsets: ['latin']` is only validated
 * metadata: nothing is preloaded. `display: 'optional'` avoids a late
 * full-page CJK metric swap on slow links.
 */
export const notoSansHK = Noto_Sans_HK({
  weight: 'variable',
  subsets: ['latin'],
  display: 'optional',
  preload: false,
});

/** Renders nothing; importing this module is what links the stylesheet. */
export default function CompanionFace() {
  return null;
}
