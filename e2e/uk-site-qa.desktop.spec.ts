import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site Ukrainian route QA at release widths. Clash Display has no
 * Cyrillic glyphs, so headings must resolve to the Onest companion face
 * (styles/global.css swaps the display stack under html[lang='uk']); body
 * copy stays in Inter, whose Cyrillic slices load on demand.
 */
defineLocaleSiteQa({
  locale: 'uk',
  script: LOCALE_CHROME.uk.script,
  expectedText: LOCALE_ROUTE_TEXT.uk,
  // next/font exposes the generated families as `inter`, `onest`, `clashDisplay`.
  bodyFontFamily: /inter/i,
  displayFontFamily: /onest/i,
  forbiddenHeadingFontFamily: /clashDisplay/i,
  unexpectedExactUiCopy: new Set([
    'Signature Allocation',
    'Stellar Selection',
    'Public Goods',
    'Anchor Distribution',
    'Chrono-Warrior',
    'Next cycle',
    'Allocation Tracks',
    'Protocol Configuration',
  ]),
});
