import type { OgLineBreak } from './fonts';
import type { OgMeasure, OgTextFace, OgTextStyle } from './measure';
import {
  breakUnits,
  endsClause,
  graphemeUnits,
  hyphenUnits,
  joinBrokenLine,
  joinUnits,
  sentencesOf,
  type LineBreakUnit,
} from './text';

/**
 * Line layout for share cards. Satori neither shrinks text to fit nor breaks
 * Korean by word or Japanese by phrase, so a card sets every block of text as
 * explicit lines: it measures each unit with the embedded faces
 * (lib/og/measure.ts), breaks between the units of lib/og/text.ts, and draws
 * each line unwrapped. Every line is known to fit its column, and a stack is
 * known to fit its box, before anything is drawn.
 *
 * A word is split only when it cannot fit a line whole: at its hyphens
 * first, between characters as a last resort, and a stack prefers a smaller
 * size to either. When a block must be cut, it ends on its last whole
 * sentence, or failing that on a whole unit followed by the locale's
 * ellipsis; it is never clipped mid-line.
 */

/**
 * How a block's lines are shaped once their number is known, like CSS
 * `text-wrap`: `balance` evens the lines of a heading, preferring to break
 * after a clause; `pretty` keeps a paragraph from ending on a lone word;
 * `wrap` fills each line greedily.
 */
export type OgTextWrap = 'wrap' | 'balance' | 'pretty';

/** How far a block had to go to fit a word on its lines, least to most. */
export type OgWordSplit = 'none' | 'hyphen' | 'grapheme';

const SPLIT_RANK: Record<OgWordSplit, number> = { none: 0, hyphen: 1, grapheme: 2 };

export interface TextBlockSpec {
  text: string;
  face: OgTextFace;
  lineBreak: OgLineBreak;
  /** Line height as a multiple of the font size. */
  lineHeight: number;
  /** `wrap` by default. */
  textWrap?: OgTextWrap;
  /**
   * In a stack, prefer a size at which every line of this block ends on a
   * clause, when it has more than one. For scripts broken between any two
   * characters (Chinese), where a break inside a clause can split a word.
   */
  keepClauses?: boolean;
}

export interface TextBlock {
  /** The lines to draw, in order. */
  lines: string[];
  size: number;
  lineHeight: number;
  /** Height of the block as Satori lays it out: one rounded line box per line. */
  height: number;
  /** Width of the widest line. */
  width: number;
  /** The text was cut to fit (at a sentence end, or with an ellipsis). */
  truncated: boolean;
  /** Whether a word had to be split across lines to fit. */
  split: OgWordSplit;
  /** Every line but the last ends on a clause (always true of a single line). */
  clauseBreaks: boolean;
  /**
   * Width of each word space, when the face sets its spaces in other
   * families (`OgTextFace.spaceFamilies`): the card draws them as gaps.
   */
  wordGap?: number;
}

export interface ClampOptions {
  maxLines: number;
  /** The locale's ellipsis (`getLocaleConfig(locale).ellipsis`). */
  ellipsis: string;
  /** End on the last whole sentence that fits before cutting inside one. */
  preferSentences?: boolean;
}

/** Height of one line box: Satori rounds `fontSize × lineHeight` per line. */
export function lineBox(size: number, lineHeight: number): number {
  return Math.round(size * lineHeight);
}

interface Wrapping {
  /** Width of a run of text, its word spaces included. */
  run: (text: string) => number;
  width: number;
  wordGap?: number;
}

function wrappingFor(measure: OgMeasure, style: OgTextStyle, width: number): Wrapping {
  if (!style.spaceFamilies) return { run: (text) => measure(text, style), width };
  const wordGap = measure(' ', { ...style, families: style.spaceFamilies });
  const run = (text: string) => {
    const words = text.split(' ');
    return (
      words.reduce((sum, word) => sum + measure(word, style), 0) + wordGap * (words.length - 1)
    );
  };
  return { run, width, wordGap };
}

interface Lines {
  lines: LineBreakUnit[][];
  split: OgWordSplit;
}

const worse = (a: OgWordSplit, b: OgWordSplit): OgWordSplit =>
  SPLIT_RANK[a] >= SPLIT_RANK[b] ? a : b;

function unitsWidth(units: readonly LineBreakUnit[], { run }: Wrapping): number {
  return run(joinUnits(units));
}

