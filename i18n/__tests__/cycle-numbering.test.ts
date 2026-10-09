/**
 * A numbered cycle is written one way per locale, on every screen and in every
 * register (H1, link label, meta title, running prose): the cycle is the unit
 * the whole product is organized around, and "Cycle #2" in one header beside
 * "cycle 1" in the next read as two systems (V383). A cycle is named by its
 * number alone: "#" marks an identifier (Signature #000025, Gesture #1135,
 * Contribution #7), never a cycle, so the H1 of /current-cycle and the link to
 * the last cycle's allocations cannot disagree again (V434, V221).
 *
 * English writes the number after a capital, as a name (Cycle 12, like
 * "Chapter 12"); the Chinese style guides write 第 12 个周期 / 第 12 個週期;
 * Japanese, Korean, Ukrainian and Vietnamese write the bare number their
 * glossaries prescribe (サイクル12, 사이클 12, цикл 12, chu kỳ 12). Column
 * headers that name the number itself ("Cycle #") carry no number and are not
 * affected, an ICU plural's own "#" ("사이클 #개", "サイクル#件") is a count of
 * cycles, and a list of several cycles ("Cycles 1, 4, 7") is not a numbered
 * cycle.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { LocaleRecord } from '@/i18n/locale';
import { routing } from '@/i18n/routing';

const MESSAGES = resolve(__dirname, '../../messages');

/** The placeholder names the catalogs give a single cycle's number. */
const N = String.raw`\{(?:cycle|n|number|id|round|live)[,}]`;

/** A sign before a number or a placeholder: "#2", "#{cycle}", "# {n}". */
const SIGNED = String.raw`\s*[#＃№]\s*(?=[\d{])`;

/** A hash glued to a placeholder that only ever holds a cycle number, in any locale. */
const HASHED_CYCLE_PLACEHOLDER = /#\{(?:cycle|round|live)\b/;

/**
 * Chinese puts the number before the noun (第 12 个周期); a number after it, signed or
 * bare, in brackets or not, is a second form. A "#12" value beside a 周期 label is data.
 */
const CHINESE = [
  new RegExp(String.raw`(?:周期|週期)[（(]?\s*#?${N}`),
  new RegExp(String.raw`(?:周期|週期)\s*[（(]?${SIGNED}`, 'u'),
];

/** Each locale's forbidden spellings of a numbered cycle, and the one to use. */
const RULES: LocaleRecord<{ forbidden: readonly RegExp[]; use: string }> = {
  // A sign in any case ("Cycle #2", "cycle #{id}"), or a lower-case "cycle {n}".
  en: {
    forbidden: [/\bcycles? '?#'?(?=[\d{])/i, /\bcycle \{[a-zA-Z]+[,}]/],
    use: 'Cycle {n}',
  },
  zh: { forbidden: CHINESE, use: '第 {n} 个周期' },
  'zh-TW': { forbidden: CHINESE, use: '第 {n} 個週期' },
  'zh-HK': { forbidden: CHINESE, use: '第 {n} 個週期' },
  uk: { forbidden: [new RegExp(String.raw`цикл\p{L}*${SIGNED}`, 'iu')], use: 'цикл {n}' },
  ko: {
    forbidden: [new RegExp(String.raw`사이클${SIGNED}`, 'u'), new RegExp(`사이클${N}`)],
    use: '사이클 {n}',
  },
  ja: {
    forbidden: [
      new RegExp(String.raw`サイクル${SIGNED}`, 'u'),
      new RegExp(String.raw`サイクル\s+${N}`),
    ],
    use: 'サイクル{n}',
  },
  vi: { forbidden: [new RegExp(String.raw`\bchu kỳ${SIGNED}`, 'iu')], use: 'chu kỳ {n}' },
};

function strings(value: unknown, path: string, out: [string, string][]): void {
  if (typeof value === 'string') out.push([path, value]);
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) strings(child, `${path}.${key}`, out);
  }
}

function offendersIn(locale: string, forbidden: readonly RegExp[]): string[] {
  const offenders: string[] = [];
  for (const file of readdirSync(resolve(MESSAGES, locale))) {
    const entries: [string, string][] = [];
    strings(
      JSON.parse(readFileSync(resolve(MESSAGES, locale, file), 'utf8')),
      file.replace(/\.json$/, ''),
      entries,
    );
    for (const [key, text] of entries) {
      if (forbidden.some((pattern) => pattern.test(text))) offenders.push(`${key}: ${text}`);
    }
  }
  return offenders;
}

describe.each(routing.locales.map((locale) => [locale, RULES[locale]] as const))(
  '%s numbers every cycle one way',
  (locale, rule) => {
    it(`writes ${rule.use}, without "#"`, () => {
      expect(offendersIn(locale, [...rule.forbidden, HASHED_CYCLE_PLACEHOLDER])).toEqual([]);
    });
  },
);

describe('the English rule', () => {
  const matches = (text: string) => RULES.en.forbidden.some((pattern) => pattern.test(text));

  it.each([
    'Configuration before Cycle #{cycle}',
    'View cycle {n}',
    'All contributions in cycle {cycle}',
    'Cycle #2 so far',
    'allocation information for cycle #{id}',
    "{count, plural, one {Cycle '#'{cycles}} other {Cycles {cycles}}}",
  ])('rejects %s', (text) => {
    expect(matches(text)).toBe(true);
  });

  it.each([
    'Configuration before Cycle {cycle}',
    'Cycle {cycle, number} allocations',
    '{count, plural, one {Cycle {cycles}} other {Cycles {cycles}}}',
    'Gesture #{position} · Cycle {cycle}',
    'Cycle #',
    'this cycle’s gestures',
  ])('accepts %s', (text) => {
    expect(matches(text)).toBe(false);
  });
});

describe('the Chinese rule', () => {
  const matches = (text: string) => CHINESE.some((pattern) => pattern.test(text));

  it.each(['本周期（#{cycle}）收官后', '週期 {cycle}', '周期 #{n}', '週期 #12'])(
    'rejects %s',
    (text) => {
      expect(matches(text)).toBe(true);
    },
  );

  it.each(['第 {cycle} 个周期收官后', '每个周期 {percentage}', '落笔 #{position}'])(
    'accepts %s',
    (text) => {
      expect(matches(text)).toBe(false);
    },
  );
});

describe('the other locales', () => {
  const matches = (locale: keyof typeof RULES, text: string) =>
    RULES[locale].forbidden.some((pattern) => pattern.test(text));

  it.each([
    ['uk', 'Цикл #{cycle}'],
    ['uk', 'циклу № 3'],
    ['ko', '사이클 #{cycle}'],
    ['ko', '사이클{cycle}'],
    ['ja', 'サイクル#{cycle}'],
    ['ja', 'サイクル {cycle}'],
    ['vi', 'Chu kỳ #{cycle}'],
  ] as const)('%s rejects %s', (locale, text) => {
    expect(matches(locale, text)).toBe(true);
  });

  it.each([
    ['uk', 'Цикл {cycle}'],
    ['ko', '사이클 {cycle}'],
    ['ko', '{count, plural, other {사이클 #개}}'],
    ['ja', 'サイクル{cycle}'],
    ['ja', '{count, plural, other {サイクル#件}}'],
    ['vi', 'Chu kỳ {cycle}'],
  ] as const)('%s accepts %s', (locale, text) => {
    expect(matches(locale, text)).toBe(false);
  });
});
