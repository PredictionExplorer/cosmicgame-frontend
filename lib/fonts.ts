import localFont from 'next/font/local';
import { Inter, Noto_Sans_SC, Onest } from 'next/font/google';

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
 * CJK companion face for the Chinese locale (docs/i18n/README.md §5).
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
