import { resolve } from 'node:path';

import {
  LOCALE_CONVENTIONS,
  describeViolation,
  localeConventionFiles,
  scanLocaleConventions,
} from '@/scripts/i18n-conventions-core';

import { NAMESPACES } from '../request';
import { TRANSLATED_LOCALES } from '../routing';

const ROOT = resolve(__dirname, '..', '..');

/**
 * Jest twin of `npm run i18n:conventions` (docs/i18n/README.md §7): every
 * locale with declared conventions has catalogs and copy modules that obey
 * them — only their own script, regional character choices, and quotation
 * marks for the Chinese locales; none of the constructions a style guide
 * forbids by pattern for any locale.
 */
describe.each(TRANSLATED_LOCALES.filter((locale) => LOCALE_CONVENTIONS[locale] !== null))(
  '%s copy conventions',
  (locale) => {
    const conventions = LOCALE_CONVENTIONS[locale]!;

    it('covers every catalog namespace and at least one copy module', () => {
      const { catalogs, modules } = localeConventionFiles(ROOT, locale);
      expect(catalogs).toHaveLength(NAMESPACES.length);
      expect(modules.length).toBeGreaterThan(0);
    });

    it(`obeys the conventions of ${conventions.styleGuide}`, () => {
      const violations = scanLocaleConventions(ROOT, locale).map(
        ({ file, location, violation }) =>
          `${file}:${location || violation.line}  ${describeViolation(violation, conventions)}`,
      );
      expect(violations).toEqual([]);
    });
  },
);
