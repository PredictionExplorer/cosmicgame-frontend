import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';

import { routing } from '../routing';

type Unit = 'days' | 'hours' | 'minutes' | 'seconds';
const UNITS: readonly Unit[] = ['days', 'hours', 'minutes', 'seconds'];

interface LandingCatalog {
  timer: { units: Record<Unit, string>; duration: Record<Unit, string> };
}
interface HomeCatalog {
  observatory: { clock: { unitLabels: Record<Unit, string> } };
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
 * one that reads right under any two-digit figure.
 */
const MANY_LOCALES = routing.locales.filter((locale) =>
  new Intl.PluralRules(locale).resolvedOptions().pluralCategories.includes('many'),
);

describe('countdown captions', () => {
  it('covers at least one locale with a "many" plural', () => {
    expect(MANY_LOCALES.length).toBeGreaterThan(0);
  });

  describe.each(MANY_LOCALES)('%s', (locale) => {
    const landing = catalog<LandingCatalog>(locale, 'landing').timer;
    const clock = catalog<HomeCatalog>(locale, 'home').observatory.clock.unitLabels;

    it.each(UNITS)('captions %s with the "many" plural form on both hosts', (unit) => {
      const many = pluralBranch(landing.duration[unit], 'many');
      expect(landing.units[unit]).toBe(many);
      expect(clock[unit]).toBe(many);
    });
  });
});
