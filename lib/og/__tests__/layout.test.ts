import {
  fitList,
  fitStack,
  layoutBlock,
  lineBox,
  type StackInput,
  type TextBlockSpec,
} from '@/lib/og/layout';
import type { OgMeasure, OgTextFace } from '@/lib/og/measure';

/**
 * A measure with round numbers: Latin half an em, CJK a full em, and the
 * tracking after every glyph, the way the real one adds it. The real faces
 * are exercised by measure.test.ts and card-fit.test.tsx.
 */
const WIDE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const measure: OgMeasure = (text, style) => {
  let width = 0;
  for (const character of text) {
    width += (WIDE.test(character) ? 1 : 0.5) * style.size;
    width += (style.letterSpacingEm ?? 0) * style.size;
  }
  return width;
};

const FACE: OgTextFace = { families: ['Test'], weight: 400 };
const spec = (text: string, overrides: Partial<TextBlockSpec> = {}): TextBlockSpec => ({
  text,
  face: FACE,
  lineBreak: 'anywhere',
  lineHeight: 1.2,
  ...overrides,
});
// At 10px every Latin letter and space is 5px wide.
const lay = (text: string, width: number, overrides: Partial<TextBlockSpec> = {}) =>
  layoutBlock(spec(text, overrides), 10, width, measure);

