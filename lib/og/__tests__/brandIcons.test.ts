/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

import { contrastRatio, hexChannels } from '@/test-utils/contrast';
import { brandIconDigest } from '@/scripts/brand-icon-digest';
import { decodeIco } from '@/scripts/ico';

import {
  BRAND_ICON_COLORS,
  BRAND_ICON_PATHS,
  BRAND_ICON_URLS,
  BRAND_ICON_VERSION,
  TAB_WEIGHT,
  TAB_WEIGHT_MAX_PX,
  faviconFrameSvg,
  faviconSvg,
  plateIconSvg,
} from '@/lib/og/brandIcons';
import { MIDNIGHT_TOKENS, hslTripletToHex } from '@/lib/og/palette';

const PUBLIC = join(process.cwd(), 'public');
const publicFile = (path: string) => readFileSync(join(PUBLIC, path));

const MARK_PATH = '/images/brand/orbit-mark.svg';
const MARK = publicFile(MARK_PATH).toString('utf8');
const FAVICON = publicFile(BRAND_ICON_PATHS.faviconSvg).toString('utf8');

/** Every path's `d` attribute, in document order. */
const pathData = (svg: string) => [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((m) => m[1]);

/** Width, height and colour type from a PNG's IHDR chunk. */
function pngHeader(png: Buffer) {
  expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    colorType: png.readUInt8(25),
  };
}

const RGB = 2;
const RGBA = 6;

/**
 * Tab strips a favicon sits on: Chrome's and Firefox's light tab and frame,
 * and their dark frames and tabs (Firefox's selected dark tab is the lightest).
 */
const LIGHT_STRIPS = ['#FFFFFF', '#F0F0F4', '#DEE1E6'];
const DARK_STRIPS = ['#202124', '#35363A', '#42414D'];

const contrastOn = (color: string, strips: readonly string[]) =>
  Math.min(...strips.map((strip) => contrastRatio(hexChannels(color), hexChannels(strip))));

/** `--primary`'s hue and saturation at `lightness`, as BRAND_ICON_COLORS derives its tones. */
const primaryAt = (lightness: number) => {
  const [hue, saturation] = MIDNIGHT_TOKENS.primary.split(' ');
  return hslTripletToHex(`${hue} ${saturation} ${lightness}%`);
};

