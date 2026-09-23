import type { OgLineBreak } from './fonts';

/**
 * Type sizes for a card's text stack, chosen so the stack fits its box.
 * Satori does not shrink text to fit, so the card estimates line counts from
 * glyph widths (Han, kana and Hangul are one em wide; Latin, Cyrillic and
 * Vietnamese average about half an em in Clash Display, Onest and Inter) and
 * picks the largest title that leaves room for the subhead. Every block is
 * also clamped to the lines it was given, so an estimate that runs short
 * truncates the subhead instead of colliding with the footer.
 */

/** Han, kana, Hangul and full-width punctuation: glyphs one em wide. */
const FULL_WIDTH =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}、。，．・：；！？「」『』（）【】〈〉《》ー～]/u;

/** Rough rendered width of `text` in ems. */
export function widthInEms(text: string): number {
  let ems = 0;
  for (const char of text) ems += FULL_WIDTH.test(char) ? 1 : 0.55;
  return ems;
}

/** Share of a line a wrapped paragraph fills on average, by how it may break. */
const LINE_FILL: Record<OgLineBreak, number> = { anywhere: 0.92, words: 0.84, phrases: 0.78 };

/** Estimated lines `text` takes at `size` in a `width`-pixel column. */
export function estimateLines(text: string, size: number, width: number, mode: OgLineBreak) {
  const emsPerLine = (width * LINE_FILL[mode]) / size;
  return Math.max(1, Math.ceil(widthInEms(text) / emsPerLine));
}

export interface StackMetrics {
  titleLineHeight: number;
  subheadLineHeight: number;
  /** Eyebrow block height plus the gap below it, in pixels. */
  eyebrowBlock: number;
  /** Gap between title and subhead, in pixels. */
  gap: number;
}

export interface StackInput {
  title: string;
  titleBreak: OgLineBreak;
  subhead?: string;
  subheadBreak: OgLineBreak;
  hasEyebrow: boolean;
  width: number;
  height: number;
  titleSizes: readonly number[];
  subheadSizes: readonly number[];
  maxTitleLines: number;
}

export interface StackFit {
  titleSize: number;
  titleLines: number;
  subheadSize: number;
  /** 0 drops the subhead. */
  subheadLines: number;
}

/** The largest title and subhead sizes whose estimated stack fits `height`. */
export function fitStack(input: StackInput, metrics: StackMetrics): StackFit {
  const {
    title,
    titleBreak,
    subhead,
    subheadBreak,
    hasEyebrow,
    width,
    height,
    titleSizes,
    subheadSizes,
    maxTitleLines,
  } = input;
  const eyebrow = hasEyebrow ? metrics.eyebrowBlock : 0;
  const titleHeight = (size: number, lines: number) => lines * size * metrics.titleLineHeight;
  const subheadHeight = (size: number, lines: number) =>
    lines === 0 ? 0 : metrics.gap + lines * size * metrics.subheadLineHeight;

  for (const titleSize of titleSizes) {
    const titleLines = estimateLines(title, titleSize, width, titleBreak);
    if (titleLines > maxTitleLines) continue;
    for (const subheadSize of subheadSizes) {
      const subheadLines = subhead ? estimateLines(subhead, subheadSize, width, subheadBreak) : 0;
      const total =
        eyebrow + titleHeight(titleSize, titleLines) + subheadHeight(subheadSize, subheadLines);
      if (total <= height) return { titleSize, titleLines, subheadSize, subheadLines };
    }
  }

  // Nothing fits whole: the smallest sizes, the title capped, the subhead
  // clamped to the lines left (possibly none).
  const titleSize = titleSizes[titleSizes.length - 1]!;
  const subheadSize = subheadSizes[subheadSizes.length - 1]!;
  const titleLines = Math.min(maxTitleLines, estimateLines(title, titleSize, width, titleBreak));
  const left = height - eyebrow - titleHeight(titleSize, titleLines) - metrics.gap;
  const subheadLines = subhead
    ? Math.max(0, Math.floor(left / (subheadSize * metrics.subheadLineHeight)))
    : 0;
  return { titleSize, titleLines, subheadSize, subheadLines };
}
