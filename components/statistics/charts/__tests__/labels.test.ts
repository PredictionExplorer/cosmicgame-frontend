import { formatDateRange, formatMonthDay, formatTimeTick } from '../labels';

const LOCALES = ['en', 'zh', 'zh-TW', 'zh-HK', 'uk', 'ko', 'ja', 'vi'] as const;

const MAY_8_2026 = Date.UTC(2026, 4, 8) / 1000;
const OCT_27_2026 = Date.UTC(2026, 9, 27) / 1000;

/** Space characters whose use varies between ICU builds (Node vs browsers). */
const ICU_VARIANT_SPACES = /[\u00A0\u2009\u202F]/;

describe('chart date labels', () => {
  it('writes the range with the year once and plain spaces only', () => {
    // Node's own ICU puts thin spaces (U+2009) around the range dash, where
    // browsers put plain spaces; these labels render during SSR, so the two
    // must agree or hydration fails (ChartReadout captions).
    expect(formatDateRange(MAY_8_2026, OCT_27_2026, 'en')).toBe('May 8 – Oct 27, 2026');
  });

  it.each(LOCALES)('uses no ICU-variant space characters (%s)', (locale) => {
    const outputs = [
      formatDateRange(MAY_8_2026, OCT_27_2026, locale),
      formatDateRange(MAY_8_2026, MAY_8_2026, locale),
      formatMonthDay(MAY_8_2026, locale),
      formatTimeTick(MAY_8_2026, { unit: 'month', size: 1 }, locale, { first: true }),
    ];
    for (const output of outputs) {
      expect(output).not.toMatch(ICU_VARIANT_SPACES);
    }
  });
});
