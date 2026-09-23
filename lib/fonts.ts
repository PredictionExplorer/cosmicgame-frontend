import localFont from 'next/font/local';
import { Inter, JetBrains_Mono } from 'next/font/google';

import type { LocaleRecord } from '@/i18n/locale';

/*
 * Font delivery (docs/design-system.md, docs/i18n/README.md §5).
 *
 * Every page loads three faces through next/font, declared here and attached
 * to <html> by app/root-document.tsx:
 *   - Clash Display, the display face (preloaded);
 *   - Inter, the text face (its latin slice preloaded);
 *   - JetBrains Mono, for addresses, hashes and token numbers (not preloaded:
 *     most first views show no identifier above the fold).
 *
 * The per-locale companion faces (the Noto Sans CJK cuts, Onest) are NOT
 * declared in this module. next/font attaches a face's @font-face stylesheet
 * to every page of whatever module graph declares it, and the root layout
 * serves every locale — declaring all six here once made each page carry
 * about 170 KB of render-blocking @font-face CSS for languages it never
 * shows. Each companion lives in its own module under
 * components/theme/companion-fonts/, which CompanionFontFaces loads through
 * next/dynamic only on its own locale's pages, so a Chinese page links only
 * the Noto Sans SC sheet and an English page links none.
 *
 * The descriptors below record which face each locale needs and the family
 * name its @font-face rules declare. styles/global.css names those families
 * in CSS variables (`--font-noto-sc: 'Noto Sans SC'`) that every stack reads,
 * so a variable is always defined even on pages that never load the face.
 */

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
 * time and self-hosted (no runtime Google requests), and automatically
 * subsetted per unicode range. Only the `latin` slice (~48 KB) is preloaded;
 * `latin-ext`, Cyrillic and Vietnamese are still declared in the same
 * stylesheet and download on demand when a page uses those letters, so an
 * English page no longer spends 85 KB of high-priority bandwidth on a slice
 * it rarely touches. Chinese, Japanese and Korean text never renders in Inter
 * (it falls through to --cjk-font-stack).
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

/**
 * Identifier face: addresses, hashes, seeds and token numbers only (never
 * durations or amounts, which are Inter tabular figures). A named web mono
 * replaces `ui-monospace`, which only Safari resolves: elsewhere the generic
 * `monospace` fell back to Courier, and Cyrillic and Vietnamese captions to a
 * serif. It covers Latin, Cyrillic and Vietnamese; `display: swap` without a
 * preload keeps it off the critical path.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
});

/** Every face loaded on every page, in `<html>` class order. */
const DOCUMENT_FONTS = [clashDisplay, inter, jetbrainsMono] as const;

/** Identifies a companion face module in components/theme/companion-fonts/. */
export type CompanionFaceId =
  | 'noto-sans-sc'
  | 'noto-sans-tc'
  | 'noto-sans-hk'
  | 'noto-sans-kr'
  | 'noto-sans-jp'
  | 'onest';

/**
 * A face one or more locales need beyond Clash Display and Inter.
 *
 * `family` is the name its @font-face rules declare (next/font/google keeps
 * the Google family name), `variable` the CSS property styles/global.css
 * defines with that name and the locale's stack reads.
 * lib/__tests__/fonts-policy.test.ts checks all three against the loader
 * module and the stylesheet.
 */
export interface CompanionFace {
  readonly id: CompanionFaceId;
  readonly family: string;
  readonly variable: `--font-${string}`;
}

/**
 * Simplified Chinese. Clash Display and Inter carry no CJK glyphs, so
 * Chinese text falls through to this face. Google serves Noto Sans SC as ~100
 * small `unicode-range` slices, and browsers fetch only the ranges a page
 * uses. Never preloaded; `display: optional` avoids a late full-page CJK
 * metric swap on slow links.
 */
export const notoSansSC: CompanionFace = {
  id: 'noto-sans-sc',
  family: 'Noto Sans SC',
  variable: '--font-noto-sc',
};

