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
  it('returns supported codes unchanged and accepts any casing or separator', () => {
    for (const locale of routing.locales) expect(normalizeLocale(locale)).toBe(locale);
    expect(normalizeLocale('ZH_TW')).toBe('zh-TW');
    expect(normalizeLocale('zh-hk')).toBe('zh-HK');
    expect(normalizeLocale('  Zh-Tw  ')).toBe('zh-TW');
    expect(normalizeLocale('UK_ua')).toBe('uk');
  });

  it('resolves regional Simplified tags to zh', () => {
    expect(normalizeLocale('zh-CN')).toBe('zh');
    expect(normalizeLocale('zh-Hans')).toBe('zh');
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh');
    expect(normalizeLocale('zh-SG')).toBe('zh');
    expect(normalizeLocale('zh-MY')).toBe('zh');
  });

  it('resolves Traditional tags to the variant that fits the script and region', () => {
    // Bare Traditional: CLDR's likely region is Taiwan (also declared as an alias).
    expect(normalizeLocale('zh-Hant')).toBe('zh-TW');
    expect(normalizeLocale('  zh-hant  ')).toBe('zh-TW');
    expect(normalizeLocale('zh-Hant-TW')).toBe('zh-TW');
    expect(normalizeLocale('zh-Hant-HK')).toBe('zh-HK');
    // Macau follows Hong Kong conventions (LOCALE_ALIASES).
    expect(normalizeLocale('zh-MO')).toBe('zh-HK');
    expect(normalizeLocale('zh-Hant-MO')).toBe('zh-HK');
  });

  it('lets script outrank region when the two disagree', () => {
    // A Simplified reader in Taiwan is still a Simplified reader.
    expect(normalizeLocale('zh-Hans-TW')).toBe('zh');
    // Traditional script in an unlisted region picks a Traditional variant.
    expect(normalizeLocale('zh-Hant-US')).toBe('zh-TW');
  });

  it('canonicalizes regional variants of single-variant languages', () => {
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('en-GB')).toBe('en');
    expect(normalizeLocale('uk-UA')).toBe('uk');
    expect(normalizeLocale('ko-KR')).toBe('ko');
    expect(normalizeLocale('ko-KP')).toBe('ko');
    expect(normalizeLocale('ko-Kore-KR')).toBe('ko');
  });

  it('never maps a neighbouring language onto another', () => {
    expect(normalizeLocale('ru')).toBe(routing.defaultLocale);
    expect(normalizeLocale('ru-UA')).toBe(routing.defaultLocale);
    // Cantonese is negotiated by next-intl's CLDR matcher, not by the canonicalizer.
    expect(normalizeLocale('yue')).toBe(routing.defaultLocale);
  });

  it('falls back to the default locale for unsupported or missing input', () => {
    expect(normalizeLocale('fr')).toBe(routing.defaultLocale);
    expect(normalizeLocale('')).toBe(routing.defaultLocale);
    expect(normalizeLocale('-')).toBe(routing.defaultLocale);
    expect(normalizeLocale('not a tag')).toBe(routing.defaultLocale);
    expect(normalizeLocale(undefined)).toBe(routing.defaultLocale);
    expect(normalizeLocale(null)).toBe(routing.defaultLocale);
  });
});

describe('pickByLocale', () => {
  const record = recordFromLocales((locale) => `value:${locale}`);

  it('resolves locale-ish input through normalizeLocale', () => {
    expect(pickByLocale(record, 'zh-CN')).toBe('value:zh');
    expect(pickByLocale(record, 'zh-Hant')).toBe('value:zh-TW');
    expect(pickByLocale(record, 'zh-MO')).toBe('value:zh-HK');
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
    const invented: LocaleRecord<number> = {
      en: 1,
      zh: 2,
      'zh-TW': 3,
      'zh-HK': 4,
      uk: 5,
      ko: 6,
      // @ts-expect-error — an invented locale must not compile either.
      fr: 7,
    };
    const complete: LocaleRecord<number> = { en: 1, zh: 2, 'zh-TW': 3, 'zh-HK': 4, uk: 5, ko: 6 };

    expect(Object.keys(complete).sort()).toEqual([...routing.locales].sort());
    expect(incomplete).toBeDefined();
    expect(invented).toBeDefined();
  });
});
