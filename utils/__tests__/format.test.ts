import { execFileSync } from 'node:child_process';

import { routing, type AppLocale } from '@/i18n/routing';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { emptyContractAddresses } from '@/config/networks';
import {
  NBSP,
  UNAVAILABLE_VALUE,
  checksumAddress,
  findKnownAddress,
  formatAddress,
  formatAmount,
  formatAmountParts,
  formatCount,
  formatDateTime,
  formatDateTimeTitle,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatSeconds,
  formatTimeZoneLabel,
  formatZonedDateTimeParts,
  isZeroAddress,
  sameAddress,
  shortenHex,
  toIsoDateTime,
  toIsoDuration,
  type AmountContext,
} from '@/utils/format';

/** Writes expectations with "~" for U+00A0 so the no-break joins stay visible. */
const nb = (text: string): string => text.replace(/~/g, NBSP);

type PerLocale = Record<AppLocale, string>;

/** Asserts `format(locale)` for every routing locale against a complete table. */
function expectEveryLocale(format: (locale: AppLocale) => string, expected: PerLocale): void {
  const actual = Object.fromEntries(routing.locales.map((locale) => [locale, format(locale)]));
  expect(actual).toEqual(
    Object.fromEntries(Object.entries(expected).map(([locale, text]) => [locale, nb(text)])),
  );
}

