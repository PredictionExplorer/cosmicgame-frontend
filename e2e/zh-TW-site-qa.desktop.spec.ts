import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site Taiwan route QA at release widths. Chinese headings keep Clash
 * Display for Latin glyphs and fall through per glyph to the locale's Noto
 * Sans cut; for Taiwan that must be the TC cut (styles/global.css swaps
 * `--cjk-font-stack` under `html:lang(zh-TW)`), never the Simplified SC face,
 * whose glyph forms follow the mainland standard.
 */
defineLocaleSiteQa({
  locale: 'zh-TW',
  script: LOCALE_CHROME['zh-TW'].script,
  expectedText: LOCALE_ROUTE_TEXT['zh-TW'],
  // next/font exposes the generated families as `Noto_Sans_TC`; the system
  // fallback that follows it is PingFang TC.
  bodyFontFamily: /Noto[ _]Sans[ _]TC|PingFang TC/i,
  displayFontFamily: /Noto[ _]Sans[ _]TC|PingFang TC/i,
  forbiddenHeadingFontFamily: /Noto[ _]Sans[ _](?:SC|HK)|PingFang (?:SC|HK)/i,
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
