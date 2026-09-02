import { LOCALE_ALIASES, routing } from '@/i18n/routing';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { languageAlternates } from '@/lib/hreflang';

describe('languageAlternates', () => {
  it('lists every locale, then its aliases, then x-default', () => {
    const keys = Object.keys(languageAlternates(APP_ORIGIN, '/gallery'));
    const expected = [
      ...routing.locales.flatMap((locale) => [locale, ...LOCALE_ALIASES[locale]]),
      'x-default',
    ];
    expect(keys).toEqual(expected);
  });

  it('gives each locale its own URL and each alias its locale URL', () => {
    const alternates = languageAlternates(LANDING_ORIGIN, '/learn');
    for (const locale of routing.locales) {
      expect(alternates[locale]).toBe(localeHref(LANDING_ORIGIN, '/learn', locale));
      for (const alias of LOCALE_ALIASES[locale]) {
        expect(alternates[alias]).toBe(alternates[locale]);
      }
    }
    expect(alternates['x-default']).toBe(alternates[routing.defaultLocale]);
  });

  it('routes Traditional readers by script and region', () => {
    const alternates = languageAlternates(APP_ORIGIN, '/gallery');
    expect(alternates['zh-Hans']).toBe(`${APP_ORIGIN}/zh/gallery`);
    expect(alternates['zh-Hant']).toBe(`${APP_ORIGIN}/zh-TW/gallery`);
    expect(alternates['zh-TW']).toBe(`${APP_ORIGIN}/zh-TW/gallery`);
    expect(alternates['zh-HK']).toBe(`${APP_ORIGIN}/zh-HK/gallery`);
    expect(alternates['zh-MO']).toBe(`${APP_ORIGIN}/zh-HK/gallery`);
  });

  it('treats an empty path as the home page', () => {
    const alternates = languageAlternates(APP_ORIGIN, '');
    expect(alternates.en).toBe(APP_ORIGIN);
    expect(alternates['zh-HK']).toBe(`${APP_ORIGIN}/zh-HK`);
  });

  it('emits only valid hreflang values', () => {
    for (const key of Object.keys(languageAlternates(APP_ORIGIN, '/'))) {
      if (key === 'x-default') continue;
      expect(Intl.getCanonicalLocales(key)).toEqual([key]);
    }
  });
});
