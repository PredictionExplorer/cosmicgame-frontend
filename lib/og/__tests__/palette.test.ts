import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  MIDNIGHT_TOKENS,
  OG_ATMOSPHERE,
  OG_COLORS,
  hslTripletToHex,
  hslTripletToRgba,
} from '@/lib/og/palette';

/** `--name: value;` declarations of the Midnight block of styles/themes.css. */
function midnightDeclarations(): Map<string, string> {
  const css = readFileSync(join(process.cwd(), 'styles', 'themes.css'), 'utf8');
  const block = /:root,\s*\[data-palette='midnight'\]\s*\{([^}]*)\}/.exec(css)?.[1];
  if (!block) throw new Error('Midnight palette block not found in styles/themes.css');
  return new Map(
    Array.from(block.matchAll(/--([\w-]+):\s*([^;]+);/g), ([, name = '', value = '']) => [
      name,
      value.trim(),
    ]),
  );
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

describe('Midnight share-card palette', () => {
  it.each(Object.entries(MIDNIGHT_TOKENS))('--%s mirrors styles/themes.css', (name, value) => {
    expect(midnightDeclarations().get(kebab(name))).toBe(value);
  });

  it('paints the ground, text and mark in the page’s own colours', () => {
    expect(OG_COLORS.ground).toBe('#090A11');
    expect(OG_COLORS.plate).toBe('#000000');
    expect(OG_COLORS.mark).toBe(hslTripletToHex(MIDNIGHT_TOKENS.primary));
    expect(OG_COLORS.text).toBe(hslTripletToHex(MIDNIGHT_TOKENS.foreground));
  });

  // F159: the cards used the retired violet/cyan/rose deep-space gradient.
  it('carries no trace of the retired gradient', () => {
    const paint = `${OG_ATMOSPHERE}${Object.values(OG_COLORS).join('')}`;
    for (const retired of ['#0D0521', '#1A0B3E', '0, 229, 255', '255, 61, 138', '108, 60, 225']) {
      expect(paint).not.toContain(retired);
    }
    expect(OG_ATMOSPHERE).toContain(hslTripletToRgba(MIDNIGHT_TOKENS.glowPrimary, 0.17));
    expect(OG_ATMOSPHERE).toContain(hslTripletToRgba(MIDNIGHT_TOKENS.glowSecondary, 0.22));
  });

  it('converts HSL triplets exactly', () => {
    expect(hslTripletToHex('0 0% 100%')).toBe('#FFFFFF');
    expect(hslTripletToHex('0 100% 50%')).toBe('#FF0000');
    expect(hslTripletToHex('240 100% 25%')).toBe('#000080');
    expect(hslTripletToRgba('120 100% 50%', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
    expect(() => hslTripletToHex('not a colour')).toThrow();
  });

  it('keeps every text colour readable on the ground (WCAG AA)', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((index) => {
        const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const contrast = (a: string, b: string) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light! + 0.05) / (dark! + 0.05);
    };
    for (const text of [OG_COLORS.text, OG_COLORS.muted, OG_COLORS.subtle, OG_COLORS.mark]) {
      expect(contrast(text, OG_COLORS.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text, OG_COLORS.plate)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
