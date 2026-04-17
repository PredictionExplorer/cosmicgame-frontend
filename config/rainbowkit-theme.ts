import { darkTheme } from '@rainbow-me/rainbowkit';

/** Matches app primary (`--primary` ≈ #15BFFD) and dark readable foreground for accents. */
export const cosmicRainbowTheme = darkTheme({
  accentColor: '#15BFFD',
  accentColorForeground: '#0B1028',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});
