import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { typography, type TypographyScale } from '../typography';

/**
 * The typography map only earns its keep if every class it names is a utility
 * that Tailwind actually generates. A rename in styles/typography.css would
 * otherwise leave `className={typography.displayLg}` silently unstyled — the
 * class would still be emitted, just with no rules behind it.
 */
const stylesheet = readFileSync(resolve(__dirname, '..', '..', 'styles', 'typography.css'), 'utf8');

const declaredUtilities = new Set(
  Array.from(stylesheet.matchAll(/@utility\s+(type-[\w-]+)\s*\{/g), (match) => match[1]!),
);

describe('typography scale', () => {
  it('finds type utilities in the stylesheet to compare against', () => {
    expect(declaredUtilities.size).toBeGreaterThan(0);
  });

  it.each(Object.entries(typography))('maps %s to a utility that exists', (_key, className) => {
    expect(declaredUtilities.has(className)).toBe(true);
  });

  it('exposes every type utility the stylesheet defines', () => {
    const mapped = new Set<string>(Object.values(typography));
    const orphaned = [...declaredUtilities].filter((utility) => !mapped.has(utility));

    expect(orphaned).toEqual([]);
  });

  it('never points two keys at the same utility', () => {
    const values = Object.values(typography);

    expect(new Set(values).size).toBe(values.length);
  });

  it('resolves a dynamically chosen key, which is the reason the map exists', () => {
    const key: TypographyScale = 'heading2';

    expect(typography[key]).toBe('type-heading-2');
  });
});
