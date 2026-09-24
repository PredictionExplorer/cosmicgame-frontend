import { getOgCopy } from '@/lib/og/copy';
import {
  breakUnits,
  endsClause,
  graphemeUnits,
  hyphenUnits,
  japanesePhrases,
  joinBrokenLine,
  joinUnits,
  ogUppercase,
  sentencesOf,
  type LineBreakUnit,
} from '@/lib/og/text';

const texts = (units: readonly LineBreakUnit[]) => units.map((unit) => unit.text);

describe('ogUppercase', () => {
  it('cases eyebrows with the locale’s own rules', () => {
    expect(ogUppercase('Як це працює', 'uk')).toBe('ЯК ЦЕ ПРАЦЮЄ');
    expect(ogUppercase('Câu hỏi thường gặp', 'vi')).toBe('CÂU HỎI THƯỜNG GẶP');
    expect(ogUppercase('Current Cycle', 'en')).toBe('CURRENT CYCLE');
  });
});

describe('japanesePhrases', () => {
  // F228: the gallery title used to break inside オンチェーン.
  it.each([
    [
      'すべての一筆がシグネチャーを形づくる。',
      ['すべての', '一筆が', 'シグネチャーを', '形づくる。'],
    ],
    ['三体の軌跡を、オンチェーンで描く。', ['三体の', '軌跡を、', 'オンチェーンで', '描く。']],
    [
      'シグネチャーを係留し、毎サイクルに参加する。',
      ['シグネチャーを', '係留し、', '毎サイクルに', '参加する。'],
    ],
    ['調律から配分まで、四つの段階で。', ['調律から', '配分まで、', '四つの', '段階で。']],
    ['一筆#1139・サイクル2', ['一筆', '#1139・', 'サイクル2']],
    // A dash pair stays whole and never starts a line.
    ['配分の分布——リアルタイムで。', ['配分の', '分布——', 'リアルタイムで。']],
  ])('%s', (text, phrases) => {
    expect(japanesePhrases(text)).toEqual(phrases);
    expect(japanesePhrases(text).join('')).toBe(text);
  });

  it('never splits a katakana word or starts a phrase with a particle or closing mark', () => {
    for (const route of ['default', 'gallery', 'anchoring', 'faq', 'howItWorks'] as const) {
      const { title, subhead } = getOgCopy('ja', route);
      for (const text of [title, subhead]) {
        const [, ...rest] = japanesePhrases(text);
        for (const phrase of rest) expect(phrase).not.toMatch(/^[\p{Script=Hiragana}、。・ー—]/u);
      }
    }
    expect(japanesePhrases('オンチェーンアート・プロトコル')).toEqual([
      'オンチェーンアート・',
      'プロトコル',
    ]);
  });

  it('keeps spaces with the phrase before them', () => {
    expect(japanesePhrases('ETH + RandomWalk一筆')).toEqual(['ETH ', '+ ', 'RandomWalk', '一筆']);
  });
});

