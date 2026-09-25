import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';

import { clockUnitLabels, type ClockUnit } from '@/utils/format/durations';

import { routing } from '../routing';

const UNITS: readonly ClockUnit[] = ['days', 'hours', 'minutes', 'seconds'];

interface LandingCatalog {
  timer: { duration: Record<ClockUnit, string> };
}

const catalog = <T>(locale: string, namespace: string): T =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), 'messages', locale, `${namespace}.json`), 'utf8'),
  ) as T;

/** The literal text of one plural branch of `{count, plural, …}`, without the `#`. */
function pluralBranch(message: string, category: Intl.LDMLPluralRule): string {
  const [element] = parse(message);
  if (element?.type !== TYPE.plural) throw new Error(`not a plural message: ${message}`);
  const branch = element.options[category];
  if (!branch) throw new Error(`no "${category}" branch in: ${message}`);
  return branch.value
    .filter((part: MessageFormatElement) => part.type === TYPE.literal)
    .map((part) => (part.type === TYPE.literal ? part.value : ''))
    .join('')
    .trim();
}

/**
 * V424: the clock captions sit under ticking figures (05 · 10 · 50 · 27). In a
 * language whose plural has a `many` category (Ukrainian), a nominative plural
 * such as «дні» or «хвилини» disagrees with most of them, and a per-count form
 * would change every second. The caption is the `many` form (днів, хвилин), the
 * one that reads right under any two-digit figure. Every clock on both hosts
 * reads its captions from the one unit catalog, `clockUnitLabels`.
 */
const MANY_LOCALES = routing.locales.filter((locale) =>
  new Intl.PluralRules(locale).resolvedOptions().pluralCategories.includes('many'),
);

describe('countdown captions', () => {
  it('covers at least one locale with a "many" plural', () => {
    expect(MANY_LOCALES.length).toBeGreaterThan(0);
  });

  describe.each(MANY_LOCALES)('%s', (locale) => {
    const duration = catalog<LandingCatalog>(locale, 'landing').timer.duration;

    it.each(UNITS)('captions %s with the "many" plural form', (unit) => {
      expect(clockUnitLabels(locale)[unit]).toBe(pluralBranch(duration[unit], 'many'));
    });
  });
});
