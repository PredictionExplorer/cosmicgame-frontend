import localFont from 'next/font/local';
import { Noto_Sans_SC } from 'next/font/google';

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

export const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter/fonts/InterVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
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
 * pages download nothing. `preload: false` keeps it out of the critical path.
 */
export const notoSansSC = Noto_Sans_SC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sc',
  display: 'swap',
  preload: false,
  fallback: ['PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
});
