#!/usr/bin/env tsx
/**
 * Regenerates the checked-in weight-700 subsets that the Open Graph image
 * generators embed (lib/og/fonts.ts) — one per locale whose script the
 * built-in next/og Latin fonts cannot render.
 *
 *   npm run og:fonts              # every locale with an OG font
 *   npm run og:fonts -- zh-HK uk  # selected locales
 *
 * Glyph set per subset file: every character of the OG copy of each locale
 * that embeds it (`messages/<locale>/seo.json` → `og.*`), printable ASCII for
 * dynamic values, and the punctuation the card may emit (see
 * ./build-og-fonts-core.ts). A face shared by several locales (Onest for
 * `uk` and `vi`) is cut once from the union of their copy. Sources are the
 * variable TTFs of the google/fonts repository at a pinned commit, instanced
 * at wght=700 and subset with harfbuzz (subset-font), so a rebuild is
 * reproducible byte for byte. Rerun after changing any translated `seo.json`
 * og copy; lib/og/__tests__/og-localization.test.ts fails when a subset no
 * longer covers its copy.
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import subsetFont from 'subset-font';

import { routing } from '../i18n/routing';

import {
  GOOGLE_FONTS_COMMIT,
  ogFontBuilds,
  ogGlyphTextForBuild,
  sourceRegistryProblems,
  type FontSource,
  type OgFontBuild,
} from './build-og-fonts-core';
import { uncoveredCharacters } from './font-cmap';

const ROOT = resolve(process.cwd());
const CACHE_DIR = join(ROOT, 'node_modules', '.cache', 'og-fonts', GOOGLE_FONTS_COMMIT);

async function fetchSource(source: FontSource): Promise<Buffer> {
  const cached = join(CACHE_DIR, basename(source.path));
  if (existsSync(cached)) return readFileSync(cached);
  const url = `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/${encodeURI(source.path)}`;
  console.log(`fetch ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cached, buffer);
  return buffer;
}

async function build({ font, source, locales }: OgFontBuild): Promise<void> {
  const text = ogGlyphTextForBuild(ROOT, { font, source, locales });
  const subset = await subsetFont(await fetchSource(source), text, {
    targetFormat: 'sfnt',
    variationAxes: { wght: font.weight },
    // The subset is only ever rasterized by satori at display sizes.
    noHinting: true,
  });
  const target = fileURLToPath(font.file);
  const missing = uncoveredCharacters(subset, text);
  if (missing.length > 0) {
    throw new Error(`${basename(target)} lacks glyphs for: ${missing.join(' ')}`);
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, subset);
  console.log(
    `write assets/fonts/${basename(target)}  ${subset.byteLength.toLocaleString('en-US')} bytes, ${
      Array.from(text).length
    } code points (${locales.join(', ')})`,
  );
}

async function main(): Promise<void> {
  const problems = sourceRegistryProblems();
  if (problems.length > 0) throw new Error(problems.join('\n'));

  const candidates = ogFontBuilds();
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const selected =
    requested.length === 0
      ? candidates
      : Array.from(
          new Set(
            requested.map((code) => {
              const candidate = candidates.find((entry) =>
                (entry.locales as readonly string[]).includes(code),
              );
              if (!candidate) {
                const known = candidates.flatMap((entry) => entry.locales).join(', ');
                const hint = (routing.locales as readonly string[]).includes(code)
                  ? 'renders with the built-in Latin fonts'
                  : 'is not a routing locale';
                throw new Error(`${code} ${hint}; locales with an OG font: ${known}`);
              }
              return candidate;
            }),
          ),
        );
  for (const candidate of selected) await build(candidate);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
