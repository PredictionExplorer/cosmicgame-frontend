import { COSMIC_SIGNATURE_CODE } from '../cosmicSignatureCode';
import { highlightRust, tokenizeRust, type RustToken } from '../highlightRust';

/** The tokens that carry a colour, as `kind:text`. */
const coloured = (source: string) =>
  tokenizeRust(source)
    .filter((token): token is RustToken & { kind: NonNullable<RustToken['kind']> } =>
      Boolean(token.kind),
    )
    .map((token) => `${token.kind}:${token.text}`);

describe('tokenizeRust', () => {
  it('reproduces the source exactly', () => {
    const text = tokenizeRust(COSMIC_SIGNATURE_CODE)
      .map((token) => token.text)
      .join('');
    expect(text).toBe(COSMIC_SIGNATURE_CODE);
  });

  it('recognises keywords, types, functions and macros', () => {
    expect(coloured('pub fn next_byte(&mut self) -> u8 { println!("{}", x); Vec::new() }')).toEqual(
      [
        'keyword:pub',
        'keyword:fn',
        'function:next_byte',
        'keyword:mut',
        'keyword:self',
        'type:u8',
        'macro:println!',
        'string:"{}"',
        'type:Vec',
        'function:new',
      ],
    );
  });

  it('tells character literals from lifetimes', () => {
    expect(coloured("fn f<'a>(s: &'a str) -> char { '\\n' }")).toEqual([
      'keyword:fn',
      'function:f',
      "lifetime:'a",
      "lifetime:'a",
      'type:str',
      'type:char',
      "string:'\\n'",
    ]);
  });

  it('reads numbers with suffixes, underscores and exponents, but not ranges or methods', () => {
    expect(coloured('let x = 1_000u64 + 2.5e-3 + 0xFF;')).toEqual([
      'keyword:let',
      'number:1_000u64',
      'number:2.5e-3',
      'number:0xFF',
    ]);
    expect(coloured('for i in 0..10 {}')).toEqual([
      'keyword:for',
      'keyword:in',
      'number:0',
      'number:10',
    ]);
    expect(coloured('let y = 1.max(2);')).toEqual([
      'keyword:let',
      'number:1',
      'function:max',
      'number:2',
    ]);
  });

  it('keeps comments, attributes and strings whole', () => {
    expect(coloured('#[derive(Debug)] // a "quoted" word\nlet s = "a // b";')).toEqual([
      'attribute:#[derive(Debug)]',
      'comment:// a "quoted" word',
      'keyword:let',
      'string:"a // b"',
    ]);
  });

  it('does not mistake a not-equal comparison for a macro', () => {
    expect(coloured('if a!=b {}')).toEqual(['keyword:if']);
  });
});

describe('highlightRust', () => {
  it('splits the file into its lines, a block comment across lines included', () => {
    const lines = highlightRust('/* one\ntwo */\nfn main() {}');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual([{ kind: 'comment', text: '/* one' }]);
    expect(lines[1]).toEqual([{ kind: 'comment', text: 'two */' }]);
  });

  it('gives an empty line no tokens', () => {
    expect(highlightRust('a\n\nb')[1]).toEqual([]);
  });

  it('returns one line per source line for the published program', () => {
    expect(highlightRust(COSMIC_SIGNATURE_CODE)).toHaveLength(
      COSMIC_SIGNATURE_CODE.split('\n').length,
    );
  });
});
