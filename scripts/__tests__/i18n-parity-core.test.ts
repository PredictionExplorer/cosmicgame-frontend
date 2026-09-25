import {
  checkSourceNamespace,
  compareNamespace,
  flattenMessages,
  icuSignature,
  pluralCategoriesFor,
  strictProblems,
  unitSpacingProblems,
} from '../i18n-parity-core';

describe('flattenMessages', () => {
  it('flattens nested catalogs to dotted leaf paths', () => {
    expect([...flattenMessages({ a: { b: 'x', c: { d: 'y' } }, e: 'z' })]).toEqual([
      ['a.b', 'x'],
      ['a.c.d', 'y'],
      ['e', 'z'],
    ]);
  });

  it('includes strings in raw-message lists so they receive the same integrity checks', () => {
    expect([
      ...flattenMessages({ chips: ['Art', 'Protocol'], cards: [{ title: 'Gallery' }] }),
    ]).toEqual([
      ['chips[0]', 'Art'],
      ['chips[1]', 'Protocol'],
      ['cards[0].title', 'Gallery'],
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

  it('rejects whitespace-only text and non-string leaves instead of counting them as translations', () => {
    const report = compareNamespace({
      namespace: 'n',
      source: { title: 'Gallery', count: 'Count', action: 'Open', nested: { help: 'Help' } },
      translation: { title: ' \n\t', count: 3, action: null, nested: { help: false } },
      intlLocale: 'uk-UA',
    });
    expect(report.empty).toEqual(['title']);
    expect(report.invalidValues).toEqual(['count', 'action', 'nested.help']);
    expect(strictProblems(report)).toEqual([
      'empty: title',
      'not a string: count',
      'not a string: action',
      'not a string: nested.help',
    ]);
    expect(report.untranslated).toBe(false);
  });

  it('allows a localized space separator without allowing whitespace-only prose', () => {
    const report = compareNamespace({
      namespace: 'timer',
      source: { separator: ', ', label: 'Duration' },
      translation: { separator: ' ', label: '期間' },
      intlLocale: 'ja-JP',
    });
    expect(strictProblems(report)).toEqual([]);
  });

  it('rejects an object substituted for a raw-message list, even with matching numeric keys', () => {
    const report = compareNamespace({
      namespace: 'seo',
      source: { chips: ['Art', 'Protocol'] },
      translation: { chips: { '0': '作品', '1': 'プロトコル' } },
      intlLocale: 'ja-JP',
    });
    expect(report.missing).toEqual(['chips[0]', 'chips[1]']);
    expect(report.extra).toEqual(['chips.0', 'chips.1']);
    expect(strictProblems(report)).toHaveLength(4);
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
      empty: [],
      invalidValues: [],
      syntaxErrors: [],
      pluralGaps: [],
      unitSpacing: [],
      typography: [],
    });
    expect(
      checkSourceNamespace('n', { bad: '{n, plural, other {#}}', broken: '{' }, 'en-US'),
    ).toEqual({
      namespace: 'n',
      empty: [],
      invalidValues: [],
      syntaxErrors: [expect.stringMatching(/^broken: /)],
      pluralGaps: ['bad: {n, plural} lacks one'],
      unitSpacing: [],
      typography: [],
    });
  });

  it('rejects blank and non-string source messages too', () => {
    expect(
      checkSourceNamespace('n', { blank: '\t ', count: 1, list: [], nil: null }, 'en-US'),
    ).toEqual({
      namespace: 'n',
      empty: ['blank'],
      invalidValues: ['count', 'list', 'nil'],
      syntaxErrors: [],
      pluralGaps: [],
      unitSpacing: [],
      typography: [],
    });
  });

  // V143 / V348: English mixed "Loading..." with "Search questions…" and
  // "couldn't" with "couldn’t"; the source now uses one form of each.
  it('holds the source to the ellipsis and the typographic apostrophe', () => {
    const report = checkSourceNamespace(
      'n',
      {
        dots: 'Loading...',
        contraction: "The records couldn't be loaded.",
        possessive: "Takes three bodies' masses.",
        fine: "Loading… The records couldn’t be loaded. Type '{' to open.",
      },
      'en-US',
    );
    expect(report.typography).toEqual([
      'dots: "..." should be the ellipsis "…" (U+2026)',
      'contraction: "n\'t" should use the apostrophe "’" (U+2019)',
      'possessive: "s\'" should use the apostrophe "’" (U+2019)',
    ]);
  });

  it('holds the source to no-break number–unit joins as well', () => {
    const report = checkSourceNamespace('n', { cost: 'Gesture with ETH ({cost} ETH)' }, 'en-US');
    expect(report.unitSpacing).toEqual([
      'cost: "{cost} ETH" needs a no-break space (U+00A0) before the unit',
    ]);
  });
});

describe('number formatting parity', () => {
  const compare = (source: string, translation: string) =>
    compareNamespace({
      namespace: 'n',
      source: { m: source },
      translation: { m: translation },
      intlLocale: 'zh-CN',
    });

  it('rejects a translation that prints a formatted source number bare', () => {
    const report = compare('{count, plural, one {# Gesture} other {# Gestures}}', '{count} 次落笔');
    expect(report.numberFormatGaps).toEqual([
      'm: {count} is a formatted number in the source; write {count, number} or # inside its plural',
    ]);
    expect(strictProblems(report)).toContainEqual(expect.stringMatching(/^number format: m: /));
  });

  it('accepts {n, number} or # in the translation', () => {
    const source = '{count, plural, one {# Gesture} other {# Gestures}}';
    expect(compare(source, '{count, number} 次落笔').numberFormatGaps).toEqual([]);
    expect(compare(source, '{count, plural, other {# 次落笔}}').numberFormatGaps).toEqual([]);
    expect(compare('{n, number} items', '{n, number} 项').numberFormatGaps).toEqual([]);
  });

  it('leaves arguments the source prints bare alone', () => {
    expect(compare('Cycle {cycle}', '第 {cycle} 个周期').numberFormatGaps).toEqual([]);
  });

  it('counts # inside a select branch of the plural, not a nested plural', () => {
    const signature = icuSignature(
      '{n, plural, other {{kind, select, a {# a} other {# b}}}} {m, plural, other {{n, plural, other {#}}}}',
    );
    expect([...signature.numberArguments].sort()).toEqual(['n']);
  });
});

describe('unitSpacingProblems', () => {
  it('flags quantity placeholders and plural counts before a unit', () => {
    expect(
      unitSpacingProblems(
        '{amount} ETH, {cost} CST, {nftCount} NFT, {count, plural, other {# NFTs}}',
      ),
    ).toEqual(['{amount} ETH', '{cost} CST', '{nftCount} NFT', '# NFTs']);
  });

  it('leaves names that read as adjectives, and joins that already use U+00A0', () => {
    expect(unitSpacingProblems('Anchor Action for {token} NFT · Cycle {cycle} ETH')).toEqual([]);
    expect(unitSpacingProblems('{amount}\u00a0ETH')).toEqual([]);
    expect(unitSpacingProblems('{amount} ETHER')).toEqual([]);
  });
});
