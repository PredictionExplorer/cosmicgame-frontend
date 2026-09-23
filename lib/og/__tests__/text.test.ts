import { getOgCopy } from '@/lib/og/copy';
import { japanesePhrases, lineBreakUnits, ogUppercase } from '@/lib/og/text';

const texts = (units: ReturnType<typeof lineBreakUnits>) => units?.map((unit) => unit.text);

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
  ])('%s', (text, phrases) => {
    expect(japanesePhrases(text)).toEqual(phrases);
    expect(japanesePhrases(text).join('')).toBe(text);
  });

  it('never splits a katakana word or starts a phrase with a particle or closing mark', () => {
    for (const route of ['default', 'gallery', 'anchoring', 'faq', 'howItWorks'] as const) {
      const [, ...rest] = japanesePhrases(getOgCopy('ja', route).title);
      for (const phrase of rest) expect(phrase).not.toMatch(/^[\p{Script=Hiragana}、。・ー]/u);
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

describe('lineBreakUnits', () => {
  it('leaves Chinese and Latin breaking to the renderer', () => {
    expect(lineBreakUnits('每一笔，都在塑造签名。', 'anywhere')).toBeNull();
  });

  // F228: the Korean default title used to break inside 빛어냅니다.
  it('keeps Korean words whole, particles attached', () => {
    const units = lineBreakUnits(getOgCopy('ko', 'default').title, 'words');
    expect(texts(units)).toEqual(['모든', '제스처가', '시그니처를', '빚어냅니다.']);
    expect(units?.map((unit) => unit.spaceAfter)).toEqual([true, true, true, false]);
    expect(texts(lineBreakUnits('Cosmic Signature를 빚어냅니다', 'words'))).toEqual([
      'Cosmic',
      'Signature를',
      '빚어냅니다',
    ]);
  });

  it('breaks Japanese titles between phrases and marks where a space follows', () => {
    const units = lineBreakUnits('ETH + RandomWalk一筆', 'phrases');
    expect(units).toEqual([
      { text: 'ETH', spaceAfter: true },
      { text: '+', spaceAfter: true },
      { text: 'RandomWalk', spaceAfter: false },
      { text: '一筆', spaceAfter: false },
    ]);
  });
});
