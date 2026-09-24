import { getLocaleConfig } from '@/i18n/localeConfig';

/** Han and kana: read by the character, not by the word. */
const CJK_CHARACTER = /[぀-ヿ㐀-䶿一-鿿豈-﫿]/g;
const WORD = /[\p{L}\p{N}]/u;

/** Characters a minute for Chinese and Japanese, words a minute for spaced scripts. */
const CJK_CHARACTERS_PER_MINUTE = 500;
const HANGUL_WORDS_PER_MINUTE = 200;
const WORDS_PER_MINUTE = 230;

function countWords(text: string): number {
  return text.split(/\s+/).filter((token) => WORD.test(token)).length;
}

/**
 * The minutes a text takes to read, never less than one: characters for
 * Chinese and Japanese (plus any Latin words among them), words for the
 * spaced scripts, at typical silent-reading speeds.
 */
export function readingMinutes(texts: readonly string[], locale: string): number {
  const text = texts.join(' ');
  const { scriptFamily } = getLocaleConfig(locale);
  if (scriptFamily === 'han') {
    const characters = text.match(CJK_CHARACTER)?.length ?? 0;
    const latinWords = countWords(text.replace(CJK_CHARACTER, ' '));
    return Math.max(
      1,
      Math.round(characters / CJK_CHARACTERS_PER_MINUTE + latinWords / WORDS_PER_MINUTE),
    );
  }
  const perMinute = scriptFamily === 'hangul' ? HANGUL_WORDS_PER_MINUTE : WORDS_PER_MINUTE;
  return Math.max(1, Math.round(countWords(text) / perMinute));
}