describe('layoutBlock', () => {
  it('breaks greedily at spaces and measures every line it draws', () => {
    const block = lay('aaaa bbbb cccc', 50);
    expect(block.lines).toEqual(['aaaa bbbb', 'cccc']);
    expect(block.width).toBe(45);
    expect(block.height).toBe(2 * lineBox(10, 1.2));
    expect(block).toEqual(expect.objectContaining({ truncated: false, split: 'none' }));
  });

  it('rounds each line box the way Satori does', () => {
    expect(lineBox(28, 1.55)).toBe(43);
    expect(lineBox(40, 1.22)).toBe(49);
  });

  it('balances a heading: as many lines as a greedy fill, as even as they go', () => {
    expect(lay('aa bb cc dd ee', 55).lines).toEqual(['aa bb cc dd', 'ee']);
    expect(lay('aa bb cc dd ee', 55, { textWrap: 'balance' }).lines).toEqual(['aa bb cc', 'dd ee']);
  });

  it('breaks a heading after its clause when that takes no more lines', () => {
    expect(lay('aa bb, cc dd ee', 55).lines).toEqual(['aa bb, cc', 'dd ee']);
    const block = lay('aa bb, cc dd ee', 55, { textWrap: 'balance' });
    expect(block.lines).toEqual(['aa bb,', 'cc dd ee']);
    expect(block.clauseBreaks).toBe(true);
  });

  it('keeps a paragraph from ending on a lone word', () => {
    expect(lay('aa bb cc dd', 50).lines).toEqual(['aa bb cc', 'dd']);
    expect(lay('aa bb cc dd', 50, { textWrap: 'pretty' }).lines).toEqual(['aa bb', 'cc dd']);
    // Not at the price of a lone word on the line before.
    expect(lay('aaaa bbbb cc', 45, { textWrap: 'pretty' }).lines).toEqual(['aaaa bbbb', 'cc']);
  });

  it('never starts a line with a separator, and drops it where the line breaks', () => {
    const block = lay('Gesture #1139 · Cycle 2', 80, { textWrap: 'balance' });
    expect(block.lines).toEqual(['Gesture #1139', 'Cycle 2']);
    expect(block.clauseBreaks).toBe(true);
  });

  it('keeps a counter on the line of its number', () => {
    // `Cycle 999` is 45px, `allocations` 55px.
    for (const width of [60, 80, 100]) {
      expect(lay('Cycle 999 allocations', width).lines).toEqual(['Cycle 999', 'allocations']);
    }
  });

  it('splits a compound at its hyphen before it splits a word', () => {
    // At 20px the compound is 150px: too wide for 140, its halves are not.
    const block = layoutBlock(spec('Перформанс-цикл наживо.'), 20, 140, measure);
    expect(block.lines).toEqual(['Перформанс-', 'цикл наживо.']);
    expect(block.split).toBe('hyphen');
    expect(block.width).toBeLessThanOrEqual(140);
  });

  it('breaks between characters only when nothing else fits, and says so', () => {
    const block = layoutBlock(spec('0xA169…63B6'), 20, 60, measure);
    expect(block.split).toBe('grapheme');
    expect(block.lines.join('')).toBe('0xA169…63B6');
    expect(block.width).toBeLessThanOrEqual(60);
  });

  it('keeps Korean words and Japanese phrases whole', () => {
    const korean = layoutBlock(
      spec('앵커링된 NFT는 사이클마다 앵커링 지급에 비례하여 참여합니다.', { lineBreak: 'words' }),
      20,
      160,
      measure,
    );
    for (const line of korean.lines) expect(line).toMatch(/^\S.*\S$/u);
    expect(korean.lines.join(' ')).toBe(
      '앵커링된 NFT는 사이클마다 앵커링 지급에 비례하여 참여합니다.',
    );
    const japanese = layoutBlock(
      spec('オンチェーンのシードから生まれる三体の軌跡。', { lineBreak: 'phrases' }),
      20,
      240,
      measure,
    );
    expect(japanese.lines).toEqual(['オンチェーンのシードから', '生まれる三体の軌跡。']);
  });

  describe('when a block must be cut', () => {
    const clamp = { maxLines: 1, ellipsis: '…' };

    it('ends on the last whole sentence that fits', () => {
      // Sentences start with a capital (UAX #29 does not break before `cccc`).
      const block = layoutBlock(spec('Aaaa bbbb. Cccc dddd.'), 10, 55, measure, {
        ...clamp,
        preferSentences: true,
      });
      expect(block.lines).toEqual(['Aaaa bbbb.']);
      expect(block.truncated).toBe(true);
    });

    it('else ends on a whole unit and the locale’s ellipsis, never on a comma', () => {
      expect(layoutBlock(spec('aaaa bbbb cccc dddd'), 10, 55, measure, clamp).lines).toEqual([
        'aaaa bbbb…',
      ]);
      expect(layoutBlock(spec('aaaa, bbbb cccc'), 10, 50, measure, clamp).lines).toEqual(['aaaa…']);
      const cjk = layoutBlock(
        spec('係留中のシグネチャーは、サイクルごとの係留配分に比例して参加します。', {
          lineBreak: 'phrases',
        }),
        20,
        240,
        measure,
        { maxLines: 1, ellipsis: '…' },
      );
      expect(cjk.lines).toEqual(['係留中のシグネチャーは…']);
      expect(cjk.width).toBeLessThanOrEqual(240);
    });

    it('draws nothing when no line is left', () => {
      const block = layoutBlock(spec('aaaa'), 10, 55, measure, { maxLines: 0, ellipsis: '…' });
      expect(block).toEqual(expect.objectContaining({ lines: [], height: 0, truncated: true }));
    });
  });
});

