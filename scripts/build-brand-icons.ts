#!/usr/bin/env tsx
/**
 * Regenerates the brand icon set (lib/og/brandIcons.ts) from the orbit mark,
 * public/images/brand/orbit-mark.svg, the artwork the header draws:
 *
 *   npm run brand:icons
 *
 *   public/favicon.svg                         transparent, light/dark aware
 *   public/favicon.ico                         16, 32 and 48px, transparent, middle tone
 *   public/apple-touch-icon.png                180px, full bleed (iOS rounds it)
 *   public/images/brand/icon-192.png           mark on a rounded plate
 *   public/images/brand/icon-512.png           mark on a rounded plate
 *   public/images/brand/icon-maskable-512.png  full bleed, mark in the safe zone
 *   public/images/brand/logo-512.png           Organization logo, full bleed
 *
 * then writes the files' content hash to BRAND_ICON_VERSION, so every page and
 * the manifest link the new files. Rasterized with sharp, so a rebuild is
 * reproducible for a given sharp/libvips release.
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import sharp, { type Sharp } from 'sharp';

import {
  BRAND_ICON_COLORS,
  BRAND_ICON_PATHS,
  faviconFrameSvg,
  faviconSvg,
  plateIconSvg,
  type PlateLayout,
} from '../lib/og/brandIcons';

import { brandIconDigest } from './brand-icon-digest';
import { encodeIco } from './ico';

const ROOT = resolve(process.cwd());
const PUBLIC = join(ROOT, 'public');
const VERSION_MODULE = join(ROOT, 'lib', 'og', 'brandIcons.ts');
const MARK = readFileSync(join(PUBLIC, 'images', 'brand', 'orbit-mark.svg'), 'utf8');

/** Width of an SVG's `viewBox`, the size librsvg draws it at by default (72 dpi). */
function intrinsicSize(svg: string): number {
  const viewBox = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/.exec(svg);
  if (!viewBox) throw new Error('SVG without a viewBox');
  return Number(viewBox[1]);
}

/** A square SVG at `size` pixels, drawn at 4× and scaled down so hairlines stay smooth. */
function rasterize(svg: string, size: number): Sharp {
  return sharp(Buffer.from(svg), { density: (72 * 4 * size) / intrinsicSize(svg) }).resize(
    size,
    size,
  );
}

const png = (image: Sharp) => image.png({ compressionLevel: 9 }).toBuffer();

/**
 * The mark on its plate at `size` pixels. Full-bleed icons are flattened onto
 * the plate: an opaque RGB file, as iOS, Android masks and search engines expect.
 */
function plateIcon(size: number, layout: PlateLayout): Promise<Buffer> {
  const image = rasterize(plateIconSvg(MARK, layout), size);
  return png(layout.radius === 0 ? image.flatten({ background: BRAND_ICON_COLORS.plate }) : image);
}

function write(publicPath: string, data: Buffer | string): void {
  const target = join(PUBLIC, publicPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
  console.log(
    `write public${publicPath}  ${Buffer.byteLength(data).toLocaleString('en-US')} bytes`,
  );
}

/** Points BRAND_ICON_VERSION at the files just written. */
function writeVersion(): void {
  const version = brandIconDigest(PUBLIC);
  const source = readFileSync(VERSION_MODULE, 'utf8');
  const declaration = /(export const BRAND_ICON_VERSION = ')[^']*(';)/;
  if (!declaration.test(source)) throw new Error(`No BRAND_ICON_VERSION in ${VERSION_MODULE}`);
  writeFileSync(VERSION_MODULE, source.replace(declaration, `$1${version}$2`));
  console.log(`BRAND_ICON_VERSION = '${version}'`);
}

async function main(): Promise<void> {
  write(BRAND_ICON_PATHS.faviconSvg, `${faviconSvg(MARK)}\n`);
  const frame = faviconFrameSvg(MARK);
  write(
    BRAND_ICON_PATHS.faviconIco,
    encodeIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({ size, png: await png(rasterize(frame, size)) })),
      ),
    ),
  );
  write(BRAND_ICON_PATHS.appleTouchIcon, await plateIcon(180, { markShare: 0.64, radius: 0 }));
  write(BRAND_ICON_PATHS.icon192, await plateIcon(192, { markShare: 0.7, radius: 0.22 }));
  write(BRAND_ICON_PATHS.icon512, await plateIcon(512, { markShare: 0.7, radius: 0.22 }));
  // Android masks adaptive icons to a circle of 80% of the side at most:
  // a 56% square fits inside it (its diagonal is 79%).
  write(BRAND_ICON_PATHS.maskable512, await plateIcon(512, { markShare: 0.56, radius: 0 }));
  write(BRAND_ICON_PATHS.logo512, await plateIcon(512, { markShare: 0.66, radius: 0 }));
  writeVersion();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
