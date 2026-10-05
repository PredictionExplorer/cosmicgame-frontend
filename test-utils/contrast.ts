/** WCAG 2.2 contrast, for suites that pin a colour's legibility. */

/** sRGB channels in 0..1. */
export type Rgb = readonly [number, number, number];

/** `#5733CC` → sRGB channels in 0..1. */
export function hexChannels(hex: string): Rgb {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Not a #RRGGBB colour: ${hex}`);
  return [match[1]!, match[2]!, match[3]!].map((pair) => Number.parseInt(pair, 16) / 255) as [
    number,
    number,
    number,
  ];
}

function luminance([r, g, b]: Rgb): number {
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** The WCAG contrast ratio of two colours, 1 to 21, in either order. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
