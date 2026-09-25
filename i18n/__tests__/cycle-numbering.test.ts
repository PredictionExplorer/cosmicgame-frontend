/**
 * A numbered cycle is written one way per locale, on every screen: the cycle
 * is the unit the whole product is organized around, and "Cycle #2" in one
 * header beside "Cycle 1" in the pager read as two systems. English and the
 * Chinese style guides write the number with its sign (Cycle #12, 第 12 个周期);
 * the Vietnamese glossary writes it bare (chu kỳ 12). Column headers that
 * name the number itself ("Cycle #", "Chu kỳ #") carry no placeholder and
 * are not affected.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MESSAGES = resolve(__dirname, '../../messages');

/** Each locale's forbidden spelling of a numbered cycle, and the one to use. */
const FORBIDDEN: Record<string, { pattern: RegExp; use: string }> = {
  en: { pattern: /\bCycle \{[a-zA-Z]+\}/, use: 'Cycle #{n}' },
  vi: { pattern: /[Cc]hu kỳ #\{[a-zA-Z]+\}/, use: 'Chu kỳ {n}' },
};

function strings(value: unknown, path: string, out: [string, string][]): void {
  if (typeof value === 'string') out.push([path, value]);
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) strings(child, `${path}.${key}`, out);
  }
}

describe.each(Object.entries(FORBIDDEN))('%s numbers every cycle one way', (locale, rule) => {
  it(`writes ${rule.use}`, () => {
    const offenders: string[] = [];
    for (const file of readdirSync(resolve(MESSAGES, locale))) {
      const entries: [string, string][] = [];
      strings(
        JSON.parse(readFileSync(resolve(MESSAGES, locale, file), 'utf8')),
        file.replace(/\.json$/, ''),
        entries,
      );
      for (const [key, text] of entries) if (rule.pattern.test(text)) offenders.push(key);
    }
    expect(offenders).toEqual([]);
  });
});
