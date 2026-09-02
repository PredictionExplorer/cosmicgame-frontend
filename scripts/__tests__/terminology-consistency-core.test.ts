import { TRANSLATED_LOCALES } from '../../i18n/routing';
import {
  TERMINOLOGY_PACKS,
  TERMINOLOGY_RULES,
  scanTerminology,
  validateTerminologyPacks,
  validateTerminologyRules,
  type TerminologyRule,
} from '../terminology-consistency-core';

describe('terminology packs', () => {
  it('ships one structurally sound pack per translated locale', () => {
    expect(Object.keys(TERMINOLOGY_PACKS).sort()).toEqual([...TRANSLATED_LOCALES].sort());
    expect(validateTerminologyPacks()).toEqual([]);
    for (const locale of TRANSLATED_LOCALES) {
      const { rules, glossary } = TERMINOLOGY_PACKS[locale];
      expect(glossary).toBe(`docs/i18n/glossary-${locale}.md`);
      expect(rules.length).toBeGreaterThanOrEqual(20);
      expect(new Set(rules.map((rule) => rule.concept)).size).toBe(rules.length);
    }
  });
});

describe('Ukrainian terminology consistency', () => {
  const uk = TERMINOLOGY_PACKS.uk;

  it('catches inflected drift through word-initial stems', () => {
    const hits = scanTerminology('Кошти надійдуть одержувачеві розподілу.', uk);
    expect(hits).toEqual([
      expect.objectContaining({
        concept: 'Allocation Recipient',
        canonical: 'отримувач',
        variant: 'одержувач (одержувачеві)',
        line: 1,
      }),
    ]);
  });

  it('does not flag the canonical renderings or words that merely contain a stem', () => {
    expect(
      scanTerminology(
        'Отримувач розподілу може забрати ETH після завершення перформанс-циклу; закарбування нової Сигнатури.',
        uk,
      ),
    ).toEqual([]);
  });

  it('matches multi-word drift as a phrase prefix, case-insensitively', () => {
    const hits = scanTerminology('Наступний Цикл Продуктивності починається завтра.', uk);
    expect(hits.map((hit) => hit.concept)).toEqual(['Performance Cycle']);
  });

  it('validates stems against the canonical rendering with the same matcher', () => {
    // `карбуванн` is a substring of the canonical `закарбування` but never a
    // word-initial match, so the uk pack is valid under its own matcher …
    expect(validateTerminologyRules(uk.rules, uk.matcher)).toEqual([]);
    // … while the substring matcher would (correctly) reject that rule.
    expect(validateTerminologyRules(uk.rules, 'cjk-substring')).toContainEqual(
      expect.stringContaining('Imprint canonical rendering contains its drift variant'),
    );
  });
});

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
