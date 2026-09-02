import { LOCALE_CHROME, LOCALE_ROUTE_TEXT } from './locale-fixtures';
import { defineLocaleSiteQa } from './locale-site-qa';

/**
 * Full-site Hong Kong route QA at release widths. Headings fall through per
 * glyph to the HK cut of Noto Sans (styles/global.css swaps `--cjk-font-stack`
 * under `html:lang(zh-HK)`); the Simplified and Taiwan cuts must not lead,
 * since Hong Kong glyph forms differ from both.
 */
defineLocaleSiteQa({
  locale: 'zh-HK',
  script: LOCALE_CHROME['zh-HK'].script,
  expectedText: LOCALE_ROUTE_TEXT['zh-HK'],
  bodyFontFamily: /Noto[ _]Sans[ _]HK|PingFang HK/i,
  displayFontFamily: /Noto[ _]Sans[ _]HK|PingFang HK/i,
  forbiddenHeadingFontFamily: /Noto[ _]Sans[ _](?:SC|TC)|PingFang (?:SC|TC)/i,
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
