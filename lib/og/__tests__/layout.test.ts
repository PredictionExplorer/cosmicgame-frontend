import { estimateLines, fitStack, widthInEms, type StackInput } from '@/lib/og/layout';

const metrics = { titleLineHeight: 1.04, subheadLineHeight: 1.36, eyebrowBlock: 56, gap: 22 };

const input = (overrides: Partial<StackInput> = {}): StackInput => ({
  title: 'Every Gesture Shapes the Signature.',
  titleBreak: 'anywhere',
  subhead: 'A procedural on-chain art protocol on Arbitrum.',
  subheadBreak: 'anywhere',
  hasEyebrow: false,
  width: 408,
  height: 381,
  titleSizes: [64, 58, 52, 46, 40],
  subheadSizes: [28],
  maxTitleLines: 4,
  ...overrides,
});

describe('share-card text fitting', () => {
  it('counts full-width glyphs as one em and Latin as about half', () => {
    expect(widthInEms('签名')).toBe(2);
    expect(widthInEms('シグネチャー')).toBe(6);
    expect(widthInEms('시그니처')).toBe(4);
    expect(widthInEms('ab')).toBeCloseTo(1.1);
  });

  it('estimates more lines for narrower columns and for unbreakable units', () => {
    expect(estimateLines('word '.repeat(20), 40, 400, 'anywhere')).toBeGreaterThan(
      estimateLines('word '.repeat(20), 40, 800, 'anywhere'),
    );
    expect(estimateLines('어'.repeat(40), 40, 400, 'words')).toBeGreaterThanOrEqual(
      estimateLines('어'.repeat(40), 40, 400, 'anywhere'),
    );
    expect(estimateLines('x', 80, 400, 'anywhere')).toBe(1);
  });

  it('keeps the largest title that leaves room for the whole subhead', () => {
    const fit = fitStack(input(), metrics);
    expect(fit.titleSize).toBe(64);
    expect(fit.subheadLines).toBeGreaterThan(0);
    const height =
      fit.titleLines * fit.titleSize * metrics.titleLineHeight +
      metrics.gap +
      fit.subheadLines * fit.subheadSize * metrics.subheadLineHeight;
    expect(height).toBeLessThanOrEqual(381);
  });

  // The Japanese gallery card used to push its subhead into the footer.
  it('steps the title down before the stack outgrows its box', () => {
    const long = fitStack(
      input({
        title: 'オンチェーンのシードから生まれる三体の軌跡。',
        titleBreak: 'phrases',
        subhead:
          'すべてのシグネチャーは、オンチェーンのシードから始まる決定論的な三体シミュレーションをスペクトルレンダリングしたものです。',
        hasEyebrow: true,
        width: 1040,
        height: 341,
        titleSizes: [80, 72, 64, 56, 48],
        subheadSizes: [32, 30, 28],
        maxTitleLines: 3,
      }),
      { ...metrics, titleLineHeight: 1.22, subheadLineHeight: 1.55 },
    );
    expect(long.titleSize).toBeLessThan(80);
    const height =
      56 +
      long.titleLines * long.titleSize * 1.22 +
      22 +
      long.subheadLines * long.subheadSize * 1.55;
    expect(height).toBeLessThanOrEqual(341);
  });

  it('clamps the subhead, or drops it, when nothing fits whole', () => {
    const cramped = fitStack(
      input({ title: 'A '.repeat(80), subhead: 'B '.repeat(200), height: 300 }),
      metrics,
    );
    expect(cramped.titleSize).toBe(40);
    expect(cramped.titleLines).toBeLessThanOrEqual(4);
    const dropped = fitStack(
      input({ title: 'A '.repeat(80), subhead: 'B '.repeat(200), height: 150 }),
      metrics,
    );
    expect(dropped.subheadLines).toBe(0);
  });
});
