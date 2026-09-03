import { TRANSLATED_LOCALES } from '../../i18n/routing';
import {
  HK_STANDARD_FORMS,
  LOCALE_CONVENTIONS,
  checkConventions,
  checkDisallowedPatterns,
  checkScriptConventions,
  describeConventions,
  describeViolation,
  type LocaleConventions,
} from '../i18n-conventions-core';

const twLocale = LOCALE_CONVENTIONS['zh-TW']!;
const hkLocale = LOCALE_CONVENTIONS['zh-HK']!;
const tw = twLocale.script!;
const hk = hkLocale.script!;
const zh = LOCALE_CONVENTIONS.zh!.script!;

const reasons = (text: string, conventions = tw) =>
  checkScriptConventions(text, conventions).map((v) => `${v.reason}:${v.character}>${v.expected}`);

describe('LOCALE_CONVENTIONS', () => {
  it('declares a decision for every translated locale', () => {
    expect(Object.keys(LOCALE_CONVENTIONS).sort()).toEqual([...TRANSLATED_LOCALES].sort());
    expect(LOCALE_CONVENTIONS.uk).toBeNull();
  });

  it('gives every Chinese locale script checks and documents them in a style guide', () => {
    for (const locale of ['zh', 'zh-TW', 'zh-HK'] as const) {
      const conventions = LOCALE_CONVENTIONS[locale]!;
      expect(conventions.script).not.toBeNull();
      expect(conventions.styleGuide).toBe(`docs/i18n/style-guide-${locale}.md`);
    }
  });

  it('treats correct copy in each script as a fixed point', () => {
    expect(reasons('每一筆落筆都會塑造這一週期的簽名。', tw)).toEqual([]);
    expect(reasons('每一筆落筆都會塑造這一週期的簽名。', hk)).toEqual([]);
    expect(reasons('每一笔落笔都会塑造这一周期的签名。', zh)).toEqual([]);
  });
});

describe('wrong-script detection', () => {
  it('flags Simplified characters inside Traditional copy', () => {
    expect(reasons('每一笔落筆', tw)).toEqual(['wrong-script:笔>筆']);
    expect(reasons('网络與錢包', hk)).toEqual(
      expect.arrayContaining(['wrong-script:网>網', 'wrong-script:络>絡']),
    );
  });

  it('flags Traditional characters inside Simplified copy', () => {
    expect(reasons('每一筆落笔', zh)).toEqual(['wrong-script:筆>笔']);
  });

  it('keeps characters shared by both scripts quiet', () => {
    // 采 is Simplified in 采用 but Traditional in 風采; 里 is a distance unit;
    // 干 and 准 are Traditional in 干預 and 批准.
    expect(reasons('風采 公里 干預 批准', tw)).toEqual([]);
    expect(reasons('風采 公里 干預 批准', hk)).toEqual([]);
  });

  it('does not impose OpenCC standard forms that Taiwan and Hong Kong do not write', () => {
    expect(reasons('社群 高峰 吃 了解', tw)).toEqual([]);
    expect(reasons('社群 高峰 吃 了解 稅務 脫離 溫度 說明 閱讀 用戶', hk)).toEqual([]);
  });

  it('reports a Latin-only line as clean without consulting OpenCC', () => {
    expect(reasons('ETH / CST {count}', tw)).toEqual([]);
  });
});

describe('regional character choices', () => {
  it('keeps Taiwan on 裡/著 and Hong Kong on 裏/着', () => {
    expect(reasons('這裏 看着', tw)).toEqual(
      expect.arrayContaining(['regional-form:裏>裡', 'regional-form:着>著']),
    );
    expect(reasons('這裡', hk)).toEqual(['regional-form:裡>裏']);
    expect(reasons('這裡 看著', tw)).toEqual([]);
    expect(reasons('這裏 看着', hk)).toEqual([]);
  });

  it('standardizes on 台 in both Traditional locales', () => {
    expect(reasons('臺灣 平臺', tw)).toEqual(['regional-form:臺>台']);
    expect(reasons('臺灣', hk)).toEqual(['regional-form:臺>台']);
    expect(reasons('台灣 平台', tw)).toEqual([]);
    expect(reasons('台灣 平台', hk)).toEqual([]);
  });

  it('rejects the glyph-variant code points OpenCC emits for Hong Kong', () => {
    for (const [variant, standard] of Object.entries(HK_STANDARD_FORMS)) {
      expect(reasons(variant, hk)).toEqual([`regional-form:${variant}>${standard}`]);
      expect(reasons(variant, tw)).toEqual([`regional-form:${variant}>${standard}`]);
      expect(reasons(standard, hk)).toEqual([]);
    }
  });
});

