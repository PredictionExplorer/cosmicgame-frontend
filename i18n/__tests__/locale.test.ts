import { isAppLocale, normalizeLocale, pickByLocale, type LocaleRecord } from '../locale';
import { routing } from '../routing';

describe('isAppLocale', () => {
  it('accepts exactly the routing locales', () => {
    for (const locale of routing.locales) expect(isAppLocale(locale)).toBe(true);
  });

  it('rejects regional variants, other casing, and non-strings', () => {
    expect(isAppLocale('zh-CN')).toBe(false);
    expect(isAppLocale('EN')).toBe(false);
    expect(isAppLocale('')).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
    expect(isAppLocale(null)).toBe(false);
    expect(isAppLocale(1)).toBe(false);
  });
});

describe('normalizeLocale', () => {
  it('canonicalizes regional and script variants to the base app locale', () => {
    expect(normalizeLocale('zh')).toBe('zh');
    expect(normalizeLocale('zh-CN')).toBe('zh');
    expect(normalizeLocale('zh-Hans')).toBe('zh');
    expect(normalizeLocale('ZH_TW')).toBe('zh');
    expect(normalizeLocale('  zh-hant  ')).toBe('zh');
    expect(normalizeLocale('en-US')).toBe('en');
  });

  it('falls back to the default locale for unsupported or missing input', () => {
    expect(normalizeLocale('fr')).toBe(routing.defaultLocale);
    expect(normalizeLocale('')).toBe(routing.defaultLocale);
    expect(normalizeLocale('-')).toBe(routing.defaultLocale);
    expect(normalizeLocale(undefined)).toBe(routing.defaultLocale);
    expect(normalizeLocale(null)).toBe(routing.defaultLocale);
  });
});

describe('pickByLocale', () => {
  const record: LocaleRecord<string> = { en: 'english', zh: 'chinese' };

  it('resolves locale-ish input through normalizeLocale', () => {
    expect(pickByLocale(record, 'zh-CN')).toBe('chinese');
    expect(pickByLocale(record, 'en')).toBe('english');
  });

  it('falls back to the default locale entry', () => {
    expect(pickByLocale(record, 'de')).toBe(record[routing.defaultLocale]);
    expect(pickByLocale(record, undefined)).toBe(record[routing.defaultLocale]);
  });
});

describe('LocaleRecord', () => {
  it('requires an entry for every routing locale at compile time', () => {
    // @ts-expect-error — a registry missing a locale must not compile.
    const incomplete: LocaleRecord<number> = { en: 1 };
    // @ts-expect-error — an invented locale must not compile either.
    const invented: LocaleRecord<number> = { en: 1, zh: 2, fr: 3 };
    const complete: LocaleRecord<number> = { en: 1, zh: 2 };

    expect(Object.keys(complete).sort()).toEqual([...routing.locales].sort());
    expect(incomplete).toBeDefined();
    expect(invented).toBeDefined();
  });
});
