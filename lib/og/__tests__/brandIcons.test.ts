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
  LEGACY_CST_IMAGE_PATH,
  LOGO_LAYOUT,
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

/** Chrome's light tab strip (the inactive frame) and dark active tab. */
const LIGHT_TAB_STRIP = '#DEE1E6';
const DARK_TAB = '#35363A';

describe('brand icon set (npm run brand:icons)', () => {
  it('colours the mark with the header’s lavender on the Midnight ground', () => {
    expect(BRAND_ICON_COLORS).toEqual({
      plate: hslTripletToHex(MIDNIGHT_TOKENS.background),
      mark: hslTripletToHex(MIDNIGHT_TOKENS.primary),
      markOnLight: '#5733CC',
    });
    expect(BRAND_ICON_COLORS.plate).toBe('#090A11');
    expect(BRAND_ICON_COLORS.mark).toBe('#E0D6FF');
  });

  // The header's lavender is 1.4:1 on white: a light tab strip needs the
  // same hue, deeper. 4.5:1 on white, 3:1 (non-text, WCAG 1.4.11) on grey.
  it('keeps the favicon legible on light and dark tab strips', () => {
    const { mark, markOnLight } = BRAND_ICON_COLORS;
    expect(MIDNIGHT_TOKENS.primary.split(' ')[0]).toBe('254');
    expect(contrastRatio(hexChannels(markOnLight), hexChannels('#FFFFFF'))).toBeGreaterThan(4.5);
    expect(contrastRatio(hexChannels(markOnLight), hexChannels(LIGHT_TAB_STRIP))).toBeGreaterThan(
      3,
    );
    expect(contrastRatio(hexChannels(mark), hexChannels(DARK_TAB))).toBeGreaterThan(3);
  });

  it('draws the header’s own artwork: BrandMark masks the file every icon is made from', () => {
    const brandMarkCss = readFileSync(
      join(process.cwd(), 'components', 'layout', 'BrandMark.module.css'),
      'utf8',
    );
    const masks = [...brandMarkCss.matchAll(/mask:\s*url\('([^']+)'\)/g)].map((m) => m[1]);
    expect(masks).toEqual([MARK_PATH, MARK_PATH]);
  });

  // F227 drew thin cyan strokes on transparent (2.1:1 on white); the first
  // lavender favicon was a redrawn two-orbit stand-in, not the logo.
  it('serves the orbit mark itself, bare and scheme-aware, as the SVG favicon', () => {
    expect(FAVICON.trim()).toBe(faviconSvg(MARK));
    expect(pathData(FAVICON)).toEqual(pathData(MARK));
    expect(pathData(FAVICON)).toHaveLength(7);
    expect(FAVICON).toContain(/viewBox="[^"]+"/.exec(MARK)?.[0]);
    expect(FAVICON).not.toMatch(/<(?:rect|ellipse|circle)\b/);
    expect(FAVICON).toContain(
      `svg{color:${BRAND_ICON_COLORS.markOnLight}}@media (prefers-color-scheme:dark){svg{color:${BRAND_ICON_COLORS.mark}}}`,
    );
    expect(FAVICON).not.toMatch(/#15BFFD/i);
  });

  it('sets the same artwork on the plate for raster icons', () => {
    const svg = plateIconSvg(MARK, { markShare: 0.5, radius: 0.25 });
    expect(pathData(svg)).toEqual(pathData(MARK));
    expect(svg).toContain(`fill="${BRAND_ICON_COLORS.plate}"`);
    expect(svg).toContain(`fill="${BRAND_ICON_COLORS.mark}"`);
    expect(svg).not.toContain('currentColor');
    // Half the plate: the mark is inset by half its own side on every edge.
    const side = Number(/viewBox="0 0 ([\d.]+)/.exec(MARK)?.[1]);
    const [x, y, width, height] = /viewBox="([^"]+)"/.exec(svg)![1]!.split(' ').map(Number);
    const rx = Number(/rx="([\d.]+)"/.exec(svg)?.[1]);
    expect([x, y, width, height, rx]).toEqual(
      [-side / 2, -side / 2, side * 2, side * 2, side / 2].map((n) => expect.closeTo(n, 6)),
    );
  });

  it('refuses a mark it cannot recolour', () => {
    expect(() => faviconSvg('<svg viewBox="0 0 10 10"><g fill="#000"/></svg>')).toThrow();
    expect(() => faviconSvg('<svg viewBox="0 0 10 20"><g fill="currentColor"/></svg>')).toThrow();
  });

  it('packs 16, 32 and 48px PNG frames into favicon.ico', () => {
    const frames = decodeIco(publicFile(BRAND_ICON_PATHS.faviconIco));
    expect(frames.map((frame) => frame.size)).toEqual([16, 32, 48]);
    for (const frame of frames) {
      // Rounded plate: transparent corners.
      expect(pngHeader(frame.png)).toEqual({
        width: frame.size,
        height: frame.size,
        colorType: RGBA,
      });
    }
  });

  it.each([
    ['appleTouchIcon', 180, RGB],
    ['icon192', 192, RGBA],
    ['icon512', 512, RGBA],
    ['maskable512', 512, RGB],
    ['logo512', 512, RGB],
  ] as const)('%s is a %ipx PNG', (key, size, colorType) => {
    // Full-bleed icons are opaque: iOS and Android mask them, and search
    // engines show the logo on any background.
    expect(pngHeader(publicFile(BRAND_ICON_PATHS[key]))).toEqual({
      width: size,
      height: size,
      colorType,
    });
  });

  // wallet_watchAsset: wallets draw token images in a circle inscribed in
  // the square, some with a ring of their own on its edge.
  it('keeps the CST token image’s mark inside the circle wallets crop it to', async () => {
    const { data, info } = await sharp(publicFile(BRAND_ICON_PATHS.logo512))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const plate = hexChannels(BRAND_ICON_COLORS.plate).map((c) => Math.round(c * 255));
    const centre = (info.width - 1) / 2;
    let reach = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (plate.every((c, channel) => Math.abs(data[i + channel]! - c) <= 8)) continue;
      const pixel = i / info.channels;
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      reach = Math.max(reach, Math.hypot(x - centre, y - centre));
    }
    // The crop's radius is half the side.
    expect(reach / info.width).toBeLessThan(0.4);
    expect(reach / info.width).toBeGreaterThan(0.3);
  });

  it('redraws the retired CST image as the token image, for wallets that kept its URL', () => {
    const legacy = publicFile(LEGACY_CST_IMAGE_PATH).toString('utf8');
    expect(legacy.trim()).toBe(plateIconSvg(MARK, LOGO_LAYOUT));
    expect(pathData(legacy)).toEqual(pathData(MARK));
    expect(legacy).not.toMatch(/#15BFFD/i);
  });

  it('versions the set by its content, so a replaced icon gets a new URL', () => {
    expect(BRAND_ICON_VERSION).toBe(brandIconDigest(PUBLIC));
    for (const url of Object.values(BRAND_ICON_URLS)) {
      expect(url).toMatch(new RegExp(`\\?v=${BRAND_ICON_VERSION}$`));
    }
  });
});
