/**
 * A small Rust highlighter for the /code viewer: enough of the lexical
 * grammar to colour one read-only file on the server, with no client
 * bundle. It recognises comments, strings, characters, lifetimes, numbers,
 * attributes, macros, keywords, types and function names; everything else
 * (identifiers, operators, whitespace) is plain text.
 */

export type RustTokenKind =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'type'
  | 'function'
  | 'macro'
  | 'attribute'
  | 'lifetime';

export interface RustToken {
  /** `null` for plain text. */
  kind: RustTokenKind | null;
  text: string;
}

/** One source line: its tokens, none of which contains a newline. */
export type RustLine = RustToken[];

const KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'break',
  'const',
  'continue',
  'crate',
  'dyn',
  'else',
  'enum',
  'extern',
  'false',
  'fn',
  'for',
  'if',
  'impl',
  'in',
  'let',
  'loop',
  'match',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'return',
  'self',
  'Self',
  'static',
  'struct',
  'super',
  'trait',
  'true',
  'type',
  'unsafe',
  'use',
  'where',
  'while',
]);

const PRIMITIVE_TYPES = new Set([
  'bool',
  'char',
  'str',
  'f32',
  'f64',
  'i8',
  'i16',
  'i32',
  'i64',
  'i128',
  'isize',
  'u8',
  'u16',
  'u32',
  'u64',
  'u128',
  'usize',
]);

/**
 * Tried in order at each position; the first match wins. Every pattern is
 * sticky (`y`), so it only matches at the current index.
 */
const RULES: ReadonlyArray<{ kind: RustTokenKind | 'word' | null; pattern: RegExp }> = [
  { kind: 'comment', pattern: /\/\/[^\n]*/y },
  { kind: 'comment', pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
  { kind: 'string', pattern: /b?r(#*)"[\s\S]*?"\1/y },
  { kind: 'string', pattern: /b?"(?:\\[\s\S]|[^"\\])*"?/y },
  // A character literal before a lifetime: 'a' and '\n' are characters, 'a is a lifetime.
  {
    kind: 'string',
    pattern: /b?'(?:\\(?:u\{[0-9a-fA-F]{1,6}\}|x[0-9a-fA-F]{2}|[\s\S])|[^\\'\n])'/y,
  },
  { kind: 'lifetime', pattern: /'[A-Za-z_]\w*/y },
  { kind: 'attribute', pattern: /#!?\[[^\]\n]*\]?/y },
  {
    kind: 'number',
    pattern:
      /(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.(?![.A-Za-z_])\d*[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)(?:[iu](?:8|16|32|64|128|size)|f32|f64)?/y,
  },
  { kind: 'word', pattern: /[A-Za-z_]\w*/y },
  { kind: null, pattern: /\s+/y },
  { kind: null, pattern: /[\s\S]/y },
];

/** What an identifier is, from the word itself, the word before it and the text after it. */
function classifyWord(word: string, previous: string | null, rest: string): RustTokenKind | null {
  if (KEYWORDS.has(word)) return 'keyword';
  if (PRIMITIVE_TYPES.has(word)) return 'type';
  // A definition's name, generic parameters and all: `fn plot<'a>(`.
  if (previous === 'fn') return 'function';
  if (/^!\s*[([{]/.test(rest) && !/^!=/.test(rest)) return 'macro';
  if (/^[A-Z]/.test(word)) return 'type';
  if (/^\s*(?:::\s*<[^>\n]*>\s*)?\(/.test(rest)) return 'function';
  return null;
}

/** The source as tokens, adjacent plain text merged. */
export function tokenizeRust(source: string): RustToken[] {
  const tokens: RustToken[] = [];
  const push = (kind: RustTokenKind | null, text: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind && kind === null) last.text += text;
    else tokens.push({ kind, text });
  };

  let index = 0;
  // The last identifier or keyword, for words whose role depends on it.
  let previousWord: string | null = null;
  while (index < source.length) {
    for (const rule of RULES) {
      rule.pattern.lastIndex = index;
      const match = rule.pattern.exec(source);
      if (!match || match[0].length === 0) continue;
      const text = match[0];
      if (rule.kind === 'word') {
        const rest = source.slice(index + text.length, index + text.length + 64);
        const kind = classifyWord(text, previousWord, rest);
        previousWord = text;
        // A macro's `!` belongs to its name.
        if (kind === 'macro') {
          push('macro', `${text}!`);
          index += text.length + 1;
          break;
        }
        push(kind, text);
      } else {
        // Whitespace keeps the word before it; anything else ends it.
        if (rule.kind !== null || text.trim()) previousWord = null;
        push(rule.kind, text);
      }
      index += text.length;
      break;
    }
  }
  return tokens;
}

/** The source split into lines of tokens, a multi-line token split at each newline. */
export function highlightRust(source: string): RustLine[] {
  const lines: RustLine[] = [[]];
  for (const token of tokenizeRust(source)) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ kind: token.kind, text: part });
    });
  }
  return lines;
}
