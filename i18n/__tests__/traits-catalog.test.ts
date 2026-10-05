import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { routing, TRANSLATED_LOCALES } from '../routing';

interface TraitsCatalog {
  values: { palette: { pattern: string; hues: Record<string, string> } } & Record<string, unknown>;
  card: { traitSummary: string };
}

const traits = (locale: string): TraitsCatalog =>
  JSON.parse(
    readFileSync(resolve(process.cwd(), 'messages', locale, 'traits.json'), 'utf8'),
  ) as TraitsCatalog;

/** Every string under `values`, with its key, except the palette schemes (always mid-phrase). */
function traitValues(locale: string): [string, string][] {
  const out: [string, string][] = [];
  const walk = (node: unknown, path: string) => {
    if (typeof node === 'string') out.push([path, node]);
    else if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        if (path === 'values.palette' && key === 'schemes') continue;
        walk(child, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(traits(locale).values, 'values');
  return out;
}

// V426: Ukrainian put the middle dot inside the palette ("сонце · моно") and a
// comma between traits, so on a detail page's "·"-joined meta line one
// palette read as two more traits.
describe('trait captions', () => {
  it.each(routing.locales)('%s writes a palette as one phrase, never with "·"', (locale) => {
    expect(traits(locale).values.palette.pattern).not.toContain('·');
  });

  it.each(TRANSLATED_LOCALES)('%s joins traits with the same separator as English', (locale) => {
    expect(traits(locale).card.traitSummary).toBe(traits(routing.defaultLocale).card.traitSummary);
  });

  // Scripts without case (Han, Hangul, kana) start with no lowercase letter either.
  it.each(routing.locales)(
    '%s starts every trait value with a capital, as a label head',
    (locale) => {
      const lowercase = traitValues(locale).filter(([, value]) => /^\p{Ll}/u.test(value));
      expect(lowercase).toEqual([]);
    },
  );
});
