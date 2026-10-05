/**
 * Minimal SFNT (TrueType / OpenType) reader: which code points a font maps to
 * glyphs (`cmap`) and how wide each glyph is (`head`, `hhea`, `hmtx`). Enough
 * to measure share-card text the way Satori lays it out (lib/og/measure.ts)
 * and to prove a checked-in subset covers the copy it renders
 * (scripts/font-cmap.ts), without a font-parsing library in either graph.
 *
 * `cmap` subtable formats 4 (BMP segments) and 12 (full range) are read:
 * the two a modern subsetter or font editor emits.
 */

export interface SfntFont {
  /** Design units per em (`head.unitsPerEm`). */
  readonly unitsPerEm: number;
  /** Glyph index of a code point; 0 (`.notdef`) when the font lacks it. */
  glyphOf(codePoint: number): number;
  /** Advance width of a glyph, in design units. */
  advanceOf(glyph: number): number;
  /** Every code point the font maps to a real glyph. */
  codePoints(): ReadonlySet<number>;
}

interface TableRecord {
  offset: number;
  length: number;
}

function readTables(view: DataView): Map<string, TableRecord> {
  const tables = new Map<string, TableRecord>();
  const numTables = view.getUint16(4);
  for (let index = 0; index < numTables; index += 1) {
    const record = 12 + index * 16;
    const tag = String.fromCharCode(
      view.getUint8(record),
      view.getUint8(record + 1),
      view.getUint8(record + 2),
      view.getUint8(record + 3),
    );
    tables.set(tag, { offset: view.getUint32(record + 8), length: view.getUint32(record + 12) });
  }
  return tables;
}

function requireTable(tables: Map<string, TableRecord>, tag: string): TableRecord {
  const table = tables.get(tag);
  if (!table) throw new Error(`font has no ${tag} table`);
  return table;
}

function readFormat4(view: DataView, offset: number, out: Map<number, number>): void {
  const segCountX2 = view.getUint16(offset + 6);
  const segCount = segCountX2 / 2;
  const endCodes = offset + 14;
  const startCodes = endCodes + segCountX2 + 2;
  const idDeltas = startCodes + segCountX2;
  const idRangeOffsets = idDeltas + segCountX2;
  for (let segment = 0; segment < segCount; segment += 1) {
    const end = view.getUint16(endCodes + segment * 2);
    const start = view.getUint16(startCodes + segment * 2);
    const idDelta = view.getInt16(idDeltas + segment * 2);
    const idRangeOffset = view.getUint16(idRangeOffsets + segment * 2);
    if (start === 0xffff) continue;
    for (let code = start; code <= end; code += 1) {
      let glyph: number;
      if (idRangeOffset === 0) {
        glyph = (code + idDelta) & 0xffff;
      } else {
        const address = idRangeOffsets + segment * 2 + idRangeOffset + (code - start) * 2;
        glyph = view.getUint16(address);
        if (glyph !== 0) glyph = (glyph + idDelta) & 0xffff;
      }
      if (glyph !== 0 && !out.has(code)) out.set(code, glyph);
    }
  }
}

function readFormat12(view: DataView, offset: number, out: Map<number, number>): void {
  const groupCount = view.getUint32(offset + 12);
  for (let group = 0; group < groupCount; group += 1) {
    const record = offset + 16 + group * 12;
    const start = view.getUint32(record);
    const end = view.getUint32(record + 4);
    const startGlyph = view.getUint32(record + 8);
    for (let code = start; code <= end; code += 1) {
      const glyph = startGlyph + (code - start);
      if (glyph !== 0 && !out.has(code)) out.set(code, glyph);
    }
  }
}

/** Unicode subtables first, full-range before BMP, so the widest map wins. */
function subtablePriority(platform: number, encoding: number): number {
  if (platform === 3 && encoding === 10) return 0;
  if (platform === 0 && (encoding === 4 || encoding === 6)) return 1;
  if (platform === 3 && encoding === 1) return 2;
  if (platform === 0) return 3;
  return 4;
}

function readCmap(view: DataView, cmap: TableRecord): Map<number, number> {
  const glyphs = new Map<number, number>();
  const encodingCount = view.getUint16(cmap.offset + 2);
  const subtables = Array.from({ length: encodingCount }, (_, index) => {
    const record = cmap.offset + 4 + index * 8;
    return {
      priority: subtablePriority(view.getUint16(record), view.getUint16(record + 2)),
      offset: cmap.offset + view.getUint32(record + 4),
    };
  }).sort((a, b) => a.priority - b.priority);
  for (const { offset } of subtables) {
    const format = view.getUint16(offset);
    if (format === 4) readFormat4(view, offset, glyphs);
    else if (format === 12) readFormat12(view, offset, glyphs);
  }
  return glyphs;
}

function readAdvances(view: DataView, tables: Map<string, TableRecord>): Uint16Array {
  const hhea = requireTable(tables, 'hhea');
  const hmtx = requireTable(tables, 'hmtx');
  const count = view.getUint16(hhea.offset + 34);
  const advances = new Uint16Array(count);
  for (let glyph = 0; glyph < count; glyph += 1) {
    advances[glyph] = view.getUint16(hmtx.offset + glyph * 4);
  }
  return advances;
}

const parsed = new WeakMap<ArrayBufferLike, SfntFont>();

/** Parses a font file. Results are cached per underlying buffer. */
export function readSfnt(data: ArrayBuffer | Uint8Array): SfntFont {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const wholeBuffer = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength;
  const cached = wholeBuffer ? parsed.get(bytes.buffer) : undefined;
  if (cached) return cached;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tables = readTables(view);
  const unitsPerEm = view.getUint16(requireTable(tables, 'head').offset + 18);
  const glyphs = readCmap(view, requireTable(tables, 'cmap'));
  const advances = readAdvances(view, tables);
  const lastAdvance = advances.length > 0 ? advances[advances.length - 1]! : 0;
  let codePoints: ReadonlySet<number> | undefined;

  const font: SfntFont = {
    unitsPerEm,
    glyphOf: (codePoint) => glyphs.get(codePoint) ?? 0,
    // Glyphs past numberOfHMetrics share the last advance (a monospaced tail).
    advanceOf: (glyph) => (glyph < advances.length ? advances[glyph]! : lastAdvance),
    codePoints: () => (codePoints ??= new Set(glyphs.keys())),
  };
  if (wholeBuffer) parsed.set(bytes.buffer, font);
  return font;
}

/** Every code point `font` maps to a glyph. */
export function fontCodePoints(font: Uint8Array): Set<number> {
  return new Set(readSfnt(font).codePoints());
}

/** Characters of `text` (by code point) that `font` cannot render. */
export function uncoveredCharacters(font: Uint8Array, text: string): string[] {
  const covered = readSfnt(font).codePoints();
  return Array.from(new Set(Array.from(text))).filter(
    (character) => !/\s/.test(character) && !covered.has(character.codePointAt(0)!),
  );
}