describe('formatAmount', () => {
  it('groups and rounds ETH to 4 fixed decimals in every locale, per its style guide', () => {
    expectEveryLocale((locale) => formatAmount(1234.56789, { unit: 'ETH', locale }), {
      en: '1,234.5679~ETH',
      zh: '1,234.5679~ETH',
      'zh-TW': '1,234.5679~ETH',
      'zh-HK': '1,234.5679~ETH',
      // style-guide-uk §4: no-break-space grouping, the dot kept for token amounts.
      uk: '1~234.5679~ETH',
      ko: '1,234.5679~ETH',
      ja: '1,234.5679~ETH',
      // style-guide-vi §5: dot thousands, comma decimals, so decimals never read as groups.
      vi: '1.234,5679~ETH',
    });
  });

  it('reads the Vietnamese decimal comma the way the home clock needs it', () => {
    expect(formatAmount(8.07351, { unit: 'ETH', locale: 'vi' })).toBe(nb('8,0735~ETH'));
    expect(formatAmount(1000, { unit: 'CST', locale: 'vi' })).toBe(nb('1.000~CST'));
  });

  it('shows CST with 2 decimals, or none when whole, so protocol constants stay whole', () => {
    expectEveryLocale((locale) => formatAmount(60872.256, { unit: 'CST', locale }), {
      en: '60,872.26~CST',
      zh: '60,872.26~CST',
      'zh-TW': '60,872.26~CST',
      'zh-HK': '60,872.26~CST',
      uk: '60~872.26~CST',
      ko: '60,872.26~CST',
      ja: '60,872.26~CST',
      vi: '60.872,26~CST',
    });
    expect(formatAmount(1000, { unit: 'CST' })).toBe(nb('1,000~CST'));
    expect(formatAmount(205.9, { unit: 'CST' })).toBe(nb('205.90~CST'));
    expect(formatAmount(999.999, { unit: 'CST' })).toBe(nb('1,000~CST'));
    expect(formatAmountParts(999.999, { unit: 'CST' }).exact).toBe(nb('999.999~CST'));
  });

  it.each<[AmountContext, number, string]>([
    ['table', 0.1562, '0.1562'],
    ['table', 2.6548, '2.6548'],
    ['table', 12.3, '12.3000'],
    ['card', 32.29391, '32.2939~ETH'],
    ['card', 10, '10.0000~ETH'],
    ['hero', 1.5, '1.5~ETH'],
    ['hero', 32.29391, '32.2939~ETH'],
    ['exact', 0.102113456, '0.102113~ETH'],
    ['exact', 0.1, '0.1~ETH'],
  ])('ETH in the %s context: %p → %p', (context, value, expected) => {
    const withUnit = context !== 'table';
    expect(formatAmount(value, { unit: 'ETH', context, withUnit })).toBe(nb(expected));
  });

  it('pads table columns to fixed digits so decimals line up', () => {
    const column = [0.1234567, 12.3457, 1234.5678].map((value) =>
      formatAmount(value, { unit: 'ETH', context: 'table', withUnit: false }),
    );
    expect(column).toEqual(['0.1235', '12.3457', '1,234.5678']);
    expect(formatAmount(12.5, { unit: 'CST', context: 'table', withUnit: false })).toBe('12.50');
  });

  it('renders zero as a bare 0 and dust as a bound instead of a wall of zeros', () => {
    expect(formatAmount(0, { unit: 'ETH', context: 'table', withUnit: false })).toBe('0');
    expect(formatAmount(0, { unit: 'ETH' })).toBe(nb('0~ETH'));
    expect(formatAmount(-0, { unit: 'CST' })).toBe(nb('0~CST'));
    expect(formatAmount(0.0000001, { unit: 'ETH', context: 'table' })).toBe(nb('<0.0001~ETH'));
    expect(formatAmount(-0.0000001, { unit: 'ETH', context: 'table' })).toBe(nb('>-0.0001~ETH'));
    expect(formatAmount(0.004, { unit: 'CST' })).toBe(nb('<0.01~CST'));
    expect(formatAmount(0.00004, { unit: 'ETH', locale: 'vi' })).toBe(nb('<0,0001~ETH'));
  });

  it('never bounds an exact amount: tiny values keep 4 significant digits', () => {
    expect(formatAmount(0.00000012345678, { unit: 'ETH', context: 'exact' })).toBe(
      nb('0.0000001235~ETH'),
    );
  });

  it('keeps negatives and signs deltas on request', () => {
    expect(formatAmount(-0.5, { unit: 'ETH' })).toBe(nb('-0.5000~ETH'));
    expect(formatAmount(0.01, { unit: 'ETH', signDisplay: 'exceptZero' })).toBe(nb('+0.0100~ETH'));
    expect(formatAmount(0, { unit: 'ETH', signDisplay: 'exceptZero' })).toBe(nb('0~ETH'));
  });

  it('approximates USD to whole dollars from 100 up', () => {
    expect(formatAmount(1234.567, { unit: 'USD' })).toBe(nb('1,235~USD'));
    expect(formatAmount(12.3, { unit: 'USD' })).toBe(nb('12.30~USD'));
    expect(formatAmount(1234.567, { unit: 'USD', context: 'table', withUnit: false })).toBe(
      '1,234.57',
    );
  });

  it('accepts wei as a bigint and decimal strings without losing precision', () => {
    const wei = 10n ** 18n * 1234n + 5n;
    expect(formatAmount(wei, { unit: 'CST', context: 'hero' })).toBe(nb('1,234~CST'));
    expect(formatAmount(1_500_000n, { unit: 'USD', decimals: 6 })).toBe(nb('1.50~USD'));
    expect(formatAmount('0.1021', { unit: 'ETH' })).toBe(nb('0.1021~ETH'));
    expect(formatAmountParts(wei, { unit: 'CST' }).exact).toBe(nb('1,234.000000000000000005~CST'));
  });

  it('renders anything that is not a number as an em dash', () => {
    for (const value of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY, '1,000', 'abc']) {
      expect(formatAmount(value, { unit: 'ETH' })).toBe(UNAVAILABLE_VALUE);
    }
  });

  it('splits parts for <Amount>: the exact value only when the display rounds', () => {
    expect(formatAmountParts(0.102113456, { unit: 'ETH' })).toEqual({
      number: '0.1021',
      unit: 'ETH',
      exact: nb('0.102113456~ETH'),
      machineValue: '0.102113456',
    });
    expect(formatAmountParts(1, { unit: 'ETH' }).exact).toBeNull();
    expect(formatAmountParts(12096.254179, { unit: 'ETH', locale: 'uk' }).exact).toBe(
      nb('12~096.254179~ETH'),
    );
    expect(formatAmountParts(1, { unit: 'ETH', withUnit: false }).unit).toBeNull();
    expect(formatAmountParts(undefined, { unit: 'ETH' })).toEqual({
      number: UNAVAILABLE_VALUE,
      unit: null,
      exact: null,
      machineValue: null,
    });
  });

  it('writes CST amounts in the grammar the numeric-claims guard reads', () => {
    for (const locale of routing.locales) {
      const intl = new Intl.NumberFormat(getLocaleConfig(locale).intlLocale).format(1000);
      expect(formatAmount(1000, { unit: 'CST', locale }).replace(/\s/g, ' ')).toBe(
        `${intl.replace(/\s/g, ' ')} CST`,
      );
    }
  });
});

