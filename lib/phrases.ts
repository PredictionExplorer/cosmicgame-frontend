/**
 * Phrase breaks for Chinese display text (docs/i18n/README.md §5).
 *
 * Chinese has no spaces, and no browser finds its phrases (Chrome's
 * `word-break: auto-phrase` covers Japanese only). Chinese headings are set
 * with `keep-all`, so they turn their lines at punctuation and spaces, and
 * with `overflow-wrap: anywhere` for a clause too long for the line. That
 * overflow break lands wherever the line runs out: inside a word (以太 | 坊)
 * or, worse, before a full stop, which then starts a line of its own.
 *
 * The fix is the one BudouX uses: authored break points inside long clauses,
 * so a heading turns between phrases. `phraseTokens` also glues every closing
 * mark to the character before it (and an opening mark to the one after it),
 * so even an overflow break never starts a line with 。 or ， or ends one
 * with 「. `<PhrasedText>` renders the tokens.
 */

/**
 * An authored break point: a zero-width space, written `​` in copy,
 * between two phrases of a clause too long for a phone line
 * (`读懂完整的​演绎周期。`). It stays in the text: it draws nothing, is a
 * line-break opportunity under `keep-all`, and, unlike `<wbr>`, adds no pause
 * to the accessible name.
 */
export const PHRASE_BREAK = '​';

export type PhraseToken =
  /** Text that breaks by the heading's own rules. */
  | { readonly type: 'text'; readonly text: string }
  /** A mark and the character it belongs to, which never part at a line end. */
  | { readonly type: 'keep'; readonly text: string };

const HAN = /[㐀-鿿豈-﫿]/;
/** Spaces and break points: nothing a mark could belong to. */
const GAP = /[\s​]/;
/** Marks that may not start a line: they close what comes before them. */
const CLOSING = new Set([
  '，',
  '、',
  '。',
  '；',
  '：',
  '！',
  '？',
  '）',
  '」',
  '』',
  '》',
  '〉',
  '】',
  '〕',
  '”',
  '’',
  '…',
]);
/** Marks that may not end a line: they open what comes after them. */
const OPENING = new Set(['（', '「', '『', '《', '〈', '【', '〔', '“', '‘']);

/**
 * Tokens for display text, or `null` for text without Han characters, which
 * breaks by its own script's rules (spaces, or the Japanese phrases the
 * browser finds) and needs no glue.
 */
export function phraseTokens(text: string): PhraseToken[] | null {
  if (!HAN.test(text)) return null;

  const tokens: PhraseToken[] = [];
  let run = '';
  let keep = '';
  let opening = '';
  const flushRun = () => {
    if (run) tokens.push({ type: 'text', text: run });
    run = '';
  };
  const flushKeep = () => {
    if (keep) tokens.push({ type: 'keep', text: keep });
    keep = '';
  };

  for (const char of text) {
    if (OPENING.has(char)) {
      flushKeep();
      opening += char;
    } else if (opening && !GAP.test(char)) {
      // An opening mark starts a keep with the character it opens.
      flushRun();
      keep = opening + char;
      opening = '';
    } else if (CLOSING.has(char) && keep) {
      keep += char;
    } else if (CLOSING.has(char)) {
      const chars = Array.from(run);
      const last = chars.at(-1);
      if (last !== undefined && !GAP.test(last)) {
        run = chars.slice(0, -1).join('');
        flushRun();
        keep = last + char;
      } else {
        run += char;
      }
    } else {
      flushKeep();
      run += opening + char;
      opening = '';
    }
  }
  flushKeep();
  run += opening;
  flushRun();
  return tokens;
}