/**
 * Greedy line breaking between units. A unit wider than the line is split at
 * its hyphens when every piece then fits, else between characters.
 */
function wrapUnits(units: readonly LineBreakUnit[], wrapping: Wrapping): Lines {
  const { run, width } = wrapping;
  const space = run(' ');
  const lines: LineBreakUnit[][] = [];
  let split: OgWordSplit = 'none';
  let line: LineBreakUnit[] = [];
  // Width of the line so far, including the space after its last unit.
  let lineWidth = 0;
  const place = (unit: LineBreakUnit) => {
    const unitWidth = run(unit.text);
    if (line.length > 0 && lineWidth + unitWidth > width) {
      lines.push(line);
      line = [];
      lineWidth = 0;
    }
    line.push(unit);
    lineWidth += unitWidth + (unit.spaceAfter ? space : 0);
  };
  for (const unit of units) {
    if (run(unit.text) <= width) {
      place(unit);
      continue;
    }
    const hyphenated = hyphenUnits(unit);
    if (hyphenated?.every((piece) => run(piece.text) <= width)) {
      split = worse(split, 'hyphen');
      hyphenated.forEach(place);
    } else {
      split = 'grapheme';
      graphemeUnits(unit).forEach(place);
    }
  }
  if (line.length > 0) lines.push(line);
  return { lines, split };
}

/**
 * The narrowest column that still takes no more lines than a greedy fill of
 * the full width, so the lines come out even. Never narrower than the widest
 * unit, so balancing never splits a word the full width would not.
 */
function evenLines(units: readonly LineBreakUnit[], wrapping: Wrapping): Lines {
  const greedy = wrapUnits(units, wrapping);
  if (greedy.lines.length < 2) return greedy;
  const at = (width: number) => wrapUnits(units, { ...wrapping, width });
  const fits = (width: number) => {
    const candidate = at(width);
    return (
      candidate.lines.length <= greedy.lines.length &&
      SPLIT_RANK[candidate.split] <= SPLIT_RANK[greedy.split]
    );
  };
  let low = Math.max(...units.map((unit) => wrapping.run(unit.text)));
  let high = wrapping.width;
  if (low >= high) return greedy;
  if (fits(low)) return at(low);
  // Invariant: `high` fits and `low` does not; a pixel is finer than the eye can tell.
  while (high - low > 1) {
    const middle = (low + high) / 2;
    if (fits(middle)) high = middle;
    else low = middle;
  }
  return at(high);
}

/** Units grouped into clauses, each ending after a comma, colon or separator. */
function clausesOf(units: readonly LineBreakUnit[]): LineBreakUnit[][] {
  const clauses: LineBreakUnit[][] = [[]];
  units.forEach((unit, index) => {
    clauses[clauses.length - 1]!.push(unit);
    if (endsClause(unit) && index < units.length - 1) clauses.push([]);
  });
  return clauses;
}

/**
 * Even lines (`text-wrap: balance`), broken after each clause when that takes
 * no more lines: `From Calibration to Allocation, / in four stages.`
 */
function balanceLines(units: readonly LineBreakUnit[], wrapping: Wrapping): Lines {
  const balanced = evenLines(units, wrapping);
  const clauses = clausesOf(units);
  if (balanced.lines.length < 2 || clauses.length < 2) return balanced;
  const byClause = clauses.map((clause) => evenLines(clause, wrapping));
  const lines = byClause.flatMap((clause) => clause.lines);
  const split = byClause.map((clause) => clause.split).reduce(worse, 'none');
  return lines.length <= balanced.lines.length && SPLIT_RANK[split] <= SPLIT_RANK[balanced.split]
    ? { lines, split }
    : balanced;
}

/**
 * Greedy lines, except that a last line holding a single unit takes the
 * previous line's last unit with it when both fit and that line keeps two
 * (`text-wrap: pretty`).
 */
function prettyLines(units: readonly LineBreakUnit[], wrapping: Wrapping): Lines {
  const wrapped = wrapUnits(units, wrapping);
  const { lines } = wrapped;
  if (lines.length < 2) return wrapped;
  const last = lines[lines.length - 1]!;
  const previous = lines[lines.length - 2]!;
  if (last.length !== 1 || previous.length < 3) return wrapped;
  const widowed = [previous[previous.length - 1]!, ...last];
  if (unitsWidth(widowed, wrapping) > wrapping.width) return wrapped;
  return { lines: [...lines.slice(0, -2), previous.slice(0, -1), widowed], split: wrapped.split };
}