describe('formatCount / formatNumber / formatPercent', () => {
  it('groups counts in every locale, including the Chinese locales', () => {
    expectEveryLocale((locale) => formatCount(1234567, locale), {
      en: '1,234,567',
      zh: '1,234,567',
      'zh-TW': '1,234,567',
      'zh-HK': '1,234,567',
      uk: '1~234~567',
      ko: '1,234,567',
      ja: '1,234,567',
      vi: '1.234.567',
    });
    expect(formatCount(3.6)).toBe('4');
    expect(formatCount(12345678901234567890n)).toBe('12,345,678,901,234,567,890');
    expect(formatCount(Number.NaN)).toBe(UNAVAILABLE_VALUE);
    expect(formatCount(null)).toBe(UNAVAILABLE_VALUE);
  });

  it('formats generic numbers with Intl options and the locale conventions', () => {
    expect(formatNumber(1234.5, 'uk', { minimumFractionDigits: 2 })).toBe(nb('1~234.50'));
    expect(formatNumber(1234.5, 'vi', { minimumFractionDigits: 2 })).toBe('1.234,50');
  });

  it('attaches the percent sign in every locale', () => {
    expectEveryLocale((locale) => formatPercent(0.398, locale, { maximumFractionDigits: 3 }), {
      en: '0.398%',
      zh: '0.398%',
      'zh-TW': '0.398%',
      'zh-HK': '0.398%',
      uk: '0.398%',
      ko: '0.398%',
      ja: '0.398%',
      vi: '0,398%',
    });
    for (const locale of routing.locales) {
      expect(formatPercent(50, locale)).not.toMatch(/\s%/);
    }
  });

  it('reads percentage points by default and ratios on request', () => {
    expect(formatPercent(25)).toBe('25%');
    expect(formatPercent(12.54)).toBe('12.5%');
    expect(formatPercent(0.125, 'en', { scale: 'ratio' })).toBe('12.5%');
    expect(formatPercent(2.5, 'en', { signDisplay: 'exceptZero' })).toBe('+2.5%');
    expect(formatPercent(50, 'en', { minimumFractionDigits: 1 })).toBe('50.0%');
    expect(formatPercent(undefined)).toBe(UNAVAILABLE_VALUE);
  });
});

