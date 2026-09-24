import { getLocaleConfig } from '@/i18n/localeConfig';

import type { OgLineBreak } from './fonts';

/*
 * Text preparation for Satori, which has no locale-aware
 * `text-transform: uppercase` and no phrase-aware line breaking. The card
 * breaks its own lines (lib/og/layout.ts) between the units defined here.
 */

/**
 * The eyebrow's capitals, cased by the locale's own rules (`toLocaleUpperCase`)
 * rather than by the renderer. The font subsets are cut from the same
 * transform (scripts/build-og-fonts-core.ts), so every capital a card draws
 * is in its face and a word never switches font mid-way.
 */
export function ogUppercase(text: string, locale: string | undefined): string {
  return text.toLocaleUpperCase(getLocaleConfig(locale).intlLocale);
}

const HIRAGANA = /^\p{Script=Hiragana}+$/u;
// Katakana letters and the prolonged-sound mark ー; the middle dot ・ is punctuation here.
const KATAKANA = /^[\p{Script=Katakana}ー]+$/u;
const ENDS_WITH_KATAKANA = /[\p{Script=Katakana}ー]$/u;
const KANJI = /^[\p{Script=Han}〆]+$/u;
const ENDS_WITH_WORD_CHARACTER = /[\p{Script=Han}\p{Script=Katakana}ー〆#＃]$/u;
const DIGITS = /^[0-9０-９]+$/;
/** Characters that open a phrase: they belong to what follows. */
const OPENING = /^[「『（〈《【〔［｛“‘([{#＃]+$/;
/** One-kanji prefixes (毎サイクル, 各トラック, 第2): part of the word that follows. */
const PREFIX = /^[毎各全第約再非未無超]$/;
/** Punctuation and marks that close a phrase: they belong to what precedes (a dash pair too). */
const CLOSING = /^[、。，．・：；！？」』）〉》】〕］｝”’)\]}!?,.:;…‥ー〜～—―]+$/;
const WHITESPACE = /^\s+$/;

let japaneseWords: Intl.Segmenter | undefined;

/**
 * Splits Japanese text into phrases (文節) a line may break between, the way
 * BudouX and the site's `word-break: auto-phrase` headings do: particles,
 * okurigana and punctuation stay with the word before them, compound kanji
 * and katakana runs stay whole, and opening brackets and one-kanji prefixes
 * go with what follows.
 * A phrase keeps the whitespace that follows it.
 *
 *   すべての一筆がシグネチャーを形づくる。 → すべての | 一筆が | シグネチャーを | 形づくる。
 */
export function japanesePhrases(text: string): string[] {
  japaneseWords ??= new Intl.Segmenter('ja', { granularity: 'word' });
  const phrases: string[] = [];
  let opening = '';
  for (const { segment } of japaneseWords.segment(text)) {
    const last = phrases.length - 1;
    const previous = phrases[last];
    if (WHITESPACE.test(segment)) {
      if (previous !== undefined) phrases[last] = previous + segment;
      continue;
    }
    if (OPENING.test(segment) || PREFIX.test(segment)) {
      opening += segment;
      continue;
    }
    const attaches =
      previous !== undefined &&
      opening === '' &&
      !/\s$/.test(previous) &&
      (CLOSING.test(segment) ||
        HIRAGANA.test(segment) ||
        (KATAKANA.test(segment) && ENDS_WITH_KATAKANA.test(previous)) ||
        (KANJI.test(segment) && KANJI.test(previous)) ||
        (DIGITS.test(segment) && ENDS_WITH_WORD_CHARACTER.test(previous)));
    if (attaches) {
      phrases[last] = previous + segment;
    } else {
      phrases.push(opening + segment);
      opening = '';
    }
  }
  if (opening) phrases.push(opening);
  return phrases;
}

/*
 * `anywhere` breaking, a conservative reading of the Unicode line-breaking
 * rules (UAX #14): a line may break at a space, before or after an ideograph,
 * kana or Hangul syllable, but never before a closing mark or small kana and
 * never after an opening one (kinsoku). Latin runs, hyphenated compounds and
 * numbers with their units stay whole.
 */

/** Ideographs, kana and Hangul: a line may break on either side of one. */
const IDEOGRAPHIC = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}々〆]/u;
/** Full-width stops and closing marks: a line may break after one. */
const FULL_WIDTH_CLOSING = /[、。，．：；！？」』）〉》】〕］｝・]/u;
/** No line starts with these: closing marks, stops, small kana, the long vowel, dashes, units. */
const NO_BREAK_BEFORE =
  /[、。，．・：；！？」』）〉》】〕］｝”’)\]}!?,.:;…‥ー〜～%％ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶ—–-]/u;
