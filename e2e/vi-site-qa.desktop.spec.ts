import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site Vietnamese route QA at release widths. Clash Display lacks most
 * Vietnamese letters (the stacked diacritics ế, ợ, ữ and the horned Ơ/Ư), so
 * headings must resolve to the Onest companion face — the same face and the
 * same `--display-font-stack` swap as Ukrainian (styles/global.css, under
 * `html:lang(vi)`); body copy stays in Inter, whose Vietnamese slice loads on
 * demand.
 */
defineLocaleSiteQa({
  locale: 'vi',
  script: LOCALE_CHROME.vi.script,
  expectedText: LOCALE_ROUTE_TEXT.vi,
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
