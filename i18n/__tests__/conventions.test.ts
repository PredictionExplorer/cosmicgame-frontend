import { resolve } from 'node:path';

import {
  LOCALE_CONVENTIONS,
  checkNormalization,
  describeViolation,
  localeConventionFiles,
  scanLocaleConventions,
} from '@/scripts/i18n-conventions-core';

import { NAMESPACES } from '../request';
import { TRANSLATED_LOCALES } from '../routing';

const ROOT = resolve(__dirname, '..', '..');

/**
 * Jest twin of `npm run i18n:conventions` (docs/i18n/README.md §7): every
 * translated locale's catalogs and copy modules are in Normalization Form C,
 * and every locale with declared conventions obeys them — only its own
 * script, regional character choices, and quotation marks for the Chinese
 * locales; none of the constructions a style guide forbids by pattern for
 * any locale.
 */
describe.each(TRANSLATED_LOCALES)('%s copy conventions', (locale) => {
  const conventions = LOCALE_CONVENTIONS[locale];

  it('covers every catalog namespace and at least one copy module', () => {
    const { catalogs, modules } = localeConventionFiles(ROOT, locale);
    expect(catalogs).toHaveLength(NAMESPACES.length);
    expect(modules.length).toBeGreaterThan(0);
  });

  it(`obeys ${conventions ? `the conventions of ${conventions.styleGuide}` : 'the universal conventions'}`, () => {
    const violations = scanLocaleConventions(ROOT, locale).map(
      ({ file, location, violation }) =>
        `${file}:${location || violation.line}  ${describeViolation(violation, conventions)}`,
    );
    expect(violations).toEqual([]);
  });
});

describe('checkNormalization', () => {
  it('accepts precomposed text and reports the first decomposed sequence per line', () => {
    expect(checkNormalization('Tiếng Việt\nChu kỳ')).toEqual([]);
    const decomposed = `Ti${'e\u0302\u0301'}ng Vi${'e\u0302\u0323'}t`;
    const [violation, ...rest] = checkNormalization(`ok\n${decomposed}`);
    expect(rest).toEqual([]);
    expect(violation).toMatchObject({ line: 2, reason: 'normalization', expected: 'ế' });
    expect(violation?.character).toBe('e\u0302\u0301');
  });
});
