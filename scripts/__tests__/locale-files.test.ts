import { routing, TRANSLATED_LOCALES } from '../../i18n/routing';
import { checkAppliesTo, fileLocale, localeLanguage } from '../locale-files';

describe('fileLocale', () => {
  it.each(routing.locales)('resolves every layout of a %s file', (locale) => {
    expect(fileLocale(`messages/${locale}/common.json`)).toBe(locale);
    expect(fileLocale(`/abs/repo/messages/${locale}/nested/common.json`)).toBe(locale);
    expect(fileLocale(`content/faq/text.${locale}.ts`)).toBe(locale);
    expect(fileLocale(`content/quiz/text.basic.${locale}.ts`)).toBe(locale);
    expect(fileLocale(`content/legal/TermsContent.${locale}.ts`)).toBe(locale);
    expect(fileLocale(`content/about/${locale}.ts`)).toBe(locale);
    expect(fileLocale(`e2e/${locale}-smoke.spec.ts`)).toBe(locale);
    expect(fileLocale(`e2e/${locale}-site-qa.desktop.spec.ts`)).toBe(locale);
  });

  it('matches hyphenated codes as whole segments', () => {
    expect(fileLocale('content/faq/text.zh-TW.ts')).toBe('zh-TW');
    expect(fileLocale('content/faq/text.zh.ts')).toBe('zh');
    expect(fileLocale('messages/zh-HK/nav.json')).toBe('zh-HK');
    expect(fileLocale('e2e/zh-TW-smoke.spec.ts')).toBe('zh-TW');
    expect(fileLocale('e2e/zh-journeys.spec.ts')).toBe('zh');
  });

  it('is case-insensitive and returns the canonical code', () => {
    expect(fileLocale('content/faq/text.ZH-tw.ts')).toBe('zh-TW');
    expect(fileLocale('e2e/Uk-smoke.spec.ts')).toBe('uk');
  });

  it('treats shared and unrelated files as locale-agnostic', () => {
    for (const path of [
      'content/faq/structure.ts',
      'content/faq/index.ts',
      'content/faq/types.ts',
      'content/protocol-facts.ts',
      'content/legal/TermsContent.tsx',
      'components/layout/Header.tsx',
      'e2e/locale-fixtures.ts',
      'e2e/landing.spec.ts',
      'messages/README.md',
      'app/[locale]/(app)/page.tsx',
      'scripts/terminology/zh-TW.ts',
    ]) {
      expect(fileLocale(path)).toBeUndefined();
    }
  });
});

describe('checkAppliesTo', () => {
  it('runs every check on locale-agnostic files', () => {
    for (const locale of TRANSLATED_LOCALES) expect(checkAppliesTo(locale, undefined)).toBe(true);
  });

  it("runs a locale's own check on its files", () => {
    for (const locale of TRANSLATED_LOCALES) expect(checkAppliesTo(locale, locale)).toBe(true);
  });

  it('runs the checks of other languages on a locale file (stray copy detection)', () => {
    expect(checkAppliesTo('uk', 'zh')).toBe(true);
    expect(checkAppliesTo('zh', 'uk')).toBe(true);
    expect(checkAppliesTo('zh-HK', 'en')).toBe(true);
  });

  it('skips sibling variants of the same language, whose registers differ', () => {
    expect(checkAppliesTo('zh-HK', 'zh-TW')).toBe(false);
    expect(checkAppliesTo('zh-TW', 'zh-HK')).toBe(false);
    expect(checkAppliesTo('zh', 'zh-TW')).toBe(false);
    expect(checkAppliesTo('zh-TW', 'zh')).toBe(false);
  });

  it('derives the language from the BCP 47 tag', () => {
    expect(localeLanguage('zh-TW')).toBe('zh');
    expect(localeLanguage('uk')).toBe('uk');
  });
});
