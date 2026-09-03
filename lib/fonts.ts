import localFont from 'next/font/local';
import {
  Inter,
  Noto_Sans_HK,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Onest,
} from 'next/font/google';

import type { LocaleRecord } from '@/i18n/locale';

export const clashDisplay = localFont({
  src: [
    {
      path: '../public/fonts/ClashDisplay/fonts/ClashDisplay-Variable.woff2',
      weight: '200 700',
      style: 'normal',
    },
  ],
  variable: '--font-clash-display',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

/**
 * Body face, served through next/font/google: files are downloaded at BUILD
 * time and self-hosted (no runtime Google requests), and — the reason for
 * this setup — automatically subsetted per unicode range. The previous
 * self-hosted full-range variable file carried every script Inter supports
 * at 352 KB and was preloaded on every page, competing with the LCP
 * resources on mobile; the latin subsets total ~50 KB. Chinese text never
 * renders in Inter (it falls through to Noto Sans SC below), so nothing is
 * lost.
 */
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

/**
 * CJK companion face for the Simplified Chinese locale (docs/i18n/README.md §5).
 *
 * Clash Display and Inter carry no CJK glyphs, so Chinese text falls through
 * to this face. Google serves Noto Sans SC as ~100 small `unicode-range`
 * slices; browsers only fetch the ranges a page actually uses, so English
 * pages download nothing. `preload: false` keeps it out of the critical path,
 * while `display: optional` avoids a late full-page CJK metric swap on slow links.
 */
export const notoSansSC = Noto_Sans_SC({
  weight: 'variable',
  subsets: ['latin'],
  variable: '--font-noto-sc',
  display: 'optional',
  preload: false,
  fallback: ['PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
});

/**
 * Traditional Chinese companions. The three Noto Sans CJK cuts share one
 * design but differ in glyph forms: SC follows the mainland standard, TC the
 * Taiwan Ministry of Education standard, HK the Hong Kong 常用字字形表. A
 * Hong Kong reader shown TC forms (or a Taiwan reader shown HK forms) sees
 * text that is legible but subtly "wrong", the typographic equivalent of a
 * foreign accent — so each Traditional locale gets its own cut, swapped in
 * through `--cjk-font-stack` by the `html:lang()` rules in styles/global.css.
 * Same loading policy as Noto Sans SC: unicode-range slices fetched on
 * demand, never preloaded, `display: optional`.
 */
export const notoSansTC = Noto_Sans_TC({
  weight: 'variable',
  subsets: ['latin'],
  variable: '--font-noto-tc',
  display: 'optional',
  preload: false,
  fallback: ['PingFang TC', 'Microsoft JhengHei', 'system-ui', 'sans-serif'],
});

export const notoSansHK = Noto_Sans_HK({
  weight: 'variable',
  subsets: ['latin'],
  variable: '--font-noto-hk',
  display: 'optional',
  preload: false,
  fallback: ['PingFang HK', 'Microsoft JhengHei', 'system-ui', 'sans-serif'],
});

/**
 * Hangul companion for the Korean locale. Noto Sans KR is the Korean cut of
 * Noto Sans CJK, so Korean text falls through per glyph exactly like the
 * Chinese locales do: Latin tokens (ETH, CST, Arbitrum) stay in Clash Display
 * and Inter, Hangul syllables render in Noto Sans KR via `--cjk-font-stack`
 * under `html:lang(ko)` (styles/global.css). Same loading policy as the other
 * CJK cuts; the system fallbacks are the Korean faces macOS and Windows ship.
 */
export const notoSansKR = Noto_Sans_KR({
  weight: 'variable',
  subsets: ['latin'],
  variable: '--font-noto-kr',
  display: 'optional',
  preload: false,
  fallback: ['Apple SD Gothic Neo', 'Malgun Gothic', 'system-ui', 'sans-serif'],
});

/**
 * Japanese companion. Noto Sans JP is the Japanese cut of Noto Sans CJK: its
 * kanji follow the JIS glyph standard (a Japanese reader shown the mainland
 * or Taiwan forms of 直, 骨, or 令 sees text that looks Chinese), and it
 * carries the kana the Chinese cuts only nominally cover. Swapped into
 * `--cjk-font-stack` by `html:lang(ja)` (styles/global.css); same loading
 * policy as the other cuts, with the Japanese faces macOS and Windows ship
 * as system fallbacks.
 */
export const notoSansJP = Noto_Sans_JP({
  weight: 'variable',
  subsets: ['latin'],
  variable: '--font-noto-jp',
  display: 'optional',
  preload: false,
  fallback: [
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Yu Gothic',
    'Meiryo',
    'system-ui',
    'sans-serif',
  ],
});

/**
 * Cyrillic display companion for the Ukrainian locale (docs/i18n/README.md §5).
 *
 * Clash Display carries no Cyrillic glyphs, so `/uk` headings are set in
 * Onest via the `html[lang='uk']` rules in styles/global.css. Body text needs
 * nothing extra: Inter's build-time CSS already declares the `cyrillic` and
 * `cyrillic-ext` `unicode-range` slices (fetched on demand, never preloaded).
 * Same loading policy as Noto Sans SC — `preload: false` keeps it off the
 * critical path of English and Chinese pages, `display: optional` avoids a
 * late heading metric swap on slow links.
 */
export const onest = Onest({
  weight: 'variable',
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
  variable: '--font-onest',
  display: 'optional',
  preload: false,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

/** A next/font face declared with a CSS `variable` (all of the faces above). */
type FontWithVariable = typeof inter;

/**
 * The companion face each locale needs beyond Clash Display + Inter, or
 * `null` when the Latin faces cover its script. Adding a locale to
 * routing.locales fails to compile here until the decision is recorded; the
 * matching `html:lang()` rule in styles/global.css then swaps the face into
 * the right stack (§5), and the locale's site-QA suite asserts it renders.
 */
export const LOCALE_COMPANION_FONTS: LocaleRecord<FontWithVariable | null> = {
  en: null,
  zh: notoSansSC,
  'zh-TW': notoSansTC,
  'zh-HK': notoSansHK,
  uk: onest,
  ko: notoSansKR,
  ja: notoSansJP,
};

/**
 * `className` for `<html>`: every font's CSS-variable class, so each locale's
 * `html:lang()` rule finds its variable defined. Companion faces cost nothing
 * on pages that never use them (`preload: false`, unicode-range slices).
 */
export const FONT_VARIABLE_CLASS_NAMES: string = Array.from(
  new Set(
    [clashDisplay, inter, ...Object.values(LOCALE_COMPANION_FONTS)]
      .filter((font): font is FontWithVariable => font !== null)
      .map((font) => font.variable),
  ),
).join(' ');
