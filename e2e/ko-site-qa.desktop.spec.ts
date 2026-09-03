import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site Korean route QA at release widths. Korean headings keep Clash
 * Display for Latin glyphs and fall through per glyph to Noto Sans KR
 * (styles/global.css swaps `--cjk-font-stack` under `html:lang(ko)`), never
 * to a Chinese cut of Noto Sans CJK, whose Hangul coverage is partial and
 * whose glyph forms follow another standard.
 */
defineLocaleSiteQa({
  locale: 'ko',
  script: LOCALE_CHROME.ko.script,
  expectedText: LOCALE_ROUTE_TEXT.ko,
  // next/font exposes the generated family as `Noto_Sans_KR`; the system
  // fallback that follows it is Apple SD Gothic Neo.
  bodyFontFamily: /Noto[ _]Sans[ _]KR|Apple SD Gothic Neo/i,
  displayFontFamily: /Noto[ _]Sans[ _]KR|Apple SD Gothic Neo/i,
  forbiddenHeadingFontFamily: /Noto[ _]Sans[ _](?:SC|TC|HK)|PingFang|onest/i,
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