describe('fitStack', () => {
  // `aaaa bbbb cccc` takes two lines at 40px and 30px in 200px, one at 20px.
  const input = (overrides: Partial<StackInput> = {}): StackInput => ({
    width: 200,
    height: 200,
    gap: 10,
    ellipsis: '…',
    title: {
      spec: spec('aaaa bbbb cccc', { textWrap: 'balance' }),
      sizes: [40, 30, 20],
      preferredLines: 2,
      maxLines: 3,
    },
    subhead: { spec: spec('aaaa bbbb cccc dddd'), sizes: [16, 12] },
    ...overrides,
  });

  it('keeps the largest title that leaves room for the whole subhead', () => {
    const plan = fitStack(input(), measure);
    expect(plan.title).toEqual(expect.objectContaining({ size: 40, lines: ['aaaa bbbb', 'cccc'] }));
    expect(plan.subhead).toEqual(expect.objectContaining({ truncated: false, size: 16 }));
    expect(plan.height).toBe(plan.title.height + 10 + plan.subhead!.height);
    expect(plan.height).toBeLessThanOrEqual(200);
    // Less room: sizes step down, the subhead's first, before anything is cut.
    const tighter = fitStack(input({ height: 100 }), measure);
    expect(tighter.title.size).toBe(30);
    expect(tighter.subhead).toEqual(expect.objectContaining({ size: 12, truncated: false }));
    expect(tighter.height).toBeLessThanOrEqual(100);
  });

  it('prefers a size smaller to a line longer', () => {
    const title = { ...input().title, preferredLines: 1 };
    const plan = fitStack(input({ title }), measure);
    expect(plan.title).toEqual(expect.objectContaining({ size: 20, lines: ['aaaa bbbb cccc'] }));
  });

  it('prefers a size smaller to a word split', () => {
    const plan = fitStack(
      input({
        width: 140,
        title: {
          spec: spec('Перформанс-цикл наживо.', { textWrap: 'balance' }),
          sizes: [20, 16],
          preferredLines: 2,
          maxLines: 3,
        },
        subhead: undefined,
      }),
      measure,
    );
    expect(plan.title).toEqual(
      expect.objectContaining({ size: 16, split: 'none', lines: ['Перформанс-цикл', 'наживо.'] }),
    );
  });

  it('prefers breaks on clauses where a line may break inside a word', () => {
    const title = spec('三体轨迹，以链上种子生成。', { textWrap: 'balance', keepClauses: true });
    const sizes = [28, 24];
    // At 28px only a break inside the second clause keeps two lines.
    const plan = fitStack(
      input({ title: { spec: title, sizes, preferredLines: 2, maxLines: 2 }, subhead: undefined }),
      measure,
    );
    expect(plan.title).toEqual(
      expect.objectContaining({ size: 24, lines: ['三体轨迹，', '以链上种子生成。'] }),
    );
    // Without the preference the larger size wins.
    const loose = fitStack(
      input({
        title: { spec: { ...title, keepClauses: false }, sizes, preferredLines: 2, maxLines: 2 },
        subhead: undefined,
      }),
      measure,
    );
    expect(loose.title.size).toBe(28);
  });

  it('counts the eyebrow and its gap', () => {
    const plan = fitStack(
      input({ eyebrow: { spec: spec('EYEBROW'), size: 10, maxLines: 1 } }),
      measure,
    );
    expect(plan.eyebrow?.lines).toEqual(['EYEBROW']);
    expect(plan.height).toBe(
      plan.eyebrow!.height + 10 + plan.title.height + 10 + plan.subhead!.height,
    );
  });

  it('cuts the subhead at a sentence, then drops it, when nothing fits whole', () => {
    const long = spec('One two three four five. Six seven eight nine ten eleven twelve.');
    const cramped = fitStack(input({ height: 60, subhead: { spec: long, sizes: [12] } }), measure);
    expect(cramped.title.size).toBe(20);
    expect(cramped.subhead).toEqual(
      expect.objectContaining({ truncated: true, lines: ['One two three four five.'] }),
    );
    expect(cramped.height).toBeLessThanOrEqual(60);

    const dropped = fitStack(input({ height: 40, subhead: { spec: long, sizes: [12] } }), measure);
    expect(dropped.subhead).toBeUndefined();
  });
});

describe('fitList', () => {
  const style = { ...FACE, size: 10 };

  it('drops whole items from the end of a fact line until it fits', () => {
    expect(fitList('CC0 · Open source · Protocol Guild', style, 1000, measure)).toBe(
      'CC0 · Open source · Protocol Guild',
    );
    expect(fitList('CC0 · Open source · Protocol Guild', style, 100, measure)).toBe(
      'CC0 · Open source',
    );
    expect(fitList('CC0・オープンソース', style, 30, measure)).toBe('CC0');
    expect(fitList('Protocol Guild', style, 20, measure)).toBe('');
  });
});
