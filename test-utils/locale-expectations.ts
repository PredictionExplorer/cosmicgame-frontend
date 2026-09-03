// Relative imports: the e2e suites (Playwright, no `@/` alias) share this file.
import { protocolFacts } from '../content/protocol-facts';
import type { LocaleRecord } from '../i18n/locale';
import type { TranslatedLocale } from '../i18n/routing';

/**
 * Per-locale expectations shared by the unit and e2e suites.
 *
 * These used to live as literals inside individual specs (`'zh'`, `/^##
 * Українська/`, `'hours?|годин[аиу]?|小时'`), which meant a locale could be
 * registered in routing without any suite noticing that nothing was asserted
 * about it. Every registry here is typed against the routing contract, so
 * adding a locale turns each into a compile error until the new language
 * declares what its script looks like, how its duration nouns read, which
 * llms.txt section it owns, and which Accept-Language headers must land on
 * it. The suites then derive their cases from `TRANSLATED_LOCALES`.
 */

/** Matches at least one character of the locale's writing system. */
export const SCRIPT_PATTERNS: Record<TranslatedLocale, RegExp> = {
  zh: /[\u3400-\u9fff]/,
  'zh-TW': /[\u3400-\u9fff]/,
  'zh-HK': /[\u3400-\u9fff]/,
  uk: /[\u0400-\u04ff]/,
  ko: /[\uac00-\ud7a3]/,
  // Hiragana, katakana, or kanji — Japanese copy always mixes at least two.
  ja: /[\u3040-\u30ff\u3400-\u9fff]/,
  // A Vietnamese letter with a diacritic: the marked vowels of Latin-1 (à, é,
  // ì …), ă â ê ô ơ ư đ ĩ ũ, or any tone-marked vowel of the Latin Extended
  // Additional block (ế, ợ, ữ …). Plain ASCII could be English; no Vietnamese
  // sentence goes long without one of these.
  vi: /[\u00c0-\u00c3\u00c8-\u00ca\u00cc\u00cd\u00d2-\u00d5\u00d9\u00da\u00dd\u00e0-\u00e3\u00e8-\u00ea\u00ec\u00ed\u00f2-\u00f5\u00f9\u00fa\u00fd\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01a0\u01a1\u01af\u01b0\u1ea0-\u1ef9]/,
};

/**
 * Regex alternations (no capture groups) for the unit nouns that follow a
 * protocol duration figure in this language, so "48 hours" / "48 годин" /
 * "48 小時" are all held to `protocolFacts` by
 * content/__tests__/copy-numeric-claims.test.ts. Inflected languages list
 * every form a figure can govern.
 */
export interface DurationNouns {
  readonly hours: string;
  readonly weeks: string;
  readonly days: string;
  /**
   * Lookbehind fragment: a figure preceded by this is a calendar date, not a
   * duration (Korean 8월 15일 "August 15", where 일 also means "day").
   */
  readonly notAfter?: string;
}

export const DURATION_NOUNS: LocaleRecord<DurationNouns> = {
  en: { hours: 'hours?', weeks: 'weeks?', days: 'days?' },
  zh: { hours: '小时', weeks: '周', days: '天' },
  'zh-TW': { hours: '小時', weeks: '週|周', days: '天' },
  'zh-HK': { hours: '小時', weeks: '週|周', days: '天' },
  uk: {
    // Every plural category: година/години/годин/годину, тиждень/тижні/тижнів,
    // день/дні/днів/дня.
    hours: 'годин[аиу]?',
    weeks: 'тиж(?:день|н[іяю]|нів|нями|нях|нем)',
    days: 'д(?:ень|н[іяю]|нів|нями|нях|нем)',
  },
  ko: {
    // Sino-Korean counters attach to the digit: 48시간, 5주, 1일.
    hours: '시간',
    weeks: '주',
    days: '일',
    // 8월 15일 is a calendar date (August 15), not a 15-day duration.
    notAfter: '월\\s?',
  },
  ja: {
    // Counters attach to the digit with no space: 48時間, 5週間, 1日 / 7日間.
    hours: '時間',
    weeks: '週間?',
    days: '日間?',
    // 8月15日 is a calendar date (August 15), not a 15-day duration.
    notAfter: '月\\s?',
  },
  vi: {
    // No inflection: 48 giờ, 5 tuần, 1 ngày / 7 ngày. Dates put the noun
    // first (ngày 15 tháng 8), so a figure followed by ngày is a duration.
    hours: 'giờ',
    weeks: 'tuần',
    days: 'ngày',
  },
};

