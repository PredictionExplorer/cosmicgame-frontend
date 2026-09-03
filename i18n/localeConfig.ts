import { pickByLocale, type LocaleRecord } from './locale';

/**
 * Per-locale rendering conventions that are configuration, not copy.
 *
 * Words and sentences belong in `messages/<locale>/*.json`; larger prose in
 * `content/`. This registry holds only the mechanical conventions a locale
 * carries — Intl tags, typography, calendar habits, error-display policy —
 * so they are declared once instead of as scattered `locale === 'zh'`
 * ternaries. Single-use conventions may instead live as a `LocaleRecord`
 * next to their only consumer (e.g. the RainbowKit locale map in WalletUi).
 */

/**
 * The family of characters a locale's copy is written in. Languages in the
 * same family share characters without sharing vocabulary — Chinese and
 * Japanese both write 利益, 請求, and 大会, each meaning something different —
 * so a gate that scans one language's copy for another language's words
 * (the banned registers in scripts/lexicon-scan-core.ts) must skip every
 * other locale of the same family, not only sibling variants of the same
 * language. Korean is written in Hangul alone here, so it is its own family.
 */
export type ScriptFamily = 'latin' | 'han' | 'hangul' | 'cyrillic';

export interface LocaleConfig {
  /** BCP-47 tag for `Intl.NumberFormat` / `Intl.DateTimeFormat` / `toLocaleString`. */
  readonly intlLocale: string;
  /** Character family the copy is written in (see `ScriptFamily`). */
  readonly scriptFamily: ScriptFamily;
  /** schema.org `inLanguage` value emitted in JSON-LD. */
  readonly jsonLdInLanguage: string;
  /** OpenGraph `og:locale` value. */
  readonly ogLocale: string;
  /**
   * Writing direction, emitted as `<html dir>`. Every current locale is
   * left-to-right; the field exists so a right-to-left language is a config
   * entry rather than a layout audit hunt.
   */
  readonly textDirection: 'ltr' | 'rtl';
  /**
   * Whether the language separates words with spaces. Drives the separator
   * between compact-duration tokens ("1d 2h" vs "1天2小时") and the space
   * between an inline label and the value that follows it.
   */
  readonly wordSpacing: boolean;
  /** First day of the week in calendar UI. */
  readonly weekStartsMonday: boolean;
  /** Ellipsis appended when truncating text. */
  readonly ellipsis: string;
  /**
   * Whether an interpolated Title-Case phrase is lowercased when it lands
   * mid-sentence ("Failed to load endurance records"). English grammar wants
   * this; Chinese has no letter case.
   */
  readonly lowercaseMidSentence: boolean;
  /**
   * Whether raw wallet/RPC provider diagnostics may be shown to the user.
   * Providers return arbitrary English strings, so locales other than
   * English hide them behind the translated fallback while the original
   * error still flows to `reportError` (docs/i18n/README.md).
   */
  readonly showRawProviderErrors: boolean;
}

const LOCALE_CONFIG: LocaleRecord<LocaleConfig> = {
  en: {
    intlLocale: 'en-US',
    scriptFamily: 'latin',
    jsonLdInLanguage: 'en',
    ogLocale: 'en_US',
    textDirection: 'ltr',
    wordSpacing: true,
    weekStartsMonday: false,
    ellipsis: '...',
    lowercaseMidSentence: true,
    showRawProviderErrors: true,
  },
  zh: {
    intlLocale: 'zh-CN',
    scriptFamily: 'han',
    jsonLdInLanguage: 'zh-Hans',
    ogLocale: 'zh_CN',
    textDirection: 'ltr',
    wordSpacing: false,
    weekStartsMonday: true,
    ellipsis: '…',
    lowercaseMidSentence: false,
    showRawProviderErrors: false,
  },
  'zh-TW': {
    intlLocale: 'zh-TW',
    scriptFamily: 'han',
    jsonLdInLanguage: 'zh-Hant-TW',
    ogLocale: 'zh_TW',
    textDirection: 'ltr',
    wordSpacing: false,
    // CLDR week data: Taiwan calendars start on Sunday (mainland on Monday).
    weekStartsMonday: false,
    ellipsis: '…',
    lowercaseMidSentence: false,
    showRawProviderErrors: false,
  },
  'zh-HK': {
    intlLocale: 'zh-HK',
    scriptFamily: 'han',
    jsonLdInLanguage: 'zh-Hant-HK',
    ogLocale: 'zh_HK',
    textDirection: 'ltr',
    wordSpacing: false,
    // CLDR week data: Hong Kong calendars start on Sunday.
    weekStartsMonday: false,
    ellipsis: '…',
    lowercaseMidSentence: false,
    showRawProviderErrors: false,
  },
  uk: {
    intlLocale: 'uk-UA',
    scriptFamily: 'cyrillic',
    jsonLdInLanguage: 'uk',
    ogLocale: 'uk_UA',
    textDirection: 'ltr',
    wordSpacing: true,
    weekStartsMonday: true,
    ellipsis: '…',
    // Ukrainian has letter case and, like English, lowercases a Title-Case
    // phrase that lands mid-sentence.
    lowercaseMidSentence: true,
    showRawProviderErrors: false,
  },
  ko: {
    intlLocale: 'ko-KR',
    scriptFamily: 'hangul',
    jsonLdInLanguage: 'ko',
    ogLocale: 'ko_KR',
    textDirection: 'ltr',
    // Korean separates words with spaces (unlike Chinese): "1일 2시간".
    wordSpacing: true,
    // CLDR week data: Korean calendars start on Sunday.
    weekStartsMonday: false,
    ellipsis: '…',
    // Hangul has no letter case.
    lowercaseMidSentence: false,
    showRawProviderErrors: false,
  },
  ja: {
    intlLocale: 'ja-JP',
    scriptFamily: 'han',
    jsonLdInLanguage: 'ja',
    ogLocale: 'ja_JP',
    textDirection: 'ltr',
    // Japanese runs words together like Chinese: "1日2時間", "48時間".
    wordSpacing: false,
    // CLDR week data: Japanese calendars start on Sunday.
    weekStartsMonday: false,
    ellipsis: '…',
    // Kana and kanji have no letter case.
    lowercaseMidSentence: false,
    showRawProviderErrors: false,
  },
};

/** Resolves the rendering conventions for arbitrary locale-ish input. */
export function getLocaleConfig(locale: string | null | undefined): LocaleConfig {
  return pickByLocale(LOCALE_CONFIG, locale);
}