/**
 * Traditional Chinese. The three Noto Sans CJK cuts share one design but
 * differ in glyph forms: SC follows the mainland standard, TC the Taiwan
 * Ministry of Education standard, HK the Hong Kong 常用字字形表. A Hong Kong
 * reader shown TC forms (or a Taiwan reader shown HK forms) sees text that is
 * legible but subtly "wrong", so each Traditional locale gets its own cut,
 * swapped in through `--cjk-font-stack` by the `html:lang()` rules in
 * styles/global.css. Same loading policy as Noto Sans SC.
 */
export const notoSansTC: CompanionFace = {
  id: 'noto-sans-tc',
  family: 'Noto Sans TC',
  variable: '--font-noto-tc',
};

export const notoSansHK: CompanionFace = {
  id: 'noto-sans-hk',
  family: 'Noto Sans HK',
  variable: '--font-noto-hk',
};

/**
 * Korean. Noto Sans KR is the Korean cut of Noto Sans CJK, so Hangul falls
 * through per glyph exactly like Chinese does: Latin tokens (ETH, CST,
 * Arbitrum) stay in Clash Display and Inter, Hangul syllables render in Noto
 * Sans KR via `--cjk-font-stack` under `html:lang(ko)`.
 */
export const notoSansKR: CompanionFace = {
  id: 'noto-sans-kr',
  family: 'Noto Sans KR',
  variable: '--font-noto-kr',
};

/**
 * Japanese. Noto Sans JP's kanji follow the JIS glyph standard (a Japanese
 * reader shown the mainland or Taiwan forms of 直, 骨 or 令 sees text that
 * looks Chinese), and it carries the kana the Chinese cuts only nominally
 * cover. Swapped into `--cjk-font-stack` by `html:lang(ja)`.
 */
export const notoSansJP: CompanionFace = {
  id: 'noto-sans-jp',
  family: 'Noto Sans JP',
  variable: '--font-noto-jp',
};

/**
 * Display companion for the alphabetic locales Clash Display cannot set:
 * Ukrainian and Vietnamese. Clash Display carries no Cyrillic glyphs and only
 * 44 of the 132 letters Vietnamese writes (none of the stacked-diacritic
 * forms ế, ợ, ữ, nor Ơ/Ư), so `/uk` and `/vi` headings are set in Onest,
 * swapped in by the `html:lang(uk), html:lang(vi)` rule in styles/global.css.
 * Body text needs nothing extra: Inter's stylesheet declares its Cyrillic and
 * Vietnamese slices. Onest is small, so it uses `display: swap` rather than
 * `optional`: every heading on the page ends in the same face instead of the
 * hero staying in the fallback while later headings pick Onest up.
 */
export const onest: CompanionFace = {
  id: 'onest',
  family: 'Onest',
  variable: '--font-onest',
};

/**
 * The companion face each locale needs beyond Clash Display + Inter, or
 * `null` when the Latin faces cover its script. Adding a locale to
 * routing.locales fails to compile here until the decision is recorded; the
 * matching `html:lang()` rule in styles/global.css then swaps the face into
 * the right stack (§5), CompanionFontFaces loads its @font-face rules on that
 * locale's pages, and the locale's site-QA suite asserts it renders.
 */
export const LOCALE_COMPANION_FONTS: LocaleRecord<CompanionFace | null> = {
  en: null,
  zh: notoSansSC,
  'zh-TW': notoSansTC,
  'zh-HK': notoSansHK,
  uk: onest,
  ko: notoSansKR,
  ja: notoSansJP,
  vi: onest,
};

/**
 * `className` for `<html>`: the CSS-variable class of every face loaded on
 * every page. Companion faces need no class: styles/global.css defines their
 * variables unconditionally, and their @font-face rules arrive only on the
 * locale pages that use them.
 */
export const FONT_VARIABLE_CLASS_NAMES: string = DOCUMENT_FONTS.map((font) => font.variable).join(
  ' ',
);