/** What `public/llms.txt` and `public/llms-full.txt` must say in this language. */
export interface LlmsSectionExpectation {
  /** Start of the section heading line, matched as `^## <heading>`. */
  readonly heading: string;
  /** Protocol facts in the locale's own words that both docs must contain. */
  readonly phrases: readonly string[];
  /**
   * A digit-grouping style the language never uses next to its own copy
   * (Ukrainian reads `1,000` as a decimal), if any.
   */
  readonly forbiddenNumberFormat?: RegExp;
}

export const LLMS_SECTIONS: Record<TranslatedLocale, LlmsSectionExpectation> = {
  zh: {
    heading: '中文',
    phrases: [
      '程序化链上艺术协议',
      '48 小时',
      `${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT`,
      '每枚 RandomWalk NFT 只能',
      'COSMIC 癌症突变数据库',
    ],
  },
  'zh-TW': {
    heading: '繁體中文（台灣）',
    phrases: [
      '程序化鏈上藝術協議',
      '48 小時',
      `${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT`,
      '每枚 RandomWalk NFT 只能',
      'COSMIC 癌症突變資料庫',
    ],
  },
  'zh-HK': {
    heading: '繁體中文（香港）',
    phrases: [
      '程序化鏈上藝術協議',
      '48 小時',
      `${protocolFacts.typicalNftsPerCycle} 枚 Cosmic Signature NFT`,
      '每枚 RandomWalk NFT 只能',
      'COSMIC 癌症突變數據庫',
    ],
  },
  uk: {
    heading: 'Українська',
    phrases: [
      'процедурний протокол ончейн-мистецтва',
      '48 годин',
      `${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT`,
      'кожен RandomWalk NFT',
      'базою даних мутацій раку COSMIC',
    ],
    // Ukrainian thousands never use the English comma grouping, which a
    // Ukrainian reader parses as a decimal point.
    forbiddenNumberFormat: /\d,\d{3} CST[^\n]*[\u0400-\u04ff]/,
  },
  ko: {
    heading: '한국어',
    phrases: [
      '절차적 온체인 아트 프로토콜',
      '48시간',
      `Cosmic Signature NFT ${protocolFacts.typicalNftsPerCycle}개`,
      '각 RandomWalk NFT',
      'COSMIC 암 돌연변이 데이터베이스',
    ],
  },
  ja: {
    heading: '日本語',
    phrases: [
      'プロシージャル・オンチェーンアート・プロトコル',
      '48時間',
      `${protocolFacts.typicalNftsPerCycle}枚のCosmic Signature NFT`,
      '各RandomWalk NFT',
      'COSMICがん変異データベース',
    ],
  },
  vi: {
    heading: 'Tiếng Việt',
    phrases: [
      'giao thức nghệ thuật tạo sinh trên chuỗi',
      '48 giờ',
      `${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFT`,
      'mỗi RandomWalk NFT',
      'cơ sở dữ liệu đột biến ung thư COSMIC',
    ],
    // Vietnamese groups thousands with a dot and reads the English comma as
    // a decimal separator.
    forbiddenNumberFormat: /\d,\d{3} CST[^\n]*[\u1ea0-\u1ef9]/,
  },
};

/**
 * Accept-Language headers next-intl's CLDR "best fit" matcher must resolve to
 * this locale (i18n/__tests__/negotiation.test.ts). Each locale pins at least
 * the tag browsers configured for that language actually send.
 */
export const NEGOTIATION_PROBES: Record<TranslatedLocale, readonly string[]> = {
  zh: ['zh-CN,zh;q=0.9', 'zh-Hans', 'zh-Hans-CN', 'zh-SG', 'zh-MY', 'zh'],
  'zh-TW': ['zh-TW,zh;q=0.9,en;q=0.8', 'zh-Hant', 'zh-Hant-TW'],
  'zh-HK': ['zh-HK,zh-TW;q=0.9,zh;q=0.8', 'zh-Hant-HK', 'zh-Hant-MO', 'zh-MO', 'yue', 'yue-HK'],
  uk: ['uk-UA,uk;q=0.9', 'uk'],
  ko: ['ko-KR,ko;q=0.9,en-US;q=0.8', 'ko', 'ko-KP'],
  ja: ['ja-JP,ja;q=0.9,en-US;q=0.8', 'ja', 'ja-JP'],
  vi: ['vi-VN,vi;q=0.9,en-US;q=0.8', 'vi', 'vi-VN'],
};
