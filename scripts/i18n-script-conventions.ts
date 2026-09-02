#!/usr/bin/env tsx
/* eslint-disable no-console -- command-line quality gate */

/**
 * Script-conventions gate (docs/i18n/README.md §7): every message catalog and
 * copy module of a Chinese locale is checked for characters of the wrong
 * script, regional character forms that belong to another variant, and the
 * other script's quotation marks. Part of `npm run i18n:check`; the same
 * checks run under jest in i18n/__tests__/script-conventions.test.ts.
 */

import { resolve } from 'node:path';

import { TRANSLATED_LOCALES } from '../i18n/routing';

import {
  SCRIPT_CONVENTIONS,
  describeViolation,
  localeConventionFiles,
  scanLocaleConventions,
} from './i18n-script-conventions-core';

const ROOT = resolve(process.cwd());

let failures = 0;
let filesChecked = 0;

console.log('\u270d\ufe0f   Script conventions');

for (const locale of TRANSLATED_LOCALES) {
  const conventions = SCRIPT_CONVENTIONS[locale];
  if (!conventions) continue;

  const { catalogs, modules } = localeConventionFiles(ROOT, locale);
  filesChecked += catalogs.length + modules.length;
  console.log(
    `   ${locale} (${conventions.script}): ${catalogs.length} catalogs, ${modules.length} copy modules (${conventions.styleGuide})`,
  );

  for (const { file, location, violation } of scanLocaleConventions(ROOT, locale)) {
    const where = location ? `${file}:${location}` : `${file}:${violation.line}`;
    console.error(`\u274c  ${where}  ${describeViolation(violation, conventions.script)}`);
    console.error(`    ${violation.excerpt}`);
    failures += 1;
  }
}

console.log('');
if (failures > 0) {
  console.error(`\n\u274c  script conventions failed with ${failures} violation(s)`);
  process.exit(1);
}
console.log(
  `\u2705  script conventions passed \u2014 ${filesChecked} catalogs and copy modules checked`,
);