describe('formatDateTime', () => {
  const timestamp = Date.UTC(2026, 8, 22, 23, 4, 45) / 1000;
  const lastYear = Date.UTC(2025, 0, 5, 7, 8, 9) / 1000;
  const now = Date.UTC(2026, 8, 23, 2, 4, 45);

  it('renders the compact table form without the current year', () => {
    expectEveryLocale((locale) => formatDateTime(timestamp, { locale, timeZone: 'utc', now }), {
      en: 'Sep 22, 23:04',
      zh: '9月22日 23:04',
      'zh-TW': '9月22日 23:04',
      'zh-HK': '9月22日 23:04',
      uk: '22 вер., 23:04',
      ko: '9월 22일 23:04',
      ja: '9月22日 23:04',
      vi: '22/9, 23:04',
    });
  });

  it('adds the year when a row is from another year, so history stays unambiguous', () => {
    expectEveryLocale(
      (locale) => formatDateTime(lastYear, { locale, timeZone: 'utc', now, seconds: true }),
      {
        en: 'Jan 05, 2025, 07:08:09',
        zh: '2025年1月5日 07:08:09',
        'zh-TW': '2025年1月5日 07:08:09',
        'zh-HK': '2025年1月5日 07:08:09',
        uk: '5 січ. 2025 р., 07:08:09',
        ko: '2025년 1월 5일 07:08:09',
        ja: '2025年1月5日 07:08:09',
        vi: '5/1/2025, 07:08:09',
      },
    );
    expect(formatDateTime(lastYear, { timeZone: 'utc', now, year: 'never' })).toBe('Jan 05, 07:08');
    expect(formatDateTime(timestamp, { timeZone: 'utc', now, year: 'always' })).toBe(
      'Sep 22, 2026, 23:04',
    );
  });

  it('always shows the year and seconds in the full detail form', () => {
    expectEveryLocale(
      (locale) => formatDateTime(timestamp, { locale, timeZone: 'utc', style: 'full' }),
      {
        en: 'Sep 22, 2026, 23:04:45',
        zh: '2026年9月22日 23:04:45',
        'zh-TW': '2026年9月22日 23:04:45',
        'zh-HK': '2026年9月22日 23:04:45',
        uk: '22 вер. 2026 р., 23:04:45',
        ko: '2026년 9월 22일 23:04:45',
        ja: '2026年9月22日 23:04:45',
        vi: '22/9/2026, 23:04:45',
      },
    );
  });

  it('renders any IANA zone, which is how tests model a browser zone', () => {
    expect(
      formatDateTime(timestamp, { timeZone: 'America/Los_Angeles', style: 'full', locale: 'ja' }),
    ).toBe('2026年9月22日 16:04:45');
    expect(formatDateTime(timestamp, { timeZone: 'Asia/Tokyo', now, locale: 'en' })).toBe(
      'Sep 23, 08:04',
    );
  });

  it('compares the year in the displayed zone, not in UTC', () => {
    const newYearUtc = Date.UTC(2026, 0, 1, 0, 30) / 1000;
    const midYear = Date.UTC(2026, 5, 1);
    expect(formatDateTime(newYearUtc, { timeZone: 'America/Los_Angeles', now: midYear })).toBe(
      'Dec 31, 2025, 16:30',
    );
    expect(formatDateTime(newYearUtc, { timeZone: 'utc', now: midYear })).toBe('Jan 01, 00:30');
  });

  it('renders an invalid timestamp as an em dash', () => {
    expect(formatDateTime(undefined)).toBe(UNAVAILABLE_VALUE);
    expect(formatDateTime(Number.NaN)).toBe(UNAVAILABLE_VALUE);
    expect(formatDateTime(1e20)).toBe(UNAVAILABLE_VALUE);
    expect(toIsoDateTime(Number.NaN)).toBeUndefined();
    expect(toIsoDateTime(timestamp)).toBe('2026-09-22T23:04:45.000Z');
  });

  it('keeps browser-local semantics in a non-UTC process zone', () => {
    const script = `
      import('./utils/format.ts').then((format) => {
        const api = format.default ?? format;
        const timestamp = Date.UTC(2026, 0, 1, 0, 30, 45) / 1000;
        const now = Date.UTC(2026, 5, 1);
        process.stdout.write(JSON.stringify([
          api.formatDateTime(timestamp, { seconds: true, now }),
          api.formatDateTime(timestamp, { seconds: true, now, locale: 'zh' }),
          api.formatDateTime(timestamp, { seconds: true, now, timeZone: 'utc' }),
          api.formatTimeZoneLabel('local', new Date(now)),
        ]));
      });
    `;
    const output = execFileSync(process.execPath, ['--import', 'tsx', '--eval', script], {
      cwd: process.cwd(),
      env: { ...process.env, TZ: 'America/Los_Angeles' },
      encoding: 'utf8',
    });

    expect(JSON.parse(output)).toEqual([
      'Dec 31, 2025, 16:30:45',
      '2025年12月31日 16:30:45',
      'Jan 01, 00:30:45',
      'UTC-7',
    ]);
  });
});

describe('formatTimeZoneLabel / formatDateTimeTitle / formatRelativeTime', () => {
  const timestamp = Date.UTC(2026, 8, 22, 23, 4, 45) / 1000;
  const now = Date.UTC(2026, 8, 23, 2, 4, 45);

  it('labels zones as UTC offsets that read the same in every language', () => {
    const at = new Date(Date.UTC(2026, 6, 1));
    expect(formatTimeZoneLabel('utc', at)).toBe('UTC');
    expect(formatTimeZoneLabel('UTC', at)).toBe('UTC');
    expect(formatTimeZoneLabel('Asia/Kolkata', at)).toBe('UTC+5:30');
    expect(formatTimeZoneLabel('Asia/Kathmandu', at)).toBe('UTC+5:45');
    expect(formatTimeZoneLabel('America/Los_Angeles', at)).toBe('UTC-7');
    expect(formatTimeZoneLabel('America/Los_Angeles', new Date(Date.UTC(2026, 0, 1)))).toBe(
      'UTC-8',
    );
  });

  it('puts the full date, zone and age in the hover title', () => {
    expectEveryLocale(
      (locale) => formatDateTimeTitle(timestamp, { locale, timeZone: 'utc', now }),
      {
        en: 'Sep 22, 2026, 23:04:45 UTC · 3 hours ago',
        zh: '2026年9月22日 23:04:45（UTC） · 3 小时前',
        'zh-TW': '2026年9月22日 23:04:45（UTC） · 3 小時前',
        'zh-HK': '2026年9月22日 23:04:45（UTC） · 3 小時前',
        uk: '22 вер. 2026 р., 23:04:45 UTC · 3 години тому',
        ko: '2026년 9월 22일 23:04:45 UTC · 3시간 전',
        ja: '2026年9月22日 23:04:45（UTC） · 3時間前',
        vi: '22/9/2026, 23:04:45 UTC · 3 giờ trước',
      },
    );
    expect(formatDateTimeTitle(timestamp, { timeZone: 'Asia/Kolkata' })).toBe(
      'Sep 23, 2026, 04:34:45 UTC+5:30',
    );
    expect(formatDateTimeTitle(undefined)).toBe(UNAVAILABLE_VALUE);
  });

  it('renders ages for live surfaces', () => {
    expect(formatRelativeTime(timestamp, { now })).toBe('3 hours ago');
    expect(formatRelativeTime(timestamp, { now: timestamp * 1000 + 30_000 })).toBe('just now');
    expect(formatRelativeTime(timestamp, { now, locale: 'ja' })).toBe('3時間前');
    expect(formatRelativeTime(null, { now })).toBe(UNAVAILABLE_VALUE);
  });
});

