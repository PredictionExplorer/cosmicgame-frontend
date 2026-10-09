import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { GESTURE_METHOD_COLOR } from '@/lib/theme/dataColors';

import { SERIES_COLOR } from '../theme';

const themes = readFileSync(
  resolve(__dirname, '..', '..', '..', '..', 'styles', 'themes.css'),
  'utf8',
);

/**
 * The `--data-N` hue a series colour resolves to, following token aliases.
 * A palette-tinted neutral (`color-mix(… hsl(var(--data-8)) …, hsl(var(--primary)))`)
 * resolves through its first, data token.
 */
function dataHue(color: string): string {
  let token =
    /^hsl\(var\((--[a-z0-9-]+)\)\)$/.exec(color)?.[1] ??
    /^color-mix\(in oklab, hsl\(var\((--data-\d)\)\) \d+%, hsl\(var\(--primary\)\)\)$/.exec(
      color,
    )?.[1];
  for (let hops = 0; token && !/^--data-\d$/.test(token) && hops < 4; hops++) {
    token = new RegExp(`^\\s*${token}: var\\((--[a-z0-9-]+)\\);$`, 'm').exec(themes)?.[1];
  }
  if (!token) throw new Error(`${color} does not resolve to a data series`);
  return token;
}

describe('statistics series colours', () => {
  const methodHues = new Set(Object.values(GESTURE_METHOD_COLOR).map(dataHue));

  it.each(['gestures', 'lead', 'endurance', 'chrono'] as const)(
    'draws %s in a hue no gesture method uses, so a colour keeps one meaning on the activity page',
    (series) => {
      expect(methodHues.has(dataHue(SERIES_COLOR[series]))).toBe(false);
    },
  );

  it('tints the neutral series toward the palette, so it never reads as disabled', () => {
    // Regression: a fixed cool grey in every palette clashed with Ember and Aurora.
    expect(SERIES_COLOR.gestures).toMatch(/^color-mix\(in oklab, hsl\(var\(--data-8\)\) \d+%/);
    expect(SERIES_COLOR.gestures).toContain('hsl(var(--primary))');
    expect(SERIES_COLOR.lead).toBe(SERIES_COLOR.gestures);
  });

  it('tells the Endurance Champion and the Chrono-Warrior apart from every lead', () => {
    const hues = (['lead', 'endurance', 'chrono'] as const).map((key) =>
      dataHue(SERIES_COLOR[key]),
    );
    expect(new Set(hues).size).toBe(3);
  });
});
