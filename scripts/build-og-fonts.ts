#!/usr/bin/env tsx
/**
 * Regenerates the checked-in font subsets the share cards embed
 * (lib/og/fonts.ts): Inter and JetBrains Mono for every locale, Onest for
 * Ukrainian and Vietnamese titles, and the regional Noto Sans CJK cuts.
 *
 *   npm run og:fonts                          # every subset
 *   npm run og:fonts -- Inter-400.subset.ttf  # selected files
 *
 * Glyph set per file: every character the cards of the locales that embed it
 * can draw — their `messages/<locale>/seo.json` og copy without alt text, the
 * reading pages' card copy (app/[locale]/(landing)/readingCardCopy.ts), the
 * uppercase eyebrows of cased scripts, printable ASCII, the footer host and
 * the card's punctuation (./build-og-fonts-core.ts) — restricted to what the
 * source covers. Sources are the variable TTFs of the google/fonts repository
 * at a pinned commit, instanced at the registry's axis values and subset with
 * harfbuzz (subset-font), so a rebuild is reproducible byte for byte. The run
 * fails when any locale's stacks would leave a character uncovered. Rerun
 * after changing any `seo.json` og copy or a reading page's title, eyebrow or
 * guide template (the Learn, white paper, quiz and About content modules).
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import subsetFont from 'subset-font';

import {
  GOOGLE_FONTS_COMMIT,
  OG_SUBSET_SOURCES,
  sourceRegistryProblems,
  subsetGlyphText,
  type FontSource,
} from './build-og-fonts-core';
import { fontCodePoints, uncoveredCharacters } from './font-cmap';
import { ogCoverageProblems } from './og-font-coverage';

const ROOT = resolve(process.cwd());
const CACHE_DIR = join(ROOT, 'node_modules', '.cache', 'og-fonts', GOOGLE_FONTS_COMMIT);
const OUTPUT_DIR = join(ROOT, 'assets', 'fonts');

async function fetchSource(source: FontSource): Promise<Buffer> {
  const cached = join(CACHE_DIR, basename(source.path));
  if (existsSync(cached)) return readFileSync(cached);
  const url = `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/${encodeURI(source.path)}`;
  console.log(`fetch ${url}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cached, buffer);
  return buffer;
}

async function build(file: string): Promise<void> {
  const source = OG_SUBSET_SOURCES[file]!;
  const font = await fetchSource(source);
  const covered = fontCodePoints(new Uint8Array(font));
  // A face that is one of several in a stack (Inter in a CJK body stack) only
  // draws what it has; the coverage check below proves every stack is whole.
  const text = Array.from(subsetGlyphText(ROOT, file))
    .filter((char) => covered.has(char.codePointAt(0)!))
    .join('');
  const subset = await subsetFont(font, text, {
    targetFormat: 'sfnt',
    variationAxes: source.axes,
    // The subset is only ever rasterized by satori at display sizes.
    noHinting: true,
  });
  const missing = uncoveredCharacters(subset, text);
  if (missing.length > 0) throw new Error(`${file} lacks glyphs for: ${missing.join(' ')}`);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, file), subset);
  console.log(
    `write assets/fonts/${file}  ${subset.byteLength.toLocaleString('en-US')} bytes, ${
      Array.from(text).length
    } code points`,
  );
}

async function main(): Promise<void> {
  const problems = sourceRegistryProblems();
  if (problems.length > 0) throw new Error(problems.join('\n'));

  const files = Object.keys(OG_SUBSET_SOURCES);
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  for (const file of requested) {
    if (!files.includes(file))
      throw new Error(`${file} is not a subset; known: ${files.join(', ')}`);
  }
  for (const file of requested.length > 0 ? requested : files) await build(file);

  const gaps = ogCoverageProblems(ROOT);
  if (gaps.length > 0) {
    throw new Error(`Share-card stacks leave characters uncovered:\n${gaps.join('\n')}`);
  }
  console.log('every locale’s share-card stacks cover its copy');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
