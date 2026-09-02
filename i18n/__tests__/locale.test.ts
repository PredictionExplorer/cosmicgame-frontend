import {
  isAppLocale,
  isTranslatedLocale,
  normalizeLocale,
  pickByLocale,
  type LocaleRecord,
} from '../locale';
import { routing, TRANSLATED_LOCALES } from '../routing';

/** A complete registry built from routing.locales, so fixtures never lag a new locale. */
const recordFromLocales = <T>(value: (locale: string) => T): LocaleRecord<T> =>
  Object.fromEntries(routing.locales.map((locale) => [locale, value(locale)])) as LocaleRecord<T>;

describe('isAppLocale', () => {
  it('accepts exactly the routing locales', () => {
    for (const locale of routing.locales) expect(isAppLocale(locale)).toBe(true);
  });

  it('rejects regional variants, other casing, and non-strings', () => {
    expect(isAppLocale('zh-CN')).toBe(false);
    expect(isAppLocale('uk-UA')).toBe(false);
    expect(isAppLocale('EN')).toBe(false);
    expect(isAppLocale('')).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
    expect(isAppLocale(null)).toBe(false);
    expect(isAppLocale(1)).toBe(false);
  });
});

describe('isTranslatedLocale / TRANSLATED_LOCALES', () => {
  it('excludes only the default locale', () => {
    expect(isTranslatedLocale(routing.defaultLocale)).toBe(false);
    for (const locale of TRANSLATED_LOCALES) expect(isTranslatedLocale(locale)).toBe(true);
    expect([routing.defaultLocale, ...TRANSLATED_LOCALES].sort()).toEqual(
      [...routing.locales].sort(),
    );
    expect(isTranslatedLocale('fr')).toBe(false);
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
    expect(normalizeLocale('uk')).toBe('uk');
    expect(normalizeLocale('uk-UA')).toBe('uk');
    expect(normalizeLocale('UK_ua')).toBe('uk');
  });

  it('never maps a neighbouring language onto Ukrainian', () => {
    expect(normalizeLocale('ru')).toBe(routing.defaultLocale);
    expect(normalizeLocale('ru-UA')).toBe(routing.defaultLocale);
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
  const record = recordFromLocales((locale) => `value:${locale}`);

  it('resolves locale-ish input through normalizeLocale', () => {
    expect(pickByLocale(record, 'zh-CN')).toBe('value:zh');
    expect(pickByLocale(record, 'uk-UA')).toBe('value:uk');
    expect(pickByLocale(record, 'en')).toBe('value:en');
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
    const invented: LocaleRecord<number> = { en: 1, zh: 2, uk: 3, fr: 4 };
    const complete: LocaleRecord<number> = { en: 1, zh: 2, uk: 3 };

    expect(Object.keys(complete).sort()).toEqual([...routing.locales].sort());
    expect(incomplete).toBeDefined();
    expect(invented).toBeDefined();
  });
});
