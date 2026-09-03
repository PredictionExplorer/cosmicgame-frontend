#!/usr/bin/env tsx
/* eslint-disable no-console -- command-line quality gate */

/**
 * Copy-conventions gate (docs/i18n/README.md §7): every message catalog and
 * copy module of a translated locale is checked against the locale's
 * conventions in ./i18n-conventions-core.ts — for every locale, Unicode
 * Normalization Form C; for the Chinese locales, characters of the wrong
 * script, regional character forms that belong to another variant, and the
 * other script's quotation marks; for any locale, the constructions its style
 * guide forbids outright. Part of `npm run i18n:check`; the same checks run
 * under jest in i18n/__tests__/conventions.test.ts.
 */

import { resolve } from 'node:path';

import { TRANSLATED_LOCALES } from '../i18n/routing';

import {
  LOCALE_CONVENTIONS,
  describeConventions,
  describeViolation,
  localeConventionFiles,
  scanLocaleConventions,
} from './i18n-conventions-core';

const ROOT = resolve(process.cwd());

let failures = 0;
let filesChecked = 0;

console.log('\u270d\ufe0f   Copy conventions');

for (const locale of TRANSLATED_LOCALES) {
  const conventions = LOCALE_CONVENTIONS[locale];

  const { catalogs, modules } = localeConventionFiles(ROOT, locale);
  filesChecked += catalogs.length + modules.length;
  const documented = conventions ? ` (${conventions.styleGuide})` : '';
  console.log(
    `   ${locale} (${describeConventions(conventions)}): ${catalogs.length} catalogs, ${modules.length} copy modules${documented}`,
  );

  for (const { file, location, violation } of scanLocaleConventions(ROOT, locale)) {
    const where = location ? `${file}:${location}` : `${file}:${violation.line}`;
    console.error(`\u274c  ${where}  ${describeViolation(violation, conventions)}`);
    console.error(`    ${violation.excerpt}`);
    failures += 1;
  }
}

console.log('');
if (failures > 0) {
  console.error(`\n\u274c  copy conventions failed with ${failures} violation(s)`);
  process.exit(1);
}
console.log(
  `\u2705  copy conventions passed \u2014 ${filesChecked} catalogs and copy modules checked`,
);