describe('formatDuration', () => {
  it('joins compact units so a duration never breaks across lines', () => {
    expectEveryLocale((locale) => formatDuration(90061, { locale }), {
      en: '1d~1h~1m~1s',
      zh: '1天1小时1分1秒',
      'zh-TW': '1天1小時1分1秒',
      'zh-HK': '1天1小時1分1秒',
      uk: '1д~1год~1хв~1с',
      ko: '1일~1시간~1분~1초',
      ja: '1日1時間1分1秒',
      vi: '1ng~1g~1ph~1s',
    });
  });

  it('renders countdowns as days plus a clock', () => {
    expectEveryLocale((locale) => formatDuration(597824, { locale, style: 'clock' }), {
      en: '6d~22:03:44',
      zh: '6天22:03:44',
      'zh-TW': '6天22:03:44',
      'zh-HK': '6天22:03:44',
      uk: '6д~22:03:44',
      ko: '6일~22:03:44',
      ja: '6日22:03:44',
      vi: '6ng~22:03:44',
    });
    expect(formatDuration(3_725, { style: 'clock' })).toBe('01:02:05');
    expect(formatDuration(-5, { style: 'clock' })).toBe('00:00:00');
  });

  it('keeps inner zero units and drops trailing ones', () => {
    expect(formatDuration(86_405)).toBe(nb('1d~0h~0m~5s'));
    expect(formatDuration(90_000)).toBe(nb('1d~1h'));
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(0.9)).toBe('0s');
    expect(formatDuration(-10)).toBe('0s');
    expect(formatDuration(Number.NaN)).toBe(UNAVAILABLE_VALUE);
  });

  it('truncates to the leading units for tight readouts', () => {
    expect(formatDuration(90061, { maxUnits: 2 })).toBe(nb('1d~1h'));
    expect(formatDuration(3_661, { maxUnits: 1 })).toBe('1h');
  });

  it('keeps the legacy formatSeconds contract for existing callers', () => {
    expect(formatSeconds(90061)).toBe(nb('1d~1h~1m~1s'));
    expect(formatSeconds(-1)).toBe(' ');
  });

  it('emits ISO 8601 durations for <time dateTime>', () => {
    expect(toIsoDuration(597824)).toBe('P6DT22H3M44S');
    expect(toIsoDuration(86_400)).toBe('P1D');
    expect(toIsoDuration(90)).toBe('PT1M30S');
    expect(toIsoDuration(0)).toBe('PT0S');
    expect(toIsoDuration(undefined)).toBeUndefined();
  });
});

