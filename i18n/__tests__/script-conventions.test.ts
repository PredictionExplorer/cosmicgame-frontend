import { resolve } from 'node:path';

import {
  SCRIPT_CONVENTIONS,
  describeViolation,
  localeConventionFiles,
  scanLocaleConventions,
} from '@/scripts/i18n-script-conventions-core';

import { NAMESPACES } from '../request';
import { TRANSLATED_LOCALES } from '../routing';

const ROOT = resolve(__dirname, '..', '..');

/**
 * Jest twin of `npm run i18n:conventions` (docs/i18n/README.md §7): the
 * Chinese catalogs and copy modules contain only their own script, their own
 * regional character choices, and their own quotation marks.
 */
describe.each(TRANSLATED_LOCALES.filter((locale) => SCRIPT_CONVENTIONS[locale] !== null))(
  '%s script conventions',
  (locale) => {
    const conventions = SCRIPT_CONVENTIONS[locale]!;

    it('covers every catalog namespace and at least one copy module', () => {
      const { catalogs, modules } = localeConventionFiles(ROOT, locale);
      expect(catalogs).toHaveLength(NAMESPACES.length);
      expect(modules.length).toBeGreaterThan(0);
    });

    it(`contains only ${conventions.script}-script copy with its own conventions`, () => {
      const violations = scanLocaleConventions(ROOT, locale).map(
        ({ file, location, violation }) =>
          `${file}:${location || violation.line}  ${describeViolation(violation, conventions.script)}`,
      );
      expect(violations).toEqual([]);
    });
  },
);
