import { darkTheme } from '@rainbow-me/rainbowkit';

/**
 * RainbowKit wallet modal theme aligned with the Cosmic Signature brand.
 *
 * Accent: Aurora Cyan (#00E5FF) — matches hero gradient anchor.
 * Accent foreground: Cosmic Indigo Deep (#0D0521) — maximum contrast
 * against the accent on WCAG AA (~14:1 contrast ratio).
 */
export const cosmicRainbowTheme = darkTheme({
  accentColor: '#00E5FF',
  accentColorForeground: '#0D0521',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});
