import { readSfnt, type SfntFont } from './sfnt';

/**
 * Text measurement from the faces a card embeds, the way Satori (next/og)
 * measures: each grapheme at its glyph's advance width, in the first face of
 * the `font-family` list that has it (then any other embedded face), with the
 * letter-spacing added after every glyph. No kerning: Satori lays text out
 * without it. A card that sizes and breaks its text with this measure knows
 * exactly how wide every line it draws is (lib/og/layout.ts).
 */

/** An embedded face, as `ImageResponse` receives it (`getOgFontConfig`). */
export interface OgFontFace {
  name: string;
  data: ArrayBuffer;
  weight: number;
}

/** The face a block of card text is set in, independent of its size. */
export interface OgTextFace {
  /** Families in fallback order, as the element's `font-family` lists them. */
  readonly families: readonly string[];
  readonly weight: number;
  /** Tracking in em; Satori resolves `'0.12em'` against the font size the same way. */
  readonly letterSpacingEm?: number;
  /**
   * Families the word spaces are set in, when not the text's own. A CJK
   * title leads with Clash Display for its Latin, whose hairline space
   * (0.14em) would run Korean words together; its spaces come from the
   * script face instead (lib/og/layout.ts draws them as gaps).
   */
  readonly spaceFamilies?: readonly string[];
}

export interface OgTextStyle extends OgTextFace {
  /** Font size in pixels. */
  readonly size: number;
}

/** Width of `text` in pixels, set in `style`. */
export type OgMeasure = (text: string, style: OgTextStyle) => number;

interface Face {
  weight: number;
  font: SfntFont;
}

/**
 * CSS font matching by weight within one family: the exact weight, else for
 * 400–500 the other of the two, then lighter, then heavier; lighter first
 * below 400 and heavier first above 500.
 */
function closestWeight(faces: readonly Face[], desired: number): SfntFont {
  const exact = faces.find((face) => face.weight === desired);
  if (exact) return exact.font;
  const lighter = faces.filter((face) => face.weight < desired).sort((a, b) => b.weight - a.weight);
  const heavier = faces.filter((face) => face.weight > desired).sort((a, b) => a.weight - b.weight);
  const nearBody = desired >= 400 && desired <= 500;
  const order = nearBody
    ? [...heavier.filter((face) => face.weight <= 500), ...lighter, ...heavier]
    : desired < 400
      ? [...lighter, ...heavier]
      : [...heavier, ...lighter];
  return order[0]!.font;
}

let graphemeSegmenter: Intl.Segmenter | undefined;

function graphemes(text: string): Iterable<Intl.SegmentData> {
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return graphemeSegmenter.segment(text);
}

/** A measure over `faces`, the fonts one card embeds. */
export function createOgMeasure(faces: readonly OgFontFace[]): OgMeasure {
  if (faces.length === 0) throw new Error('a share card needs at least one embedded face');
  const families = new Map<string, Face[]>();
  for (const face of faces) {
    const key = face.name.toLowerCase();
    const list = families.get(key) ?? [];
    list.push({ weight: face.weight, font: readSfnt(face.data) });
    families.set(key, list);
  }

  const chains = new Map<string, SfntFont[]>();
  /** Requested families in order, then every other embedded family (Satori's fallback). */
  function chainFor(requested: readonly string[], weight: number): SfntFont[] {
    const key = `${weight}|${requested.join('|')}`;
    let chain = chains.get(key);
    if (!chain) {
      const names = requested.map((family) => family.toLowerCase());
      const ordered = [
        ...names.filter((name) => families.has(name)),
        ...Array.from(families.keys()).filter((name) => !names.includes(name)),
      ];
      chain = Array.from(new Set(ordered)).map((name) =>
        closestWeight(families.get(name)!, weight),
      );
      chains.set(key, chain);
    }
    return chain;
  }

  return (text, style) => {
    const chain = chainFor(style.families, style.weight);
    const scale = style.size;
    const tracking = (style.letterSpacingEm ?? 0) * style.size;
    let width = 0;
    for (const { segment } of graphemes(text)) {
      // Satori picks one face per grapheme, by its first code point.
      const first = segment.codePointAt(0)!;
      const face = chain.find((font) => font.glyphOf(first) !== 0) ?? chain[chain.length - 1]!;
      for (const character of segment) {
        const codePoint = character.codePointAt(0)!;
        const font =
          face.glyphOf(codePoint) !== 0
            ? face
            : (chain.find((candidate) => candidate.glyphOf(codePoint) !== 0) ?? face);
        width += (font.advanceOf(font.glyphOf(codePoint)) / font.unitsPerEm) * scale + tracking;
      }
    }
    return width;
  };
}