describe('addresses', () => {
  const lower = '0x1ec14a8e8b5c1f7f0a7a1c3b5e6d7e8f9ad7e990';
  const checksummed = checksumAddress(lower);

  it('checksums addresses and leaves anything else alone', () => {
    expect(checksummed).not.toBe(lower);
    expect(checksummed.toLowerCase()).toBe(lower);
    expect(checksumAddress(checksummed)).toBe(checksummed);
    expect(checksumAddress('vitalik.eth')).toBe('vitalik.eth');
  });

  it('shortens to 0x + 4 … 4 with a single ellipsis character', () => {
    expect(formatAddress(lower)).toBe(`${checksummed.slice(0, 6)}…\u2060${checksummed.slice(-4)}`);
    expect(formatAddress(lower)).toMatch(/^0x[0-9a-fA-F]{4}…\u2060[0-9a-fA-F]{4}$/);
    expect(formatAddress(lower, { variant: 'full' })).toBe(checksummed);
    expect(formatAddress(`0x${'ab'.repeat(32)}`)).toBe('0xabab…\u2060abab');
  });

  it('joins the halves with a word joiner after the ellipsis so the short form never wraps', () => {
    // UAX #14 allows a line break after U+2026; U+2060 WORD JOINER removes that
    // opportunity, so "0x1Ec1…" never sits above "E990" in a narrow button.
    const short = formatAddress(lower);
    expect([...short]).toHaveLength(2 + 4 + 2 + 4);
    expect(short.indexOf('\u2060')).toBe(short.indexOf('…') + 1);
    expect(short.split('\u2060')).toHaveLength(2);
    expect(short).not.toMatch(/\s/);
    // The full form carries no invisible characters: it is what users copy.
    expect(formatAddress(lower, { variant: 'full' })).not.toContain('\u2060');
  });

  it('returns short and non-hex values whole, and empty input as an empty string', () => {
    expect(formatAddress('0x12')).toBe('0x12');
    expect(formatAddress('vitalik.eth')).toBe('vitalik.eth');
    expect(formatAddress('')).toBe('');
    expect(formatAddress(undefined)).toBe('');
  });

  it('routes the legacy shortenHex through the one standard, whatever length is passed', () => {
    expect(shortenHex(lower, 6)).toBe(formatAddress(lower));
    expect(shortenHex(lower, 8)).toBe(formatAddress(lower));
    expect(shortenHex(lower)).toBe(formatAddress(lower));
  });

  it('recognizes the zero address and compares addresses case-insensitively', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    expect(isZeroAddress(lower)).toBe(false);
    expect(isZeroAddress(undefined)).toBe(false);
    expect(sameAddress(lower, checksummed)).toBe(true);
    expect(sameAddress(lower, '')).toBe(false);
    expect(sameAddress(null, null)).toBe(false);
  });

  it('finds which protocol contract an address is', () => {
    const contracts = { ...emptyContractAddresses(), charity: checksummed };
    expect(findKnownAddress(lower, contracts)).toBe('publicGoods');
    expect(findKnownAddress('0x0000000000000000000000000000000000000001', contracts)).toBeNull();
    expect(findKnownAddress(undefined, contracts)).toBeNull();
  });
});

describe('typographic details', () => {
  it('signs a delta with the true minus sign, level with the plus', () => {
    // Regression: signed CST amounts printed Intl's hyphen-minus ("-269.74"),
    // short and low beside "+176.00" in the same tabular column.
    expect(
      formatAmount(-269.74, { unit: 'CST', context: 'table', signDisplay: 'exceptZero' }),
    ).toBe('\u2212269.74\u00a0CST');
    expect(formatAmount(176, { unit: 'CST', context: 'table', signDisplay: 'exceptZero' })).toBe(
      '+176.00\u00a0CST',
    );
    // An unsigned amount keeps whatever Intl prints.
    expect(formatAmount(-1, { unit: 'ETH', context: 'hero' })).toBe('-1\u00a0ETH');
  });

  it('labels a standalone date with its zone in the locale style', () => {
    const at = Date.UTC(2026, 8, 22, 23, 4, 45) / 1000;
    const now = Date.UTC(2026, 8, 24);
    expect(formatDateTime(at, { timeZone: 'utc', now, showZone: true })).toBe('Sep 22, 23:04 UTC');
    expect(formatDateTime(at, { locale: 'ja', timeZone: 'utc', now, showZone: true })).toBe(
      '9月22日 23:04（UTC）',
    );
    expect(formatZonedDateTimeParts(at, { locale: 'ja', timeZone: 'utc', now })).toEqual({
      lead: '9月22日 23:04（',
      zone: 'UTC',
      trail: '）',
    });
    expect(formatZonedDateTimeParts(null)).toBeNull();
  });

  it('pads the day only where dates stack in a column', () => {
    const march9 = Date.UTC(2024, 2, 9, 10, 0, 0) / 1000;
    const now = Date.UTC(2026, 8, 24);
    // Compact (tables, cards): padded so a column lines up.
    expect(formatDateTime(march9, { timeZone: 'utc', now })).toBe('Mar 09, 2024, 10:00');
    // Full (record pages, hover titles): as written.
    expect(formatDateTime(march9, { style: 'full', timeZone: 'utc', now })).toBe(
      'Mar 9, 2024, 10:00:00',
    );
  });
});
