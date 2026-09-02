/** Spectral classes from hottest to coolest (Harvard sequence). */
export const SPECTRAL_CLASSES = ['O', 'B', 'A', 'F', 'G', 'K', 'M'] as const;

/** A recognised spectral class letter. */
export type SpectralClass = (typeof SPECTRAL_CLASSES)[number];

/** Normalizes a wire spectral-class value to a known letter, or null. */
export function toSpectralClass(value: string | undefined | null): SpectralClass | null {
  if (!value) return null;
  const letter = value.trim().charAt(0).toUpperCase();
  return (SPECTRAL_CLASSES as readonly string[]).includes(letter)
    ? (letter as SpectralClass)
    : null;
}
