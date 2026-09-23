import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { SITE_THEMES, type SiteTheme } from '@/lib/theme/config';

/**
 * Every palette in styles/themes.css meets WCAG 2.2 AA with the tokens the
 * design system tells components to use (docs/design-system.md):
 *
 *   text      foreground, muted-foreground, subtle-foreground, the status
 *             hues and the data series: 4.5:1 on every surface text sits on
 *   controls  --input (field and segment boundaries) and --ring (focus):
 *             3:1 on every surface a control sits on (1.4.11)
 *   labels    primary-foreground on primary and on the far end of the
 *             signature gradient; white on the destructive fill
 *
 * The stylesheet is parsed, not mocked: a value edited in themes.css is the
 * value tested here.
 */

type Rgb = readonly [number, number, number];

const THEMES_CSS = readFileSync(resolve(__dirname, '..', 'themes.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

interface Block {
  selectors: string[];
  declarations: Map<string, string>;
}

const blocks: Block[] = [...THEMES_CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selectors: match[1]!.split(',').map((selector) => selector.trim()),
  declarations: new Map(
    [...match[2]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1]!, d[2]!.trim()]),
  ),
}));

/**
 * The custom properties a `[data-palette='<theme>']` scope resolves, in
 * cascade order: shared `[data-palette]` blocks and the palette's own block,
 * later declarations winning among equal selectors, the palette's own block
 * always outranking the shared ones (it is more specific on :root).
 */
function paletteTokens(theme: SiteTheme): Map<string, string> {
  const tokens = new Map<string, string>();
  const shared = blocks.filter((block) => block.selectors.includes('[data-palette]'));
  const own = blocks.filter((block) => block.selectors.includes(`[data-palette='${theme}']`));
  expect(own).toHaveLength(1);
  for (const block of [...shared, ...own]) {
    for (const [name, value] of block.declarations) tokens.set(name, value);
  }
  return tokens;
}

function resolveToken(tokens: Map<string, string>, name: string, depth = 0): string {
  const value = tokens.get(name);
  if (value === undefined) throw new Error(`${name} is not declared`);
  const alias = /^var\((--[\w-]+)\)$/.exec(value);
  if (!alias) return value;
  if (depth > 8) throw new Error(`${name} aliases too deeply`);
  return resolveToken(tokens, alias[1]!, depth + 1);
}

/** `233 33% 5%` → sRGB channels in 0..1. */
function hslChannels(value: string): Rgb {
  const parts = value.split(/\s+/).map((part) => Number.parseFloat(part));
  const [hue, saturation, lightness] = parts;
  if (parts.length !== 3 || [hue, saturation, lightness].some((n) => !Number.isFinite(n))) {
    throw new Error(`Not an HSL channel triplet: ${value}`);
  }
  const s = saturation! / 100;
  const l = lightness! / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue! / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

function luminance([r, g, b]: Rgb): number {
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

function hueOf(value: string): number {
  return Number.parseFloat(value.split(/\s+/)[0]!);
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const SURFACES = ['--background', '--card', '--popover', '--muted'] as const;
const CONTROL_SURFACES = ['--background', '--card', '--popover'] as const;
const TEXT_TOKENS = [
  '--foreground',
  '--muted-foreground',
  '--subtle-foreground',
  '--positive',
  '--attention',
  '--critical',
] as const;
const DATA_SERIES = Array.from({ length: 8 }, (_, i) => `--data-${i + 1}`);
const STATUS = ['--positive', '--attention', '--critical'] as const;
/** The one status hue a palette may keep near its accent (see the test). */
const ACCENT_ADJACENT_STATUS: Partial<Record<SiteTheme, (typeof STATUS)[number]>> = {
  ember: '--attention',
};

describe.each(SITE_THEMES)('%s palette', (theme) => {
  const tokens = paletteTokens(theme);
  const color = (name: string) => hslChannels(resolveToken(tokens, name));

  it.each(TEXT_TOKENS.flatMap((text) => SURFACES.map((surface) => [text, surface] as const)))(
    '%s reads at 4.5:1 or more on %s',
    (text, surface) => {
      expect(contrast(color(text), color(surface))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps the three text tiers in order', () => {
    const on = color('--background');
    const foreground = contrast(color('--foreground'), on);
    const muted = contrast(color('--muted-foreground'), on);
    const subtle = contrast(color('--subtle-foreground'), on);
    expect(foreground).toBeGreaterThan(muted);
    expect(muted).toBeGreaterThan(subtle);
  });

  it.each(DATA_SERIES.flatMap((series) => SURFACES.map((surface) => [series, surface] as const)))(
    '%s reads at 4.5:1 or more on %s',
    (series, surface) => {
      expect(contrast(color(series), color(surface))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(
    ['--input', '--ring'].flatMap((control) =>
      CONTROL_SURFACES.map((surface) => [control, surface] as const),
    ),
  )('%s meets 3:1 as a control boundary on %s', (control, surface) => {
    expect(contrast(color(control), color(surface))).toBeGreaterThanOrEqual(3);
  });

  it('keeps button labels readable across the whole signature gradient', () => {
    const label = color('--primary-foreground');
    expect(contrast(label, color('--primary'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(label, color('--secondary'))).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(color('--destructive-foreground'), color('--destructive')),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(STATUS)('%s stays distinct from the palette accent', (status) => {
    // A status hue next to the accent reads as decoration, not as state, so
    // it sits 30 degrees or more away. Ember is the documented exception:
    // no yellow is 30 degrees from its champagne primary and still reads as
    // "attention", so its attention is brighter and more saturated instead
    // (and, like every attention state, always carries an icon and a word).
    const [statusHue, statusSaturation, statusLightness] = resolveToken(tokens, status)
      .split(/\s+/)
      .map((part) => Number.parseFloat(part)) as [number, number, number];
    const [primaryHue, primarySaturation, primaryLightness] = resolveToken(tokens, '--primary')
      .split(/\s+/)
      .map((part) => Number.parseFloat(part)) as [number, number, number];
    const distinct =
      hueDistance(statusHue, primaryHue) >= 30 ||
      (ACCENT_ADJACENT_STATUS[theme] === status &&
        Math.abs(statusLightness - primaryLightness) >= 10 &&
        statusSaturation > primarySaturation);
    expect({ status, distinct }).toEqual({ status, distinct: true });
  });

  it('never uses red as a data series', () => {
    for (const series of DATA_SERIES) {
      const hue = hueOf(resolveToken(tokens, series));
      expect({ series, red: hueDistance(hue, 0) < 12 }).toEqual({ series, red: false });
    }
  });
});

describe('palette structure', () => {
  it('declares the same raw tokens in every palette block', () => {
    const own = (theme: SiteTheme) =>
      [
        ...blocks
          .find((block) => block.selectors.includes(`[data-palette='${theme}']`))!
          .declarations.keys(),
      ].filter((name) => !['--positive', '--attention', '--critical'].includes(name));
    const reference = own('midnight').sort();
    for (const theme of SITE_THEMES) expect(own(theme).sort()).toEqual(reference);
  });

  it('declares palette overrides of the status hues after their defaults', () => {
    // `[data-palette='aurora']` and `[data-palette]` have equal specificity,
    // so a preview swatch only picks up Aurora's own --positive when the
    // palette block comes later in the file.
    const defaults = THEMES_CSS.indexOf('--positive: 152');
    const aurora = THEMES_CSS.indexOf("[data-palette='aurora']");
    expect(defaults).toBeGreaterThan(-1);
    expect(defaults).toBeLessThan(aurora);
  });
});
