import { getLocaleConfig } from '../localeConfig';
import { routing } from '../routing';

/** `Intl.Locale#getWeekInfo` (ECMA-402 2024) — optional in older TS lib typings. */
type WeekInfoLocale = Intl.Locale & { getWeekInfo?: () => { firstDay: number } };

describe('getLocaleConfig', () => {
  it.each(routing.locales)('declares well-formed conventions for %s', (locale) => {
    const config = getLocaleConfig(locale);
    const expected = new Intl.Locale(locale).maximize();

    // Intl must accept the tag, and it must describe the same language and
    // script; a region-qualified locale must keep its region too.
    for (const tag of [config.intlLocale, config.jsonLdInLanguage]) {
      expect(() => Intl.getCanonicalLocales(tag)).not.toThrow();
      const actual = new Intl.Locale(tag).maximize();
      expect(actual.language).toBe(expected.language);
      expect(actual.script).toBe(expected.script);
      if (new Intl.Locale(locale).region) expect(actual.region).toBe(expected.region);
    }

    // OpenGraph wants underscore-separated language_TERRITORY.
    expect(config.ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    expect(config.ogLocale.slice(0, 2)).toBe(expected.language);
    expect(config.ogLocale.slice(3)).toBe(expected.region);

    // The plural rules the catalogs are written against must exist for the tag.
    expect(new Intl.PluralRules(config.intlLocale).resolvedOptions().locale).toContain(
      expected.language,
    );

    expect(['ltr', 'rtl']).toContain(config.textDirection);
    expect(config.ellipsis.length).toBeGreaterThan(0);
  });

  it.each(routing.locales)('agrees with CLDR week data for %s', (locale) => {
    const config = getLocaleConfig(locale);
    const intl = new Intl.Locale(config.intlLocale) as WeekInfoLocale;
    const weekInfo = intl.getWeekInfo?.();
    if (!weekInfo) return; // ICU without week data: nothing to compare against
    // ISO day numbers: Monday = 1 … Sunday = 7.
    expect(config.weekStartsMonday).toBe(weekInfo.firstDay === 1);
  });

  it('resolves regional variants and unknown input like normalizeLocale', () => {
    expect(getLocaleConfig('zh-Hans')).toBe(getLocaleConfig('zh'));
    expect(getLocaleConfig('zh-Hant')).toBe(getLocaleConfig('zh-TW'));
    expect(getLocaleConfig('zh-MO')).toBe(getLocaleConfig('zh-HK'));
    expect(getLocaleConfig('uk-UA')).toBe(getLocaleConfig('uk'));
    expect(getLocaleConfig('en-GB')).toBe(getLocaleConfig('en'));
    expect(getLocaleConfig('fr')).toBe(getLocaleConfig(routing.defaultLocale));
    expect(getLocaleConfig(undefined)).toBe(getLocaleConfig(routing.defaultLocale));
  });

  it('pins the Ukrainian conventions from the uk style guide', () => {
    const uk = getLocaleConfig('uk');
    expect(uk.intlLocale).toBe('uk-UA');
    expect(uk.ogLocale).toBe('uk_UA');
    expect(uk.jsonLdInLanguage).toBe('uk');
    expect(uk.textDirection).toBe('ltr');
    expect(uk.wordSpacing).toBe(true);
    expect(uk.weekStartsMonday).toBe(true);
    expect(uk.ellipsis).toBe('…');
    expect(uk.lowercaseMidSentence).toBe(true);
    expect(uk.showRawProviderErrors).toBe(false);
    // Ukrainian carries four CLDR plural categories; every plural block in
    // messages/uk must cover them (enforced by scripts/i18n-parity-core.ts).
    expect(new Intl.PluralRules(uk.intlLocale).resolvedOptions().pluralCategories).toEqual(
      expect.arrayContaining(['one', 'few', 'many', 'other']),
    );
  });

  it('pins the English conventions the historical UI was built on', () => {
    const en = getLocaleConfig('en');
    expect(en.intlLocale).toBe('en-US');
    expect(en.ogLocale).toBe('en_US');
    expect(en.jsonLdInLanguage).toBe('en');
    expect(en.wordSpacing).toBe(true);
    expect(en.weekStartsMonday).toBe(false);
    expect(en.ellipsis).toBe('...');
    expect(en.lowercaseMidSentence).toBe(true);
    expect(en.showRawProviderErrors).toBe(true);
  });

  it('pins the Simplified-Chinese conventions from the zh style guide', () => {
    const zh = getLocaleConfig('zh');
    expect(zh.intlLocale).toBe('zh-CN');
    expect(zh.ogLocale).toBe('zh_CN');
    expect(zh.jsonLdInLanguage).toBe('zh-Hans');
    expect(zh.wordSpacing).toBe(false);
    expect(zh.weekStartsMonday).toBe(true);
    expect(zh.ellipsis).toBe('…');
    expect(zh.lowercaseMidSentence).toBe(false);
    expect(zh.showRawProviderErrors).toBe(false);
  });

  it.each([
    ['zh-TW', 'zh-Hant-TW', 'zh_TW'],
    ['zh-HK', 'zh-Hant-HK', 'zh_HK'],
  ] as const)('pins the Traditional-Chinese conventions for %s', (locale, inLanguage, og) => {
    const config = getLocaleConfig(locale);
    expect(config.intlLocale).toBe(locale);
    expect(config.jsonLdInLanguage).toBe(inLanguage);
    expect(config.ogLocale).toBe(og);
    expect(config.wordSpacing).toBe(false);
    // Taiwan and Hong Kong calendars start the week on Sunday.
    expect(config.weekStartsMonday).toBe(false);
    expect(config.ellipsis).toBe('…');
    expect(config.lowercaseMidSentence).toBe(false);
    expect(config.showRawProviderErrors).toBe(false);
    // Chinese has no plural inflection in any variant: catalogs carry `other` only.
    expect(new Intl.PluralRules(config.intlLocale).resolvedOptions().pluralCategories).toEqual([
      'other',
    ]);
  });
});
