import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fontCodePoints, uncoveredCharacters } from '@/scripts/font-cmap';

import { getOgFontConfig } from '@/lib/og/fonts';
import { createOgMeasure, type OgFontFace } from '@/lib/og/measure';
import { readSfnt } from '@/lib/og/sfnt';

const fontFile = (path: string) => new Uint8Array(readFileSync(join(process.cwd(), path)));
const INTER_400 = fontFile('assets/fonts/Inter-400.subset.ttf');
const INTER_500 = fontFile('assets/fonts/Inter-500.subset.ttf');
const NOTO_KR_400 = fontFile('assets/fonts/NotoSansKR-400.subset.ttf');
const CLASH_500 = fontFile('public/fonts/ClashDisplay/fonts/ClashDisplay-Medium.ttf');

const face = (name: string, weight: number, bytes: Uint8Array): OgFontFace => ({
  name,
  weight,
  data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
});

describe('readSfnt', () => {
  it('reads units per em, glyph indices and advance widths', () => {
    const inter = readSfnt(INTER_400);
    expect(inter.unitsPerEm).toBeGreaterThan(0);
    const glyph = inter.glyphOf('M'.codePointAt(0)!);
    expect(glyph).toBeGreaterThan(0);
    // An M is wider than an i in any proportional face.
    expect(inter.advanceOf(glyph)).toBeGreaterThan(inter.advanceOf(inter.glyphOf(0x69)));
    expect(inter.glyphOf('시'.codePointAt(0)!)).toBe(0);
  });

  it('agrees with the coverage the font scripts check', () => {
    const covered = fontCodePoints(NOTO_KR_400);
    expect(covered.has('시'.codePointAt(0)!)).toBe(true);
    expect(uncoveredCharacters(NOTO_KR_400, '시그니처 ✈')).toEqual(['✈']);
    expect(readSfnt(NOTO_KR_400).codePoints().size).toBe(covered.size);
  });
});

describe('createOgMeasure', () => {
  const measure = createOgMeasure([
    face('Inter', 400, INTER_400),
    face('Inter', 500, INTER_500),
    face('Noto Sans KR', 400, NOTO_KR_400),
    face('Clash Display', 500, CLASH_500),
  ]);
  const inter = readSfnt(INTER_400);
  const advance = (text: string, size: number) =>
    Array.from(text).reduce(
      (sum, character) =>
        sum + (inter.advanceOf(inter.glyphOf(character.codePointAt(0)!)) / inter.unitsPerEm) * size,
      0,
    );
  const body = { families: ['Inter', 'Noto Sans KR'], weight: 400, size: 28 };

  it('sums glyph advances at the font size, with no kerning', () => {
    expect(measure('AVAV', body)).toBeCloseTo(advance('AVAV', 28), 6);
    expect(measure('', body)).toBe(0);
  });

  it('adds the tracking after every glyph', () => {
    expect(measure('ABC', { ...body, letterSpacingEm: 0.12 })).toBeCloseTo(
      advance('ABC', 28) + 3 * 0.12 * 28,
      6,
    );
  });

  it('sets each grapheme in the first face that has it', () => {
    const hangul = readSfnt(NOTO_KR_400);
    const si = (hangul.advanceOf(hangul.glyphOf('시'.codePointAt(0)!)) / hangul.unitsPerEm) * 28;
    expect(measure('A시', body)).toBeCloseTo(advance('A', 28) + si, 6);
    // Clash Display comes first for titles, and Inter backs it.
    const title = { families: ['Clash Display', 'Inter'], weight: 500, size: 64 };
    expect(measure('A', title)).not.toBeCloseTo(measure('A', { ...title, families: ['Inter'] }), 3);
  });

  it('matches weights the CSS way: the exact face, else the nearest', () => {
    expect(measure('Signature', { ...body, weight: 500 })).not.toBeCloseTo(
      measure('Signature', body),
      3,
    );
    // No 450: 400–500 falls to 500 first.
    expect(measure('Signature', { ...body, weight: 450 })).toBeCloseTo(
      measure('Signature', { ...body, weight: 500 }),
      6,
    );
  });

  it('measures with the faces a locale’s cards embed', async () => {
    const ja = createOgMeasure(await getOgFontConfig('ja'));
    const size = 28;
    const width = ja('シグネチャー', { families: ['Inter', 'Noto Sans JP'], weight: 400, size });
    // Kana are a full em in Noto Sans JP.
    expect(width).toBeCloseTo(6 * size, 0);
  });

  it('needs at least one face', () => {
    expect(() => createOgMeasure([])).toThrow(/at least one/);
  });
});
