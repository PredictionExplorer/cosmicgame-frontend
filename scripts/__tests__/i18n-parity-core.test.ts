import {
  checkSourceNamespace,
  compareNamespace,
  flattenMessages,
  icuSignature,
  pluralCategoriesFor,
  strictProblems,
} from '../i18n-parity-core';

describe('flattenMessages', () => {
  it('flattens nested catalogs to dotted leaf paths', () => {
    expect([...flattenMessages({ a: { b: 'x', c: { d: 'y' } }, e: 'z' })]).toEqual([
      ['a.b', 'x'],
      ['a.c.d', 'y'],
      ['e', 'z'],
    ]);
  });
});

describe('icuSignature', () => {
  it('collects arguments across plural and select branches, tags, and formats', () => {
    const signature = icuSignature(
      '{address} made {kind, select, cst {a CST gesture} other {an ETH gesture}} on {date, date, short} <em>{count, plural, one {# time} other {# times}}</em>',
    );
    expect([...signature.arguments].sort()).toEqual(['address', 'count', 'date', 'kind']);
    expect([...signature.tags]).toEqual(['em']);
    expect(signature.plurals).toEqual([
      { argument: 'count', type: 'cardinal', categories: new Set(['one', 'other']) },
    ]);
  });

  it('excludes exact-match cases from the plural categories', () => {
    const [plural] = icuSignature('{n, plural, =0 {none} one {one} other {#}}').plurals;
    expect(plural?.categories).toEqual(new Set(['one', 'other']));
  });

  it('throws on malformed ICU', () => {
    expect(() => icuSignature('{count, plural, one {#}')).toThrow();
    expect(() => icuSignature('{count, plural, one {#}}')).toThrow(); // no `other`
  });
});

describe('pluralCategoriesFor', () => {
  it('derives the category set from Intl for each locale', () => {
    expect([...pluralCategoriesFor('en-US')].sort()).toEqual(['one', 'other']);
    expect([...pluralCategoriesFor('zh-CN')]).toEqual(['other']);
    expect([...pluralCategoriesFor('uk-UA')].sort()).toEqual(['few', 'many', 'one', 'other']);
    expect(pluralCategoriesFor('uk-UA', 'ordinal')).toContain('few');
  });
});

describe('compareNamespace', () => {
  const source = {
    title: 'Gallery',
    count: '{count, plural, one {# gesture} other {# gestures}}',
    rich: 'Read the <em>guide</em> for {name}',
    nested: { label: 'Cycle #{cycle}' },
  };

  it('accepts a complete Ukrainian translation with four plural forms', () => {
    const report = compareNamespace({
      namespace: 'gallery',
      source,
      translation: {
        title: 'Галерея',
        count: '{count, plural, one {# жест} few {# жести} many {# жестів} other {# жесту}}',
        rich: 'Прочитайте <em>посібник</em> для {name}',
        nested: { label: 'Цикл №{cycle}' },
      },
      intlLocale: 'uk-UA',
    });
    expect(strictProblems(report)).toEqual([]);
    expect(report.identical).toEqual([]);
    expect(report.untranslated).toBe(false);
  });

  it('reports missing, empty, and extra keys', () => {
    const report = compareNamespace({
      namespace: 'gallery',
      source,
      translation: { title: '', rich: 'x {name}', nested: { label: 'Цикл №{cycle}', stale: 'y' } },
      intlLocale: 'uk-UA',
    });
    expect(report.missing).toEqual(['count']);
    expect(report.empty).toEqual(['title']);
    expect(report.extra).toEqual(['nested.stale']);
  });

  it('flags plural blocks that lack the locale categories, but not extra categories', () => {
    const uk = compareNamespace({
      namespace: 'n',
      source,
      translation: { ...source, count: '{count, plural, one {# жест} other {# жестів}}' },
      intlLocale: 'uk-UA',
    });
    expect(uk.pluralGaps).toEqual(['count: {count, plural} lacks few, many']);

    const zh = compareNamespace({
      namespace: 'n',
      source,
      translation: { ...source, count: '{count, plural, one {# 次} other {# 次}}' },
      intlLocale: 'zh-CN',
    });
    expect(zh.pluralGaps).toEqual([]);
  });

  it('flags argument drift and invented tags, but allows dropped tags', () => {
    const report = compareNamespace({
      namespace: 'n',
      source,
      translation: {
        ...source,
        rich: 'Прочитайте посібник для {user}',
        nested: { label: '<strong>Цикл</strong> №{cycle}' },
        title: 'Галерея',
      },
      intlLocale: 'uk-UA',
    });
    expect(report.signatureMismatches).toHaveLength(2);
    expect(report.signatureMismatches[0]).toContain('rich');
    expect(report.signatureMismatches[1]).toContain('nested.label');

    const dropped = compareNamespace({
      namespace: 'n',
      source,
      translation: { ...source, rich: 'Прочитайте посібник для {name}' },
      intlLocale: 'uk-UA',
    });
    expect(dropped.signatureMismatches).toEqual([]);
  });

  it('reports ICU syntax errors with the key', () => {
    const report = compareNamespace({
      namespace: 'n',
      source,
      translation: { ...source, count: '{count, plural, one {#} other {#}' },
      intlLocale: 'uk-UA',
    });
    expect(report.syntaxErrors).toHaveLength(1);
    expect(report.syntaxErrors[0]).toMatch(/^count: /);
  });

  it('marks a verbatim copy of the source as untranslated', () => {
    const report = compareNamespace({
      namespace: 'n',
      source,
      translation: source,
      intlLocale: 'uk-UA',
    });
    expect(report.untranslated).toBe(true);
    expect(report.identical).toHaveLength(4);
    expect(strictProblems(report)).toContain('untranslated: every value equals the source catalog');
  });

  it('tolerates values that are legitimately identical (units, brand names)', () => {
    const report = compareNamespace({
      namespace: 'n',
      source: { unit: 'ETH', title: 'Gallery' },
      translation: { unit: 'ETH', title: 'Галерея' },
      intlLocale: 'uk-UA',
    });
    expect(report.identical).toEqual(['unit']);
    expect(report.untranslated).toBe(false);
    expect(strictProblems(report)).toEqual([]);
  });
});

describe('checkSourceNamespace', () => {
  it('validates the source catalog against its own plural rules', () => {
    expect(checkSourceNamespace('n', { ok: '{n, plural, one {#} other {#}}' }, 'en-US')).toEqual({
      namespace: 'n',
      syntaxErrors: [],
      pluralGaps: [],
    });
    expect(
      checkSourceNamespace('n', { bad: '{n, plural, other {#}}', broken: '{' }, 'en-US'),
    ).toEqual({
      namespace: 'n',
      syntaxErrors: [expect.stringMatching(/^broken: /)],
      pluralGaps: ['bad: {n, plural} lacks one'],
    });
  });
});
