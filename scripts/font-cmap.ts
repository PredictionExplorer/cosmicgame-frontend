/**
 * Minimal `cmap` reader for SFNT (TrueType/OpenType) fonts: returns the set of
 * code points a font can map to glyphs. Enough to prove that a checked-in OG
 * subset covers the copy it will render (lib/og/__tests__), without pulling a
 * font-parsing library into the test graph. Supports the two subtable formats
 * a modern subsetter emits: format 4 (BMP segments) and format 12 (full range).
 */

export function fontCodePoints(font: Uint8Array): Set<number> {
  const view = new DataView(font.buffer, font.byteOffset, font.byteLength);
  const numTables = view.getUint16(4);
  let cmapOffset = -1;
  for (let index = 0; index < numTables; index += 1) {
    const record = 12 + index * 16;
    const tag = String.fromCharCode(
      view.getUint8(record),
      view.getUint8(record + 1),
      view.getUint8(record + 2),
      view.getUint8(record + 3),
    );
    if (tag === 'cmap') {
      cmapOffset = view.getUint32(record + 8);
      break;
    }
  }
  if (cmapOffset === -1) throw new Error('font has no cmap table');

  const codePoints = new Set<number>();
  const encodingCount = view.getUint16(cmapOffset + 2);
  for (let index = 0; index < encodingCount; index += 1) {
    const subtable = cmapOffset + view.getUint32(cmapOffset + 4 + index * 8 + 4);
    const format = view.getUint16(subtable);
    if (format === 4) readFormat4(view, subtable, codePoints);
    else if (format === 12) readFormat12(view, subtable, codePoints);
  }
  return codePoints;
}

function readFormat4(view: DataView, offset: number, out: Set<number>): void {
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
      if (glyph !== 0) out.add(code);
    }
  }
}

function readFormat12(view: DataView, offset: number, out: Set<number>): void {
  const groupCount = view.getUint32(offset + 12);
  for (let group = 0; group < groupCount; group += 1) {
    const record = offset + 16 + group * 12;
    const start = view.getUint32(record);
    const end = view.getUint32(record + 4);
    for (let code = start; code <= end; code += 1) out.add(code);
  }
}

/** Characters of `text` (by code point) that `font` cannot render. */
export function uncoveredCharacters(font: Uint8Array, text: string): string[] {
  const covered = fontCodePoints(font);
  return Array.from(new Set(Array.from(text))).filter(
    (character) => !/\s/.test(character) && !covered.has(character.codePointAt(0)!),
  );
}
