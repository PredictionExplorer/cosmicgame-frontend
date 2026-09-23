import { Noto_Sans_SC } from 'next/font/google';

/**
 * @font-face rules for Noto Sans SC: Simplified Chinese (zh).
 *
 * Loaded only on the pages of the locales that name this face in
 * LOCALE_COMPANION_FONTS (lib/fonts.ts), through CompanionFontFaces. The face
 * is never applied by class: styles/global.css defines the stack variable
 * with the family name this call declares.
 *
 * Google serves the cut as ~100 small `unicode-range` slices and browsers
 * fetch only the ranges a page uses. `subsets: ['latin']` is only validated
 * metadata: nothing is preloaded. `display: 'optional'` avoids a late
 * full-page CJK metric swap on slow links.
 */
export const notoSansSC = Noto_Sans_SC({
  weight: 'variable',
  subsets: ['latin'],
  display: 'optional',
  preload: false,
  fallback: ['PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
});

/** Renders nothing; importing this module is what links the stylesheet. */
export default function CompanionFace() {
  return null;
}
