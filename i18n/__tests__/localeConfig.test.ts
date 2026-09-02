import { getLocaleConfig } from '../localeConfig';
import { routing } from '../routing';

describe('getLocaleConfig', () => {
  it.each(routing.locales)('declares well-formed conventions for %s', (locale) => {
    const config = getLocaleConfig(locale);

    // Intl must accept the tag, and it must describe the same language.
    expect(() => Intl.getCanonicalLocales(config.intlLocale)).not.toThrow();
    expect(new Intl.Locale(config.intlLocale).language).toBe(locale);

    expect(() => Intl.getCanonicalLocales(config.jsonLdInLanguage)).not.toThrow();
    expect(new Intl.Locale(config.jsonLdInLanguage).language).toBe(locale);

    // OpenGraph wants underscore-separated language_TERRITORY.
    expect(config.ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    expect(config.ogLocale.slice(0, 2)).toBe(locale);

    expect(config.ellipsis.length).toBeGreaterThan(0);
  });

  it('resolves regional variants and unknown input like normalizeLocale', () => {
    expect(getLocaleConfig('zh-Hans')).toBe(getLocaleConfig('zh'));
    expect(getLocaleConfig('en-GB')).toBe(getLocaleConfig('en'));
    expect(getLocaleConfig('fr')).toBe(getLocaleConfig(routing.defaultLocale));
    expect(getLocaleConfig(undefined)).toBe(getLocaleConfig(routing.defaultLocale));
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
});