describe('quotation marks', () => {
  it('requires corner brackets in Traditional copy and curly quotes in Simplified copy', () => {
    expect(reasons('所謂“落筆”', tw)).toEqual(
      expect.arrayContaining(['punctuation:“>「', 'punctuation:”>」']),
    );
    expect(reasons('所謂「落筆」', tw)).toEqual([]);
    expect(reasons('所谓「落笔」', zh)).toEqual(
      expect.arrayContaining(['punctuation:「>“', 'punctuation:」>”']),
    );
    expect(reasons('所谓“落笔”', zh)).toEqual([]);
  });
});

describe('disallowed patterns', () => {
  const fixture: LocaleConventions = {
    styleGuide: 'docs/i18n/style-guide-xx.md',
    script: null,
    disallowedPatterns: [
      { pattern: /\bcolour\b/i, reason: 'American spelling (style guide §4)' },
      { pattern: /[。，]/, reason: 'ASCII punctuation only' },
    ],
  };

  it('reports each distinct match once per line with the pattern reason', () => {
    const violations = checkDisallowedPatterns(
      'The colour and the COLOUR, colour again。\nclean line\nsecond。，',
      fixture.disallowedPatterns,
    );
    expect(violations.map((v) => `${v.line}:${v.reason}:${v.character}`)).toEqual([
      '1:pattern:colour',
      '1:pattern:COLOUR',
      '1:pattern:。',
      '3:pattern:。',
      '3:pattern:，',
    ]);
    expect(violations[0]!.expected).toBe('American spelling (style guide §4)');
  });

  it('adds the global and unicode flags without mutating the declared pattern', () => {
    const [entry] = fixture.disallowedPatterns;
    expect(entry!.pattern.flags).toBe('i');
    checkDisallowedPatterns('colour colour', fixture.disallowedPatterns);
    expect(entry!.pattern.flags).toBe('i');
    expect(entry!.pattern.lastIndex).toBe(0);
  });

  it('composes with script checks in checkConventions', () => {
    expect(checkConventions('clean', fixture)).toEqual([]);
    expect(checkConventions('colour', fixture)).toHaveLength(1);
    // Chinese entries carry no patterns; their violations come from the script checks alone.
    expect(checkConventions('每一笔落筆', twLocale).map((v) => v.reason)).toEqual(['wrong-script']);
  });

  it('is described alongside the script checks', () => {
    expect(describeConventions(fixture)).toBe('2 pattern(s)');
    expect(describeConventions(twLocale)).toBe('Hant script');
    expect(
      describeConventions({ ...twLocale, disallowedPatterns: fixture.disallowedPatterns }),
    ).toBe('Hant script, 2 pattern(s)');
  });
});

describe('describeViolation', () => {
  it('names the code point and the expected form', () => {
    const [violation] = checkScriptConventions('落笔', tw);
    expect(describeViolation(violation!, twLocale)).toBe('笔 (U+7B14) is Simplified; write 筆');
    const [quote] = checkScriptConventions('“落筆”', tw);
    expect(describeViolation(quote!, twLocale)).toContain('quotation mark; write 「');
  });

  it('quotes the matched text and the reason for a disallowed pattern', () => {
    const conventions: LocaleConventions = {
      styleGuide: 'docs/i18n/style-guide-xx.md',
      script: null,
      disallowedPatterns: [{ pattern: /\{\w+\}을/, reason: 'particle glued to a placeholder' }],
    };
    const [violation] = checkConventions('{amount}을 보내기', conventions);
    expect(describeViolation(violation!, conventions)).toBe(
      '"{amount}을": particle glued to a placeholder',
    );
  });

  it('reports each offending character once per line with its line number', () => {
    const violations = checkScriptConventions('第一行\n落笔落笔\n第三笔', tw);
    expect(violations.map((v) => v.line)).toEqual([2, 3]);
  });
});
