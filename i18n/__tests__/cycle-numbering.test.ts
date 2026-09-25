import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { LocaleRecord } from '../locale';
import { NAMESPACES } from '../request';
import { routing } from '../routing';

/**
 * A cycle is named by its number alone: "Cycle 2", "Chu kỳ 2", "Цикл 2",
 * "第 2 个周期". The "#" marks an identifier (Signature #000025, Gesture
 * #1135, Contribution #7), never a cycle, so the H1 of /current-cycle and
 * the link to last cycle's allocations (V434, V221) cannot disagree again.
 */
// "#" then a digit or a placeholder: an ICU plural's own "#" ("사이클 #개",
// "サイクル#件") is the count of cycles, which is right.
const HASHED_CYCLE: LocaleRecord<RegExp> = {
  en: /\bcycles? #(?=[\d{])/i,
  zh: /周期\s*（?#(?=[\d{])/u,
  'zh-TW': /週期\s*（?#(?=[\d{])/u,
  'zh-HK': /週期\s*（?#(?=[\d{])/u,
  uk: /цикл\p{L}* #(?=[\d{])/iu,
  ko: /사이클\s*#(?=[\d{])/u,
  ja: /サイクル\s*#(?=[\d{])/u,
  vi: /\bchu kỳ #(?=[\d{])/iu,
};

/** A hash glued to a placeholder that only ever holds a cycle number. */
const HASHED_CYCLE_PLACEHOLDER = /#\{(?:cycle|round|live)\b/;

type Catalog = { [key: string]: string | Catalog };

function strings(locale: string, namespace: string): [string, string][] {
  const path = resolve(process.cwd(), 'messages', locale, `${namespace}.json`);
  const walk = (node: Catalog, prefix: string): [string, string][] =>
    Object.entries(node).flatMap(([key, value]) =>
      typeof value === 'string'
        ? [[`${namespace}:${prefix}${key}`, value] as [string, string]]
        : walk(value, `${prefix}${key}.`),
    );
  return walk(JSON.parse(readFileSync(path, 'utf8')) as Catalog, '');
}

describe.each(routing.locales)('cycle numbers in %s', (locale) => {
  const all = NAMESPACES.flatMap((namespace) => strings(locale, namespace));

  it('writes a cycle as its number, without "#"', () => {
    const hashed = all.filter(
      ([, value]) => HASHED_CYCLE[locale].test(value) || HASHED_CYCLE_PLACEHOLDER.test(value),
    );
    expect(hashed).toEqual([]);
  });
});