const SHAPERS: Record<OgTextWrap, (units: readonly LineBreakUnit[], wrapping: Wrapping) => Lines> =
  { wrap: wrapUnits, balance: balanceLines, pretty: prettyLines };

/** Trailing marks that read badly before an ellipsis. */
const TRAILING_PUNCTUATION = /[\s,.;:!?、。，．；：！？·・—–-]+$/u;

/** `lines` cut to `maxLines`, the last line ending on a whole unit and the ellipsis. */
function cutWithEllipsis(
  lines: readonly LineBreakUnit[][],
  maxLines: number,
  ellipsis: string,
  wrapping: Wrapping,
): LineBreakUnit[][] {
  const kept = lines.slice(0, maxLines).map((line) => [...line]);
  const last = kept[kept.length - 1]!;
  while (last.length > 0) {
    const tail = last[last.length - 1]!;
    const text = tail.text.replace(TRAILING_PUNCTUATION, '');
    const candidate = [...last.slice(0, -1), { text: `${text}${ellipsis}`, spaceAfter: false }];
    if (text && unitsWidth(candidate, wrapping) <= wrapping.width) {
      kept[kept.length - 1] = candidate;
      return kept;
    }
    last.pop();
  }
  kept[kept.length - 1] = [{ text: ellipsis, spaceAfter: false }];
  return kept;
}

function toBlock(
  { lines, split }: Lines,
  size: number,
  lineHeight: number,
  wrapping: Wrapping,
  truncated: boolean,
): TextBlock {
  const texts = lines.map((line, index) =>
    index < lines.length - 1 ? joinBrokenLine(line) : joinUnits(line),
  );
  return {
    lines: texts,
    size,
    lineHeight,
    height: texts.length * lineBox(size, lineHeight),
    width: Math.max(0, ...texts.map(wrapping.run)),
    truncated,
    split,
    clauseBreaks: lines.slice(0, -1).every((line) => endsClause(line[line.length - 1]!)),
    ...(wrapping.wordGap === undefined ? {} : { wordGap: wrapping.wordGap }),
  };
}

/** Sets `spec` at `size` in a `width`-pixel column, cut to `clamp.maxLines` when given. */
export function layoutBlock(
  spec: TextBlockSpec,
  size: number,
  width: number,
  measure: OgMeasure,
  clamp?: ClampOptions,
): TextBlock {
  const wrapping = wrappingFor(measure, { ...spec.face, size }, width);
  const shape = SHAPERS[spec.textWrap ?? 'wrap'];
  const wrap = (text: string) => shape(breakUnits(text, spec.lineBreak), wrapping);
  const whole = wrap(spec.text);
  if (!clamp || whole.lines.length <= clamp.maxLines) {
    return toBlock(whole, size, spec.lineHeight, wrapping, false);
  }
  if (clamp.maxLines <= 0) {
    return toBlock({ lines: [], split: 'none' }, size, spec.lineHeight, wrapping, true);
  }

  if (clamp.preferSentences) {
    const sentences = sentencesOf(spec.text);
    for (let count = sentences.length - 1; count >= 1; count -= 1) {
      const shorter = wrap(sentences.slice(0, count).join('').trim());
      if (shorter.lines.length <= clamp.maxLines) {
        return toBlock(shorter, size, spec.lineHeight, wrapping, true);
      }
    }
  }
  // A cut block is filled greedily: as much of the text as its lines hold.
  const greedy = wrapUnits(breakUnits(spec.text, spec.lineBreak), wrapping);
  const cut = cutWithEllipsis(greedy.lines, clamp.maxLines, clamp.ellipsis, wrapping);
  return toBlock({ lines: cut, split: greedy.split }, size, spec.lineHeight, wrapping, true);
}

/**
 * The longest leading run of a separated list (`CC0 · Open source · 7% to
 * Protocol Guild`) that fits `width`, or `''` when not even the first item
 * does. A fact line drops whole items rather than breaking one.
 */
export function fitList(text: string, style: OgTextStyle, width: number, measure: OgMeasure) {
  const parts = text.split(/(\s*[·・]\s*)/u);
  for (let end = parts.length; end > 0; end -= 2) {
    const candidate = parts.slice(0, end).join('');
    if (measure(candidate, style) <= width) return candidate;
  }
  return '';
}

