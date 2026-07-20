import {
  TERMINOLOGY_RULES,
  scanTerminology,
  validateTerminologyRules,
  type TerminologyRule,
} from '../terminology-consistency-core';

describe('Simplified-Chinese terminology consistency', () => {
  it('keeps the checked-in rule table structurally sound', () => {
    expect(validateTerminologyRules()).toEqual([]);
    expect(TERMINOLOGY_RULES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(TERMINOLOGY_RULES.map((rule) => rule.concept)).size).toBe(
      TERMINOLOGY_RULES.length,
    );
  });

  it('reports known drift with its canonical glossary rendering and line', () => {
    const hits = scanTerminology(['第一行保持规范。', '请查看宇宙委员会。'].join('\n'));

    expect(hits).toEqual([
      expect.objectContaining({
        concept: 'Cosmic Council',
        canonical: '宇宙议会',
        variant: '宇宙委员会',
        line: 2,
      }),
    ]);
  });

  it('accepts canonical renderings', () => {
    expect(scanTerminology('参与者在演绎周期中落笔，周期收官后由获配者取回分配。')).toEqual([]);
  });

  it('honors narrow source-only allow pragmas', () => {
    const source = [
      'const before = "宇宙委员会";',
      '// terminology-allow-start: quoted third-party wording',
      'const quotation = "手势与图库";',
      '// terminology-allow-end',
      'const after = "营销储备";',
      'const inline = "站点地图"; // terminology-allow-line: migration fixture',
    ].join('\n');

    const hits = scanTerminology(source);
    expect(hits.map(({ variant, line }) => ({ variant, line }))).toEqual([
      { variant: '宇宙委员会', line: 1 },
      { variant: '营销储备', line: 5 },
    ]);
  });

  it('reports malformed or ambiguous rule definitions', () => {
    const malformed: readonly TerminologyRule[] = [
      { concept: 'First', canonical: '规范词', variants: ['漂移词'] },
      { concept: 'Second', canonical: '', variants: ['漂移词'] },
      { concept: 'Third', canonical: '包含漂移词', variants: ['漂移词'] },
      { concept: 'Fourth', canonical: '另一个规范词', variants: [] },
    ];

    expect(validateTerminologyRules(malformed)).toEqual(
      expect.arrayContaining([
        'Second has an empty canonical rendering.',
        'Drift variant "漂移词" is owned by both First and Second.',
        'Third canonical rendering contains its drift variant "漂移词".',
        'Fourth has no drift variants.',
      ]),
    );
  });

  it('reports repeated occurrences instead of hiding later drift', () => {
    const customRules: readonly TerminologyRule[] = [
      { concept: 'Example', canonical: '规范词', variants: ['旧词'] },
    ];
    expect(scanTerminology('旧词与旧词', customRules)).toHaveLength(2);
  });
});
