import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { routing } from '../routing';

/**
 * Locale negotiation is next-intl's job (proxy.ts delegates to it); this pins
 * what its CLDR "best fit" matcher does with the tags Chinese-reading browsers
 * actually send, given our locale codes — the reason the codes are
 * `zh` / `zh-TW` / `zh-HK`. The probe reproduces next-intl's `match` call
 * (see scripts/i18n-negotiation-probe.ts); the matcher is ESM-only, so it runs
 * through tsx rather than being imported into the jsdom suite.
 */
const CASES: Record<string, string> = {
  'zh-TW,zh;q=0.9,en;q=0.8': 'zh-TW',
  'zh-HK,zh-TW;q=0.9,zh;q=0.8': 'zh-HK',
  'zh-Hant': 'zh-TW',
  'zh-Hant-TW': 'zh-TW',
  'zh-Hant-HK': 'zh-HK',
  'zh-Hant-MO': 'zh-HK',
  'zh-MO': 'zh-HK',
  yue: 'zh-HK',
  'yue-HK': 'zh-HK',
  'zh-CN,zh;q=0.9': 'zh',
  'zh-Hans': 'zh',
  'zh-Hans-CN': 'zh',
  'zh-SG': 'zh',
  'zh-MY': 'zh',
  zh: 'zh',
  'uk-UA,uk;q=0.9': 'uk',
  'en-GB,en;q=0.9': routing.defaultLocale,
  'ja-JP': routing.defaultLocale,
};

let negotiated: Record<string, string>;

beforeAll(() => {
  const output = execFileSync(
    join(process.cwd(), 'node_modules/.bin/tsx'),
    [join(process.cwd(), 'scripts/i18n-negotiation-probe.ts'), ...Object.keys(CASES)],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  negotiated = JSON.parse(output) as Record<string, string>;
});

describe('Accept-Language negotiation for the Chinese variants', () => {
  it.each(Object.entries(CASES))('%s lands on %s', (header, expected) => {
    expect(negotiated[header]).toBe(expected);
  });

  it('never sends a Traditional reader to the Simplified catalog', () => {
    for (const header of ['zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK', 'zh-Hant-MO', 'zh-MO']) {
      expect(negotiated[header]).not.toBe('zh');
    }
  });
});
