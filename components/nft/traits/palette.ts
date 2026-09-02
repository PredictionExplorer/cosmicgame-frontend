/**
 * Colour helpers for trait UI: the three body hues published in the metadata
 * become a per-token "hue strip", and the stellar spectral class is tinted
 * on the conventional O → M colour scale.
 */

import { SPECTRAL_CLASSES, toSpectralClass, type SpectralClass } from '@/lib/nftMetadata';

export { SPECTRAL_CLASSES, toSpectralClass, type SpectralClass };

/** Conventional star colours per class (Harvard sequence), tuned for dark surfaces. */
export const SPECTRAL_CLASS_COLORS: Readonly<Record<SpectralClass, string>> = {
  O: '#9db4ff',
  B: '#b4c8ff',
  A: '#dbe4ff',
  F: '#fbf8ff',
  G: '#fff1c9',
  K: '#ffc98a',
  M: '#ff9c6e',
};

/** CSS colour for a spectral class; muted stellar white for unknown values. */
export function spectralClassColor(value: string | undefined | null): string {
  const spectralClass = toSpectralClass(value);
  return spectralClass ? SPECTRAL_CLASS_COLORS[spectralClass] : 'rgb(var(--stellar-white-rgb))';
}

/** Vivid CSS colour for a body hue in degrees. */
export function hueColor(degrees: number, saturation = 78, lightness = 62): string {
  const hue = ((Math.round(degrees) % 360) + 360) % 360;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

/**
 * Horizontal gradient that shows each body's hue as its own band with soft
 * transitions between them. Returns null when no hues are known.
 */
export function hueStripGradient(hues: readonly number[] | undefined): string | null {
  if (!hues || hues.length === 0) return null;
  if (hues.length === 1) return hueColor(hues[0]!);
  const stops: string[] = [];
  const bandWidth = 100 / hues.length;
  hues.forEach((hue, index) => {
    const color = hueColor(hue);
    const start = index * bandWidth;
    const end = start + bandWidth;
    // Hold each band flat for its middle 60% so the colours read as discrete bodies.
    stops.push(`${color} ${(start + bandWidth * 0.2).toFixed(1)}%`);
    stops.push(`${color} ${(end - bandWidth * 0.2).toFixed(1)}%`);
  });
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

/** The hue used for a card's ambient glow: the first (dominant) body. */
export function dominantHue(hues: readonly number[] | undefined): number | null {
  if (!hues || hues.length === 0) return null;
  return ((Math.round(hues[0]!) % 360) + 360) % 360;
}