/** No line ends with these: opening brackets and quotes. */
const NO_BREAK_AFTER = /[「『（〈《【〔［｛“‘([{]/u;
const FULL_WIDTH_OPENING = /[「『（〈《【〔［｛]/u;

let graphemeSegmenter: Intl.Segmenter | undefined;

function graphemesOf(text: string): string[] {
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
}

function mayBreakBetween(previous: string, next: string): boolean {
  if (NO_BREAK_BEFORE.test(next) || NO_BREAK_AFTER.test(previous)) return false;
  return (
    IDEOGRAPHIC.test(next) ||
    FULL_WIDTH_OPENING.test(next) ||
    IDEOGRAPHIC.test(previous) ||
    FULL_WIDTH_CLOSING.test(previous)
  );
}

/** A run of text a line never breaks inside, and whether a space follows it. */
export interface LineBreakUnit {
  text: string;
  spaceAfter: boolean;
}

function anywhereUnits(text: string): LineBreakUnit[] {
  const units: LineBreakUnit[] = [];
  let current = '';
  let previous = '';
  const flush = (spaceAfter: boolean) => {
    if (current) units.push({ text: current, spaceAfter });
    else if (spaceAfter && units.length > 0) units[units.length - 1]!.spaceAfter = true;
    current = '';
  };
  for (const grapheme of graphemesOf(text)) {
    if (WHITESPACE.test(grapheme)) {
      flush(true);
      previous = '';
      continue;
    }
    if (current && mayBreakBetween(previous, grapheme)) flush(false);
    current += grapheme;
    previous = grapheme;
  }
  flush(false);
  return units;
}

/** A bare number (`999`, `1,000`): it stays on the line of the word before it. */
const BARE_NUMBER = /^\d[\d.,]*$/;
/** A list separator standing between spaces (`Gesture #1139 · Cycle 2`). */
const SEPARATOR = /^[·・]$/u;
/**
 * A spaced middle dot ending a line: it only joined two items, so it is
 * dropped where the line breaks. Japanese ・ is kept: it is part of a term
 * (パフォーマンス・サイクル), not a list separator.
 */
const TRAILING_SEPARATOR = /\s+·$/u;

/** A one-letter word (`a`, `у`, `і`, `з`): it never ends a line (Ukrainian typesetting rule). */
const ONE_LETTER_WORD = /^[\p{Script=Latin}\p{Script=Cyrillic}]$/u;

/**
 * Keeps together what reads as one: a counter and its number (`Cycle 999`,
 * `第 999`, `사이클 999`), a separator with the item before it, and a one-letter
 * word with the word after it, so no line starts with `·` or a stray number
 * and none ends on `у` or `a`.
 */
function bindUnits(units: readonly LineBreakUnit[]): LineBreakUnit[] {
  const bound: LineBreakUnit[] = [];
  for (const unit of units) {
    const previous = bound[bound.length - 1];
    const joinsPrevious =
      previous?.spaceAfter &&
      (BARE_NUMBER.test(unit.text) ||
        SEPARATOR.test(unit.text) ||
        ONE_LETTER_WORD.test(previous.text.split(' ').at(-1) ?? ''));
    if (joinsPrevious) {
      bound[bound.length - 1] = {
        text: `${previous.text} ${unit.text}`,
        spaceAfter: unit.spaceAfter,
      };
    } else {
      bound.push({ ...unit });
    }
  }
  return bound;
}

/**
 * The units a line may break between: Korean words (`words`, like the site's
 * `word-break: keep-all`), Japanese phrases (`phrases`, like
 * `word-break: auto-phrase`), or the `anywhere` opportunities above (Chinese
 * between characters, Latin at spaces).
 */
export function breakUnits(text: string, mode: OgLineBreak): LineBreakUnit[] {
  if (mode === 'anywhere') return bindUnits(anywhereUnits(text));
  const pieces = mode === 'words' ? text.split(/(?<=\s)(?=\S)/) : japanesePhrases(text);
  return bindUnits(
    pieces
      .map((piece) => ({ text: piece.trim(), spaceAfter: /\s$/.test(piece) }))
      .filter((unit) => unit.text !== ''),
  );
}

/** Whether this unit ends a clause: a comma, semicolon or colon, or a spaced list separator. */
export function endsClause(unit: LineBreakUnit): boolean {
  return /[,，、;；:：]$/u.test(unit.text) || TRAILING_SEPARATOR.test(unit.text);
}

/** The text of a line of units, spaced as the source was. */
export function joinUnits(units: readonly LineBreakUnit[]): string {
  return units
    .map((unit, index) =>
      unit.spaceAfter && index < units.length - 1 ? `${unit.text} ` : unit.text,
    )
    .join('');
}

/**
 * The text of a line that breaks before the end of its block: a separator
 * that joined it to the next item has nothing left to join (`Gesture #1139`,
 * not `Gesture #1139 ·`).
 */
export function joinBrokenLine(units: readonly LineBreakUnit[]): string {
  return joinUnits(units).replace(TRAILING_SEPARATOR, '');
}

/** Splits a unit at its hyphens (`Перформанс-` + `цикл`), or `null` when it has none. */
export function hyphenUnits(unit: LineBreakUnit): LineBreakUnit[] | null {
  const pieces = unit.text.split(/(?<=\p{L}[-‐])(?=\p{L})/u);
  if (pieces.length < 2) return null;
  return pieces.map((text, index) => ({
    text,
    spaceAfter: index === pieces.length - 1 ? unit.spaceAfter : false,
  }));
}

/** Splits a unit wider than any line into grapheme-sized units, for a hard break. */
export function graphemeUnits(unit: LineBreakUnit): LineBreakUnit[] {
  const pieces = graphemesOf(unit.text);
  return pieces.map((text, index) => ({
    text,
    spaceAfter: index === pieces.length - 1 ? unit.spaceAfter : false,
  }));
}

let sentenceSegmenter: Intl.Segmenter | undefined;

/** Sentences of `text`, each with the whitespace that follows it (UAX #29). */
export function sentencesOf(text: string): string[] {
  sentenceSegmenter ??= new Intl.Segmenter(undefined, { granularity: 'sentence' });
  return Array.from(sentenceSegmenter.segment(text), ({ segment }) => segment);
}
