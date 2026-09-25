/**
 * A numbered cycle is written one way per locale, on every screen and in every
 * register (H1, link label, meta title, running prose): the cycle is the unit
 * the whole product is organized around, and "Cycle #2" in one header beside
 * "cycle 1" in the next read as two systems. English writes the number with
 * its sign and a capital (Cycle #12); the Chinese style guides write
 * 第 12 个周期 / 第 12 個週期; Japanese, Korean, Ukrainian and Vietnamese write
 * the bare number their glossaries prescribe (サイクル12, 사이클 12, цикл 12,
 * chu kỳ 12). Column headers that name the number itself ("Cycle #",
 * "Chu kỳ #") carry no placeholder and are not affected, and a list of
 * several cycles ("Cycles 1, 4, 7") is not a numbered cycle.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { LocaleRecord } from '@/i18n/locale';
import { routing } from '@/i18n/routing';

const MESSAGES = resolve(__dirname, '../../messages');

/** The placeholder names the catalogs give a single cycle's number. */
const N = String.raw`\{(?:cycle|n|number|id|round|live)[,}]`;

/**
 * Chinese puts the number before the noun (第 12 个周期); a number after it, signed or
 * bare, in brackets or not, is a second form. A "#12" value beside a 周期 label is data.
 */
const CHINESE = [new RegExp(String.raw`(?:周期|週期)[（(]?\s*#?${N}`)];

/** Each locale's forbidden spellings of a numbered cycle, and the one to use. */
const RULES: LocaleRecord<{ forbidden: readonly RegExp[]; use: string }> = {
  // A bare number in any case ("cycle {cycle}", "Cycle {n}"), or the sign in lower case.
  en: { forbidden: [/\bcycle \{[a-zA-Z]+[,}]/i, /\bcycle '?#'?\{/], use: 'Cycle #{n}' },
  zh: { forbidden: CHINESE, use: '第 {n} 个周期' },
  'zh-TW': { forbidden: CHINESE, use: '第 {n} 個週期' },
  'zh-HK': { forbidden: CHINESE, use: '第 {n} 個週期' },
  uk: { forbidden: [new RegExp(String.raw`[Цц]икл\p{L}*\s*[#№]\s*${N}`, 'u')], use: 'цикл {n}' },
  ko: {
    forbidden: [new RegExp(String.raw`사이클\s*#\s*${N}`), new RegExp(`사이클${N}`)],
    use: '사이클 {n}',
  },
  ja: {
    forbidden: [
      new RegExp(String.raw`サイクル\s*[#＃]\s*${N}`),
      new RegExp(String.raw`サイクル\s+${N}`),
    ],
    use: 'サイクル{n}',
  },
  vi: { forbidden: [/chu kỳ\s*#\{/iu], use: 'chu kỳ {n}' },
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
    it(`writes ${rule.use}`, () => {
      expect(offendersIn(locale, rule.forbidden)).toEqual([]);
    });
  },
);

describe('the English rule', () => {
  const matches = (text: string) => RULES.en.forbidden.some((pattern) => pattern.test(text));

  it.each([
    'Configuration before cycle {cycle}',
    'View cycle {n}',
    'All contributions in Cycle {cycle}',
    'Cycle {cycle, number} allocations',
    'allocation information for cycle #{id}',
  ])('rejects %s', (text) => {
    expect(matches(text)).toBe(true);
  });

  it.each([
    'Configuration before Cycle #{cycle}',
    "{count, plural, one {Cycle '#'{cycles}} other {Cycles {cycles}}}",
    'Cycle #',
    'this cycle’s gestures',
  ])('accepts %s', (text) => {
    expect(matches(text)).toBe(false);
  });
});

describe('the Chinese rule', () => {
  const matches = (text: string) => CHINESE.some((pattern) => pattern.test(text));

  it.each(['本周期（#{cycle}）收官后', '週期 {cycle}', '周期 #{n}'])('rejects %s', (text) => {
    expect(matches(text)).toBe(true);
  });

  it.each(['第 {cycle} 个周期收官后', '每个周期 {percentage}', '落笔 #{position}'])(
    'accepts %s',
    (text) => {
      expect(matches(text)).toBe(false);
    },
  );
});
