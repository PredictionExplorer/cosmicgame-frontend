import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { decodeIco } from '@/scripts/ico';

import {
  BRAND_ICON_COLORS,
  BRAND_ICON_PATHS,
  BRAND_ICON_URLS,
  BRAND_ICON_VERSION,
  smallMarkSvg,
} from '@/lib/og/brandIcons';

const publicFile = (path: string) => readFileSync(join(process.cwd(), 'public', path));

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

describe('brand icon set (npm run brand:icons)', () => {
  it('draws the lavender mark on the Midnight ground', () => {
    expect(BRAND_ICON_COLORS).toEqual({ plate: '#090A11', mark: '#E0D6FF' });
  });

  // F227: the old favicon was thin cyan strokes on transparent (2.1:1 on white).
  it('serves the small mark, on its plate, as the SVG favicon', () => {
    const svg = publicFile(BRAND_ICON_PATHS.faviconSvg).toString('utf8').trim();
    expect(svg).toBe(smallMarkSvg());
    expect(svg).toContain(`fill="${BRAND_ICON_COLORS.plate}"`);
    expect(svg).toContain(`stroke="${BRAND_ICON_COLORS.mark}"`);
    expect(svg).not.toMatch(/#15BFFD/i);
    // Orbits stay above a pixel wide at 16px: 2.3 units of a 32-unit grid.
    expect(Number(/stroke-width="([\d.]+)"/.exec(svg)?.[1])).toBeGreaterThanOrEqual(2);
  });

  it('packs 16, 32 and 48px PNG frames into favicon.ico', () => {
    const frames = decodeIco(publicFile(BRAND_ICON_PATHS.faviconIco));
    expect(frames.map((frame) => frame.size)).toEqual([16, 32, 48]);
    for (const frame of frames) {
      expect(pngHeader(frame.png)).toEqual(
        expect.objectContaining({ width: frame.size, height: frame.size }),
      );
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

  it('cache-busts every linked favicon with the icon version', () => {
    for (const url of Object.values(BRAND_ICON_URLS)) {
      expect(url).toMatch(new RegExp(`\\?v=${BRAND_ICON_VERSION}$`));
    }
    expect(BRAND_ICON_VERSION).not.toBe('20260825');
  });
});