export interface StackInput {
  width: number;
  height: number;
  /** Space between blocks. */
  gap: number;
  ellipsis: string;
  eyebrow?: { spec: TextBlockSpec; size: number; maxLines: number };
  /**
   * Sizes largest first. The first size whose stack fits wins, ranked by: no
   * word split, then (with `keepClauses`) lines that end on clauses, then at
   * most `preferredLines`, then up to `maxLines`. A heading reads better a
   * size smaller than a line longer or a word broken.
   */
  title: {
    spec: TextBlockSpec;
    sizes: readonly number[];
    preferredLines: number;
    maxLines: number;
  };
  /** Sizes largest first; the subhead is always set whole when any size allows. */
  subhead?: { spec: TextBlockSpec; sizes: readonly number[] };
}

export interface StackPlan {
  eyebrow?: TextBlock;
  title: TextBlock;
  /** Absent when the subhead had no room at all. */
  subhead?: TextBlock;
  /** Height of the whole stack. */
  height: number;
}

/** Whether a clause ends before the text does (`锚定一枚签名，参与每个周期。`). */
function hasInnerClause(spec: TextBlockSpec): boolean {
  return breakUnits(spec.text, spec.lineBreak).slice(0, -1).some(endsClause);
}

function stackHeight(gap: number, blocks: ReadonlyArray<TextBlock | undefined>): number {
  const present = blocks.filter((block): block is TextBlock => Boolean(block && block.height));
  return present.reduce((total, block) => total + block.height, 0) + gap * (present.length - 1);
}

/**
 * The largest title, then subhead, whose whole stack fits the box (see
 * `StackInput.title` for the ranking). When nothing fits whole, the smallest
 * sizes are used, the title is cut to its line limit and the subhead to the
 * lines left (or dropped).
 */
export function fitStack(input: StackInput, measure: OgMeasure): StackPlan {
  const { width, height, gap, ellipsis, title, subhead } = input;
  const eyebrow = input.eyebrow
    ? layoutBlock(input.eyebrow.spec, input.eyebrow.size, width, measure, {
        maxLines: input.eyebrow.maxLines,
        ellipsis,
      })
    : undefined;
  const plan = (titleBlock: TextBlock, subheadBlock?: TextBlock): StackPlan => ({
    eyebrow,
    title: titleBlock,
    subhead: subheadBlock,
    height: stackHeight(gap, [eyebrow, titleBlock, subheadBlock]),
  });

  const titles = title.sizes.map((size) => layoutBlock(title.spec, size, width, measure));
  const subheads = subhead?.sizes.map((size) => layoutBlock(subhead.spec, size, width, measure));
  const clauses = Boolean(title.spec.keepClauses) && hasInnerClause(title.spec);
  const passes = (['none', 'hyphen'] as const).flatMap((split) =>
    (clauses && split === 'none' ? [true, false] : [false]).flatMap((onClauses) =>
      [title.preferredLines, title.maxLines].map((lineLimit) => ({ split, onClauses, lineLimit })),
    ),
  );
  for (const { split, onClauses, lineLimit } of passes) {
    for (const titleBlock of titles) {
      if (titleBlock.lines.length > lineLimit) continue;
      if (SPLIT_RANK[titleBlock.split] > SPLIT_RANK[split]) continue;
      if (onClauses && !titleBlock.clauseBreaks) continue;
      const candidates = subheads
        ? subheads
            .filter((block) => SPLIT_RANK[block.split] <= SPLIT_RANK[split])
            .map((block) => plan(titleBlock, block))
        : [plan(titleBlock)];
      const whole = candidates.find((candidate) => candidate.height <= height);
      if (whole) return whole;
    }
  }

  const titleSize = title.sizes[title.sizes.length - 1]!;
  const titleBlock = layoutBlock(title.spec, titleSize, width, measure, {
    maxLines: title.maxLines,
    ellipsis,
  });
  if (!subhead) return plan(titleBlock);
  const subheadSize = subhead.sizes[subhead.sizes.length - 1]!;
  const room = height - stackHeight(gap, [eyebrow, titleBlock]) - gap;
  const maxLines = Math.max(0, Math.floor(room / lineBox(subheadSize, subhead.spec.lineHeight)));
  if (maxLines === 0) return plan(titleBlock);
  const subheadBlock = layoutBlock(subhead.spec, subheadSize, width, measure, {
    maxLines,
    ellipsis,
    preferSentences: true,
  });
  return plan(titleBlock, subheadBlock);
}
