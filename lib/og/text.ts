import { getLocaleConfig } from '@/i18n/localeConfig';

import type { OgLineBreak } from './fonts';

/*
 * Text preparation for Satori, which has no locale-aware
 * `text-transform: uppercase` and no phrase-aware line breaking.
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
/** Punctuation and marks that close a phrase: they belong to what precedes. */
const CLOSING = /^[、。，．・：；！？」』）〉》】〕］｝”’)\]}!?,.:;…‥ー〜～]+$/;
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

/** A run of text the card never breaks inside, and whether a space follows it. */
export interface LineBreakUnit {
  text: string;
  spaceAfter: boolean;
}

/**
 * The units a line may break between, or `null` when the renderer's own
 * breaking is right (`anywhere`: Chinese breaks between any two characters,
 * Latin at spaces). The card lays units out as a wrapping row, so a Korean
 * word or a Japanese phrase is never split across lines.
 */
export function lineBreakUnits(text: string, mode: OgLineBreak): LineBreakUnit[] | null {
  if (mode === 'anywhere') return null;
  const pieces = mode === 'words' ? text.split(/(?<=\s)(?=\S)/) : japanesePhrases(text);
  return pieces
    .map((piece) => ({ text: piece.trim(), spaceAfter: /\s$/.test(piece) }))
    .filter((unit) => unit.text !== '');
}
