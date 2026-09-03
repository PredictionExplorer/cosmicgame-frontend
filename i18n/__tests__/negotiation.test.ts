import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { NEGOTIATION_PROBES } from '@/test-utils/locale-expectations';

import { routing, TRANSLATED_LOCALES } from '../routing';

/**
 * Locale negotiation is next-intl's job (proxy.ts delegates to it); this pins
 * what its CLDR "best fit" matcher does with the tags browsers actually send,
 * given our locale codes — the reason the codes are `zh` / `zh-TW` / `zh-HK`
 * rather than script tags. Each translated locale declares its probes in
 * `NEGOTIATION_PROBES`, so a new locale cannot register without proving its
 * readers reach it. The probe reproduces next-intl's `match` call (see
 * scripts/i18n-negotiation-probe.ts); the matcher is ESM-only, so it runs
 * through tsx rather than being imported into the jsdom suite.
 */
const FALLBACK_HEADERS = ['en-GB,en;q=0.9', 'ja-JP', 'fr-FR,fr;q=0.9'] as const;

const CASES: ReadonlyArray<readonly [header: string, expected: string]> = [
  ...TRANSLATED_LOCALES.flatMap((locale) =>
    NEGOTIATION_PROBES[locale].map((header) => [header, locale] as const),
  ),
  ...FALLBACK_HEADERS.map((header) => [header, routing.defaultLocale] as const),
];

let negotiated: Record<string, string>;

beforeAll(() => {
  const output = execFileSync(
    join(process.cwd(), 'node_modules/.bin/tsx'),
    [join(process.cwd(), 'scripts/i18n-negotiation-probe.ts'), ...CASES.map(([header]) => header)],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  negotiated = JSON.parse(output) as Record<string, string>;
});

describe('Accept-Language negotiation', () => {
  it.each(CASES)('%s lands on %s', (header, expected) => {
    expect(negotiated[header]).toBe(expected);
  });

  it('never sends a Traditional reader to the Simplified catalog', () => {
    for (const header of ['zh-Hant', 'zh-Hant-TW', 'zh-Hant-HK', 'zh-Hant-MO', 'zh-MO']) {
      expect(negotiated[header]).not.toBe('zh');
    }
  });

  it('never sends an unsupported language anywhere but the default locale', () => {
    for (const header of FALLBACK_HEADERS) {
      expect(negotiated[header]).toBe(routing.defaultLocale);
    }
  });
});