describe('breakUnits', () => {
  it('breaks Chinese between characters but never before a closing mark', () => {
    expect(texts(breakUnits('每一笔，都在塑造签名。', 'anywhere'))).toEqual([
      '每',
      '一',
      '笔，',
      '都',
      '在',
      '塑',
      '造',
      '签',
      '名。',
    ]);
    // Latin inside Chinese stays whole; the spaces around it are break opportunities.
    expect(breakUnits('运行于 Arbitrum 的', 'anywhere')).toEqual([
      { text: '运', spaceAfter: false },
      { text: '行', spaceAfter: false },
      { text: '于', spaceAfter: true },
      { text: 'Arbitrum', spaceAfter: true },
      { text: '的', spaceAfter: false },
    ]);
  });

  it('breaks Latin, Cyrillic and Vietnamese at spaces, keeping compounds whole', () => {
    expect(texts(breakUnits('Перформанс-цикл наживо.', 'anywhere'))).toEqual([
      'Перформанс-цикл',
      'наживо.',
    ]);
    expect(texts(breakUnits('Chu kỳ trình diễn, trực tiếp.', 'anywhere'))).toEqual([
      'Chu',
      'kỳ',
      'trình',
      'diễn,',
      'trực',
      'tiếp.',
    ]);
  });

  // F228: the Korean default title used to break inside 빚어냅니다.
  it('keeps Korean words whole, particles attached', () => {
    const units = breakUnits(getOgCopy('ko', 'default').title, 'words');
    expect(texts(units)).toEqual(['모든', '제스처가', '시그니처를', '빚어냅니다.']);
    expect(units.map((unit) => unit.spaceAfter)).toEqual([true, true, true, false]);
    expect(texts(breakUnits('Cosmic Signature를 빚어냅니다', 'words'))).toEqual([
      'Cosmic',
      'Signature를',
      '빚어냅니다',
    ]);
  });

  it('breaks Japanese between phrases and marks where a space follows', () => {
    expect(breakUnits('ETH + RandomWalk一筆', 'phrases')).toEqual([
      { text: 'ETH', spaceAfter: true },
      { text: '+', spaceAfter: true },
      { text: 'RandomWalk', spaceAfter: false },
      { text: '一筆', spaceAfter: false },
    ]);
  });

  it('keeps a counter with its number and a separator with the item before it', () => {
    expect(texts(breakUnits('Gesture #1139 · Cycle 2', 'anywhere'))).toEqual([
      'Gesture',
      '#1139 ·',
      'Cycle 2',
    ]);
    expect(texts(breakUnits('사이클 999 배분', 'words'))).toEqual(['사이클 999', '배분']);
    expect(texts(breakUnits('第 999 个周期', 'anywhere'))).toEqual(['第 999', '个', '周', '期']);
    // `#` numbers may still start a line: `Signature / #000024`.
    expect(texts(breakUnits('Signature #000024', 'anywhere'))).toEqual(['Signature', '#000024']);
  });

  // Ukrainian typesetting never ends a line on a one-letter word.
  it('keeps a one-letter word with the word after it', () => {
    expect(texts(breakUnits('за напрямами — у реальному часі.', 'anywhere'))).toEqual([
      'за',
      'напрямами',
      '—',
      'у реальному',
      'часі.',
    ]);
    expect(texts(breakUnits('A deterministic simulation', 'anywhere'))).toEqual([
      'A deterministic',
      'simulation',
    ]);
    // Ideographs are single characters too, and still break on either side.
    expect(texts(breakUnits('于 Arbitrum', 'anywhere'))).toEqual(['于', 'Arbitrum']);
  });
});

describe('line helpers', () => {
  it('drops a spaced separator where a line breaks, but keeps Japanese ・', () => {
    const units = breakUnits('Gesture #1139 · Cycle 2', 'anywhere');
    expect(joinBrokenLine(units.slice(0, 2))).toBe('Gesture #1139');
    expect(joinUnits(units)).toBe('Gesture #1139 · Cycle 2');
    expect(joinBrokenLine(breakUnits('パフォーマンス・', 'phrases'))).toBe('パフォーマンス・');
  });

  it('knows where clauses end', () => {
    expect(endsClause({ text: '签名，', spaceAfter: false })).toBe(true);
    expect(endsClause({ text: 'Allocation,', spaceAfter: true })).toBe(true);
    expect(endsClause({ text: '#1139 ·', spaceAfter: true })).toBe(true);
    expect(endsClause({ text: 'パフォーマンス・', spaceAfter: false })).toBe(false);
    expect(endsClause({ text: 'stages.', spaceAfter: false })).toBe(false);
  });

  it('splits a unit at its hyphens, or into graphemes as a last resort', () => {
    expect(hyphenUnits({ text: 'Перформанс-цикл', spaceAfter: true })).toEqual([
      { text: 'Перформанс-', spaceAfter: false },
      { text: 'цикл', spaceAfter: true },
    ]);
    expect(hyphenUnits({ text: '0xA169…63B6', spaceAfter: false })).toBeNull();
    expect(hyphenUnits({ text: '-5', spaceAfter: false })).toBeNull();
    expect(texts(graphemeUnits({ text: 'Mỗi', spaceAfter: true }))).toEqual(['M', 'ỗ', 'i']);
  });

  it('splits sentences with CJK and Latin stops', () => {
    expect(sentencesOf('参加します。解除はいつでも。')).toEqual([
      '参加します。',
      '解除はいつでも。',
    ]);
    expect(sentencesOf('참여합니다. 해제는 언제든 가능합니다.')).toEqual([
      '참여합니다. ',
      '해제는 언제든 가능합니다.',
    ]);
  });
});
