import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site Japanese route QA at release widths. Japanese headings keep Clash
 * Display for Latin glyphs and fall through per glyph to Noto Sans JP
 * (styles/global.css swaps `--cjk-font-stack` under `html:lang(ja)`), never
 * to a Chinese or Korean cut of Noto Sans CJK: their kanji follow other glyph
 * standards and their kana coverage is nominal.
 */
defineLocaleSiteQa({
  locale: 'ja',
  script: LOCALE_CHROME.ja.script,
  expectedText: LOCALE_ROUTE_TEXT.ja,
  // next/font exposes the generated family as `Noto_Sans_JP`; the system
  // fallback that follows it is Hiragino Sans.
  bodyFontFamily: /Noto[ _]Sans[ _]JP|Hiragino/i,
  displayFontFamily: /Noto[ _]Sans[ _]JP|Hiragino/i,
  forbiddenHeadingFontFamily: /Noto[ _]Sans[ _](?:SC|TC|HK|KR)|PingFang|Apple SD Gothic|onest/i,
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
