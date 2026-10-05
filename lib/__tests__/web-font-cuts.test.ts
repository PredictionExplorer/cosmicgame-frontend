/**
 * @jest-environment node
 */
/**
 * The display aliases' self-hosted web fonts (styles/global.css) are cut from
 * the checked-in share-card subsets by `npm run og:fonts` (WEB_FONT_CUTS):
 * each one sets exactly the characters its @font-face claims, its source draws
 * all of them, the notices name it, and the checked-in file is what the
 * pipeline cuts, byte for byte, so a rebuilt source never leaves a stale cut.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import subsetFont from 'subset-font';

import { WEB_FONT_CUTS } from '@/scripts/build-og-fonts-core';
import { fontCodePoints } from '@/scripts/font-cmap';

const ROOT = resolve(__dirname, '../..');
const GLOBAL_CSS = readFileSync(resolve(ROOT, 'styles/global.css'), 'utf8');

/** The @font-face blocks of global.css that load a self-hosted WOFF2 file, by its public path. */
function woff2FontFaces(): Map<string, string> {
  const faces = new Map<string, string>();
  for (const [block] of GLOBAL_CSS.matchAll(/@font-face\s*\{[^}]*\}/g)) {
    const url = /url\('\/(fonts\/[^']+\.woff2)'\)/.exec(block)?.[1];
    if (url) faces.set(`public/${url}`, block);
  }
  return faces;
}

/** The code points a `unicode-range` descriptor lists. */
function rangeCodePoints(block: string): number[] {
  const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1] ?? '';
  return range.split(',').flatMap((part) => {
    const [start, end] = part.trim().replace(/^U\+/i, '').split('-');
    const from = parseInt(start!, 16);
    const to = end ? parseInt(end, 16) : from;
    return Array.from({ length: to - from + 1 }, (_, offset) => from + offset);
  });
}

const codePoints = (text: string) => Array.from(text, (char) => char.codePointAt(0)!);

it('names every self-hosted WOFF2 display alias in WEB_FONT_CUTS', () => {
  expect([...woff2FontFaces().keys()].sort()).toEqual(Object.keys(WEB_FONT_CUTS).sort());
});

describe.each(Object.entries(WEB_FONT_CUTS))('%s', (target, { from, glyphs }) => {
  const source = resolve(ROOT, 'assets/fonts', from);

  it('sets exactly the characters its @font-face claims', () => {
    const block = woff2FontFaces().get(target);
    expect(block).toBeDefined();
    expect(rangeCodePoints(block!).sort((a, b) => a - b)).toEqual(
      codePoints(glyphs).sort((a, b) => a - b),
    );
  });

  it('is cut from a checked-in subset that draws every one of them', () => {
    expect(existsSync(source)).toBe(true);
    const covered = fontCodePoints(new Uint8Array(readFileSync(source)));
    expect(codePoints(glyphs).filter((point) => !covered.has(point))).toEqual([]);
  });

  it('is named with its source in THIRD_PARTY_NOTICES.md', () => {
    const notices = readFileSync(resolve(ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    expect(notices).toContain(target);
    expect(notices).toContain(`assets/fonts/${from}`);
  });

  it('is byte for byte what npm run og:fonts cuts', async () => {
    const cut = await subsetFont(readFileSync(source), glyphs, { targetFormat: 'woff2' });
    expect(Buffer.compare(cut, readFileSync(resolve(ROOT, target)))).toBe(0);
  });
});