describe('brand icon set (npm run brand:icons)', () => {
  it('colours every icon with tones of the header’s lavender', () => {
    expect(BRAND_ICON_COLORS).toEqual({
      plate: hslTripletToHex(MIDNIGHT_TOKENS.background),
      mark: hslTripletToHex(MIDNIGHT_TOKENS.primary),
      markOnLight: primaryAt(60),
      markOnAny: primaryAt(71),
    });
    expect(BRAND_ICON_COLORS).toEqual({
      plate: '#090A11',
      mark: '#E0D6FF',
      markOnLight: '#6333FF',
      markOnAny: '#8E6BFF',
    });
  });

  // The header's lavender is 1.4:1 on white, so a light strip takes a deeper
  // tone. Text-grade 4.5:1 on white and 3:1 (non-text, WCAG 1.4.11) anywhere.
  it('gives each colour scheme a tone that reads on its tab strips', () => {
    const { mark, markOnLight } = BRAND_ICON_COLORS;
    expect(contrastOn(markOnLight, ['#FFFFFF'])).toBeGreaterThan(4.5);
    expect(contrastOn(markOnLight, LIGHT_STRIPS)).toBeGreaterThan(3);
    expect(contrastOn(mark, DARK_STRIPS)).toBeGreaterThan(4.5);
  });

  // No tone reaches 3:1 on white and on Firefox's grey dark tab alike; the
  // unknown-scheme tone is the one whose worst strip is least bad.
  it('gives an unknown scheme the tone with the best worst-case contrast', () => {
    const strips = [...LIGHT_STRIPS, ...DARK_STRIPS];
    const worst = (lightness: number) => contrastOn(primaryAt(lightness), strips);
    const best = Array.from({ length: 56 }, (_, i) => 40 + i).reduce((a, b) =>
      worst(b) > worst(a) ? b : a,
    );
    expect(BRAND_ICON_COLORS.markOnAny).toBe(primaryAt(best));
    expect(contrastOn(BRAND_ICON_COLORS.markOnAny, strips)).toBeGreaterThan(2.7);
  });

  it('draws the header’s own artwork: BrandMark masks the file every icon is made from', () => {
    const brandMarkCss = readFileSync(
      join(process.cwd(), 'components', 'layout', 'BrandMark.module.css'),
      'utf8',
    );
    const masks = [...brandMarkCss.matchAll(/mask:\s*url\('([^']+)'\)/g)].map((m) => m[1]);
    expect(masks).toEqual([MARK_PATH, MARK_PATH]);
  });

  // F227 drew thin cyan strokes (2.1:1 on white); the first lavender favicon
  // was a redrawn two-orbit stand-in on a near-black plate, not the logo.
  describe('favicon.svg', () => {
    it('is the orbit mark itself on a transparent ground', () => {
      expect(FAVICON.trim()).toBe(faviconSvg(MARK));
      expect(pathData(FAVICON)).toEqual(pathData(MARK));
      expect(pathData(FAVICON)).toHaveLength(7);
      expect(FAVICON).toContain(/viewBox="[^"]+"/.exec(MARK)?.[0]);
      expect(FAVICON).not.toMatch(/<(?:rect|ellipse|circle)\b|background/);
      expect(FAVICON).not.toMatch(/#15BFFD/i);
    });

    it('takes its tone from the tab strip’s scheme, and the middle tone without one', () => {
      const { mark, markOnLight, markOnAny } = BRAND_ICON_COLORS;
      expect(FAVICON).toContain(
        `svg{color:${markOnAny}}` +
          `@media (prefers-color-scheme:light){svg{color:${markOnLight}}}` +
          `@media (prefers-color-scheme:dark){svg{color:${mark}}}`,
      );
      expect(FAVICON).toContain('<g fill="currentColor"');
    });

    it('adds TAB_WEIGHT of line at tab sizes and draws the exact artwork from 64px', () => {
      // The paths are scaled by 4/3, so the weight in their own units is 3/4 of the viewBox's.
      const side = Number(/viewBox="0 0 ([\d.]+)/.exec(MARK)?.[1]);
      const strokeWidth = Number(/path\{[^}]*stroke-width:([\d.]+)/.exec(FAVICON)?.[1]);
      expect(strokeWidth * 1.3333333).toBeCloseTo(TAB_WEIGHT * side, 0);
      expect((TAB_WEIGHT * 16).toFixed(2)).toBe('0.30');
      expect(FAVICON).toContain('path{stroke:currentColor;');
      expect(FAVICON).toContain(`@media (min-width:${TAB_WEIGHT_MAX_PX}px){path{stroke:none}}`);
    });
  });

  describe('favicon.ico', () => {
    const frames = decodeIco(publicFile(BRAND_ICON_PATHS.faviconIco));

    it('packs 16, 32 and 48px PNG frames with an alpha channel', () => {
      expect(frames.map((frame) => frame.size)).toEqual([16, 32, 48]);
      for (const frame of frames) {
        expect(pngHeader(frame.png)).toEqual({
          width: frame.size,
          height: frame.size,
          colorType: RGBA,
        });
      }
    });

    it('draws the tab-weight mark in the middle tone, on a transparent ground', async () => {
      const frameSvg = faviconFrameSvg(MARK);
      expect(pathData(frameSvg)).toEqual(pathData(MARK));
      expect(frameSvg).not.toMatch(/currentColor|<rect\b|@media/);
      const tone = hexChannels(BRAND_ICON_COLORS.markOnAny).map((c) => Math.round(c * 255));

      for (const { size, png } of frames) {
        const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
        const pixels = Array.from({ length: size * size }, (_, i) =>
          data.subarray(i * 4, i * 4 + 4),
        );
        // The corners and a third of the frame are clear: the strip shows through.
        for (const i of [0, size - 1, size * (size - 1), size * size - 1]) {
          expect(pixels[i]![3]).toBe(0);
        }
        expect(pixels.filter((pixel) => pixel[3] === 0).length).toBeGreaterThan(size * size * 0.3);
        // The mark reaches full opacity, and every covered pixel is the middle
        // tone, within the rounding of un-premultiplying a half-covered pixel.
        expect(Math.max(...pixels.map((pixel) => pixel[3]!))).toBe(255);
        for (const pixel of pixels.filter(([, , , alpha]) => alpha! > 128)) {
          const drift = Math.max(...tone.map((channel, i) => Math.abs(pixel[i]! - channel)));
          expect(drift).toBeLessThanOrEqual(4);
        }
      }
    });
  });

  it('sets the exact artwork on the plate for opaque icons', () => {
    const svg = plateIconSvg(MARK, { markShare: 0.5, radius: 0.25 });
    expect(pathData(svg)).toEqual(pathData(MARK));
    expect(svg).toContain(`fill="${BRAND_ICON_COLORS.plate}"`);
    expect(svg).toContain(`fill="${BRAND_ICON_COLORS.mark}"`);
    expect(svg).not.toMatch(/currentColor|stroke/);
    // Half the plate: the mark is inset by half its own side on every edge.
    const side = Number(/viewBox="0 0 ([\d.]+)/.exec(MARK)?.[1]);
    const [x, y, width, height] = /viewBox="([^"]+)"/.exec(svg)![1]!.split(' ').map(Number);
    const rx = Number(/rx="([\d.]+)"/.exec(svg)?.[1]);
    expect([x, y, width, height, rx]).toEqual(
      [-side / 2, -side / 2, side * 2, side * 2, side / 2].map((n) => expect.closeTo(n, 6)),
    );
  });

  it('refuses a mark it cannot recolour or weigh', () => {
    const path = (transform: string) => `<path transform="${transform}" d="M0 0"/>`;
    const mark = (body: string, viewBox = '0 0 10 10') =>
      `<svg viewBox="${viewBox}"><g fill="currentColor">${body}</g></svg>`;
    expect(() => faviconSvg('<svg viewBox="0 0 10 10"><g fill="#000"/></svg>')).toThrow();
    expect(() => faviconSvg(mark('', '0 0 10 20'))).toThrow();
    expect(() => faviconSvg(mark(path('matrix(1,0.5,0,1,0,0)')))).toThrow();
    expect(() =>
      faviconSvg(mark(path('matrix(2,0,0,-2,0,0)') + path('matrix(1,0,0,1,0,0)'))),
    ).toThrow();
    expect(() => faviconSvg(mark(path('matrix(2,0,0,-2,0,0)')))).not.toThrow();
  });

  it.each([
    ['appleTouchIcon', 180, RGB],
    ['icon192', 192, RGBA],
    ['icon512', 512, RGBA],
    ['maskable512', 512, RGB],
    ['logo512', 512, RGB],
  ] as const)('%s is a %ipx PNG', (key, size, colorType) => {
    // Full-bleed icons are opaque: iOS fills transparency with black, Android
    // masks the maskable icon, and search engines show the logo on any ground.
    expect(pngHeader(publicFile(BRAND_ICON_PATHS[key]))).toEqual({
      width: size,
      height: size,
      colorType,
    });
  });

  it('versions the set by its content, so a replaced icon gets a new URL', () => {
    expect(BRAND_ICON_VERSION).toBe(brandIconDigest(PUBLIC));
    for (const url of Object.values(BRAND_ICON_URLS)) {
      expect(url).toMatch(new RegExp(`\\?v=${BRAND_ICON_VERSION}$`));
    }
  });
});
