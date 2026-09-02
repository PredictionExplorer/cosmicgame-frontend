import { LOCALE_ALIASES, LOCALE_LABELS, routing, TRANSLATED_LOCALES } from '../routing';

const language = (tag: string): string => new Intl.Locale(tag).language;

describe('routing locales', () => {
  it('are canonical BCP 47 tags, so Intl, hreflang, and <html lang> accept them verbatim', () => {
    for (const locale of routing.locales) {
      expect(Intl.getCanonicalLocales(locale)).toEqual([locale]);
    }
  });

  it('are unique under case folding (URL prefixes are matched case-insensitively)', () => {
    const folded = routing.locales.map((locale) => locale.toLowerCase());
    expect(new Set(folded).size).toBe(routing.locales.length);
  });

  it('use the bare language code for the CLDR default variant of each language', () => {
    // A region-qualified locale (`zh-TW`) only makes sense next to the bare
    // code (`zh`) that serves everyone else who reads that language.
    for (const locale of routing.locales) {
      if (locale === language(locale)) continue;
      expect(routing.locales).toContain(language(locale));
    }
  });

  it('keep the default locale first and TRANSLATED_LOCALES in declaration order', () => {
    expect(routing.locales[0]).toBe(routing.defaultLocale);
    expect(TRANSLATED_LOCALES).toEqual(
      routing.locales.filter((locale) => locale !== routing.defaultLocale),
    );
  });
});

describe('LOCALE_LABELS', () => {
  it('names every locale in its own language, distinctly', () => {
    const labels = routing.locales.map((locale) => LOCALE_LABELS[locale]);
    for (const label of labels) expect(label.trim().length).toBeGreaterThan(0);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('distinguishes the Chinese variants by script and region wording', () => {
    expect(LOCALE_LABELS.zh).toBe('简体中文');
    expect(LOCALE_LABELS['zh-TW']).toBe('繁體中文（台灣）');
    expect(LOCALE_LABELS['zh-HK']).toBe('繁體中文（香港）');
  });
});

describe('LOCALE_ALIASES', () => {
  it('are canonical tags of the same language that are not themselves locales', () => {
    for (const locale of routing.locales) {
      for (const alias of LOCALE_ALIASES[locale]) {
        expect(Intl.getCanonicalLocales(alias)).toEqual([alias]);
        expect(language(alias)).toBe(language(locale));
        expect(routing.locales as readonly string[]).not.toContain(alias);
      }
    }
  });

  it('assign each alias to exactly one locale', () => {
    const aliases = routing.locales.flatMap((locale) => LOCALE_ALIASES[locale]);
    expect(new Set(aliases).size).toBe(aliases.length);
  });

  it('agree with the script the locale renders', () => {
    for (const locale of routing.locales) {
      const script = new Intl.Locale(locale).maximize().script;
      for (const alias of LOCALE_ALIASES[locale]) {
        expect(new Intl.Locale(alias).maximize().script).toBe(script);
      }
    }
  });
});
