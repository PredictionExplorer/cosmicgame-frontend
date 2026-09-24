/**
 * The Midnight palette as literal colors, for surfaces that cannot read CSS
 * custom properties: share cards (Satori resolves no `var()`), the generated
 * icons, and the web manifest.
 *
 * `MIDNIGHT_TOKENS` mirrors the `:root, [data-palette='midnight']` block of
 * styles/themes.css channel for channel (HSL triplets, the same notation the
 * stylesheet uses); lib/og/__tests__/palette.test.ts fails when either side
 * drifts. Everything else here is derived from those triplets.
 */

/** Midnight tokens used off the page, in the stylesheet's `H S% L%` notation. */
export const MIDNIGHT_TOKENS = {
  background: '233 33% 5%',
  surfaceDeep: '240 29% 3%',
  foreground: '250 38% 97%',
  mutedForeground: '247 14% 75%',
  primary: '254 100% 92%',
  border: '246 14% 19%',
  glowPrimary: '245 70% 65%',
  glowSecondary: '270 65% 60%',
} as const;

export type MidnightToken = keyof typeof MIDNIGHT_TOKENS;

/**
 * Third text tier of the calibrated palette (the `--subtle-foreground`
 * token the design direction adds for Midnight): 6.6:1 on the ground, for
 * eyebrows, wall labels and the footer. Kept here until the stylesheet
 * carries it; it is not part of the themes.css parity check.
 */
export const MIDNIGHT_SUBTLE_FOREGROUND = '247 12% 62%';

interface Hsl {
  hue: number;
  saturation: number;
  lightness: number;
}

function parseHslTriplet(triplet: string): Hsl {
  const match = /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/.exec(triplet.trim());
  if (!match) throw new Error(`Not an "H S% L%" triplet: ${triplet}`);
  return {
    hue: Number(match[1]),
    saturation: Number(match[2]) / 100,
    lightness: Number(match[3]) / 100,
  };
}

function hslToRgb({ hue, saturation, lightness }: Hsl): [number, number, number] {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = (((hue % 360) + 360) % 360) / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [r, g, b] =
    sector < 1
      ? [chroma, second, 0]
      : sector < 2
        ? [second, chroma, 0]
        : sector < 3
          ? [0, chroma, second]
          : sector < 4
            ? [0, second, chroma]
            : sector < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];
  const offset = lightness - chroma / 2;
  return [r, g, b].map((channel) => Math.round((channel + offset) * 255)) as [
    number,
    number,
    number,
  ];
}

/** `233 33% 5%` → `#090A11`. */
export function hslTripletToHex(triplet: string): string {
  return `#${hslToRgb(parseHslTriplet(triplet))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

/** `245 70% 65%`, 0.17 → `rgba(…, 0.17)`. */
export function hslTripletToRgba(triplet: string, alpha: number): string {
  const [r, g, b] = hslToRgb(parseHslTriplet(triplet));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Pure black: the plate every artwork hangs on (`--art-ground`). */
export const ART_PLATE = '#000000';

/** Literal colors of the Midnight share-card family. */
export const OG_COLORS = {
  ground: hslTripletToHex(MIDNIGHT_TOKENS.background),
  plate: ART_PLATE,
  text: hslTripletToHex(MIDNIGHT_TOKENS.foreground),
  muted: hslTripletToHex(MIDNIGHT_TOKENS.mutedForeground),
  subtle: hslTripletToHex(MIDNIGHT_SUBTLE_FOREGROUND),
  mark: hslTripletToHex(MIDNIGHT_TOKENS.primary),
  rule: hslTripletToHex(MIDNIGHT_TOKENS.border),
} as const;

/**
 * The page's `--gradient-atmosphere` (styles/themes.css) at the strength a
 * 1200×630 card needs to read at thumbnail size: the same two glows, top-left
 * and top-right, over the Midnight ground.
 */
export const OG_ATMOSPHERE =
  `radial-gradient(75% 65% at 6% 0%, ${hslTripletToRgba(MIDNIGHT_TOKENS.glowPrimary, 0.17)} 0%, transparent 72%), ` +
  `radial-gradient(65% 60% at 96% 12%, ${hslTripletToRgba(MIDNIGHT_TOKENS.glowSecondary, 0.22)} 0%, transparent 72%)`;
