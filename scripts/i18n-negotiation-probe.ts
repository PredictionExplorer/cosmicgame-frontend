#!/usr/bin/env tsx
/**
 * Prints, as JSON, which supported locale next-intl's negotiation picks for
 * each `Accept-Language` preference list given on the command line:
 *
 *   npx tsx scripts/i18n-negotiation-probe.ts "zh-Hant" "zh-MO,zh" "yue-HK"
 *
 * next-intl's middleware parses the header into an ordered list and calls
 * `@formatjs/intl-localematcher`'s `match` with the default "best fit"
 * algorithm over the supported locales sorted longest-first; this reproduces
 * that call exactly (the matcher is ESM-only, so the jest suite runs this probe
 * through tsx instead of importing it). It is the evidence behind the locale
 * codes in i18n/routing.ts: CLDR language-matching data carries `zh-Hant` to
 * Taiwan and `zh-MO` / `yue` to Hong Kong with no translation table in between.
 */

import { match } from '@formatjs/intl-localematcher';

import { routing } from '../i18n/routing';

const supported = [...routing.locales].sort((a, b) => b.length - a.length);

const result = Object.fromEntries(
  process.argv.slice(2).map((header) => {
    const requested = header
      .split(',')
      .map((part) => part.split(';')[0]!.trim())
      .filter(Boolean);
    return [header, match(requested, supported, routing.defaultLocale)];
  }),
);

process.stdout.write(`${JSON.stringify(result)}\n`);
