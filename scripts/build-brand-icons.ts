#!/usr/bin/env tsx
/**
 * Regenerates the brand icon set (lib/og/brandIcons.ts) from the orbit mark:
 *
 *   npm run brand:icons
 *
 *   public/favicon.svg                       small mark on the Midnight plate
 *   public/favicon.ico                       its 16, 32 and 48px frames
 *   public/apple-touch-icon.png              180px, full bleed (iOS rounds it)
 *   public/images/brand/icon-192.png         full mark on a rounded plate
 *   public/images/brand/icon-512.png         full mark on a rounded plate
 *   public/images/brand/icon-maskable-512.png  full bleed, mark in the safe zone
 *   public/images/brand/logo-512.png         Organization logo, full bleed
 *
 * The full mark is public/images/brand/orbit-mark.svg. Rasterized with sharp,
 * so a rebuild is reproducible for a given sharp/libvips release. Bump
 * BRAND_ICON_VERSION whenever the output changes.
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import sharp from 'sharp';

import { BRAND_ICON_COLORS, BRAND_ICON_PATHS, smallMarkSvg } from '../lib/og/brandIcons';

import { encodeIco } from './ico';

const ROOT = resolve(process.cwd());
const PUBLIC = join(ROOT, 'public');
const MARK = readFileSync(join(PUBLIC, 'images', 'brand', 'orbit-mark.svg'), 'utf8').replaceAll(
  'currentColor',
  BRAND_ICON_COLORS.mark,
);

/** Side of an SVG's `viewBox`, the size librsvg draws it at by default (72 dpi). */
function intrinsicSize(svg: string): number {
  const viewBox = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/.exec(svg);
  if (!viewBox) throw new Error('SVG without a viewBox');
  return Number(viewBox[1]);
}

/** Rasterizes a square SVG at `size` pixels, drawn at 4× and scaled down so thin strokes stay smooth. */
function rasterize(svg: string, size: number): Promise<Buffer> {
  const density = (72 * 4 * size) / intrinsicSize(svg);
  return sharp(Buffer.from(svg), { density })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * The full mark centred on a plate. `markShare` is the mark's side as a share
 * of the icon; `radius` rounds the plate (0 = full bleed, opaque corners).
 */
async function markOnPlate(size: number, markShare: number, radius: number): Promise<Buffer> {
  const mark = await rasterize(MARK, Math.round(size * markShare));
  const plate = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${
    size * radius
  }" fill="${BRAND_ICON_COLORS.plate}"/></svg>`;
  const composed = await sharp(Buffer.from(plate))
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  // sharp flattens before it composites, so a full-bleed icon is flattened
  // in a second pass: an opaque RGB file, as iOS and search engines expect.
  return radius === 0
    ? sharp(composed)
        .flatten({ background: BRAND_ICON_COLORS.plate })
        .png({ compressionLevel: 9 })
        .toBuffer()
    : composed;
}

function write(publicPath: string, data: Buffer | string): void {
  const target = join(PUBLIC, publicPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
  console.log(
    `write public${publicPath}  ${Buffer.byteLength(data).toLocaleString('en-US')} bytes`,
  );
}

async function main(): Promise<void> {
  const small = smallMarkSvg();
  write(BRAND_ICON_PATHS.faviconSvg, `${small}\n`);
  write(
    BRAND_ICON_PATHS.faviconIco,
    encodeIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({ size, png: await rasterize(small, size) })),
      ),
    ),
  );
  write(BRAND_ICON_PATHS.appleTouchIcon, await markOnPlate(180, 0.64, 0));
  write(BRAND_ICON_PATHS.icon192, await markOnPlate(192, 0.7, 0.22));
  write(BRAND_ICON_PATHS.icon512, await markOnPlate(512, 0.7, 0.22));
  // Android masks adaptive icons to a circle of 80% of the side at most:
  // a 56% square fits inside it (its diagonal is 79%).
  write(BRAND_ICON_PATHS.maskable512, await markOnPlate(512, 0.56, 0));
  write(BRAND_ICON_PATHS.logo512, await markOnPlate(512, 0.66, 0));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
