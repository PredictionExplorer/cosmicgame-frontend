#!/usr/bin/env tsx
/**
 * Translation integrity report and gate (docs/i18n/README.md §7).
 *
 * Compares every translated locale in `routing.locales` against the default
 * locale and reports, per message namespace, key parity, ICU syntax,
 * placeholder/tag parity, plural completeness for the locale's CLDR
 * categories, and verbatim-copy (untranslated) catalogs; then, per long-form
 * content area (./i18n-content-areas.ts), how much prose still equals the
 * English source. The checks themselves live in ./i18n-parity-core.ts and
 * also run under jest (i18n/__tests__/catalog-integrity.test.ts).
 *
 * Exit code:
 *   0  in report mode (default) unless catalogs are malformed or the
 *      messages/ directory disagrees with routing.locales.
 *   1  with --strict [ns ...] when the listed namespaces (or all, if none
 *      listed) have any problem, or when a content area is untranslated.
 */
/* eslint-disable no-console -- CLI report output. This file is a Node script
   run via `npm run i18n:parity` and never ships to the browser. */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { getLocaleConfig } from '../i18n/localeConfig';
import { routing, TRANSLATED_LOCALES } from '../i18n/routing';

import { CONTENT_AREAS } from './i18n-content-areas';
import {
  checkSourceNamespace,
  compareContent,
  compareNamespace,
  isPlainObject,
  strictProblems,
  type Messages,
} from './i18n-parity-core';

const MESSAGES_DIR = resolve(process.cwd(), 'messages');
const DEFAULT_LOCALE = routing.defaultLocale;

interface CliFlags {
  strict: boolean;
  strictNamespaces: readonly string[];
}

function parseFlags(argv: readonly string[]): CliFlags {
  const strictIndex = argv.indexOf('--strict');
  const strictNamespaces =
    strictIndex === -1 ? [] : argv.slice(strictIndex + 1).filter((arg) => !arg.startsWith('--'));
  return { strict: strictIndex !== -1, strictNamespaces };
}

function readNamespace(locale: string, fileName: string): Messages {
  const raw = readFileSync(join(MESSAGES_DIR, locale, fileName), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!isPlainObject(parsed)) {
    throw new Error(`${locale}/${fileName} must contain a JSON object`);
  }
  return parsed;
}

function listNamespaces(locale: string): string[] {
  return readdirSync(join(MESSAGES_DIR, locale))
    .filter((file) => file.endsWith('.json'))
    .sort();
}

/** The messages/ tree must mirror routing.locales exactly — no stray or missing locale dirs. */
function assertLocaleDirectories(): void {
  const onDisk = readdirSync(MESSAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const expected: readonly string[] = [...routing.locales].sort();
  const strayDirs = onDisk.filter((dir) => !expected.includes(dir));
  const missingDirs = expected.filter((locale) => !onDisk.includes(locale));
  if (strayDirs.length || missingDirs.length) {
    throw new Error(
      `messages/ must contain exactly one directory per routing locale (${expected.join(', ')})` +
        (missingDirs.length ? `; missing: ${missingDirs.join(', ')}` : '') +
        (strayDirs.length ? `; not a routing locale: ${strayDirs.join(', ')}` : ''),
    );
  }
}

const flags = parseFlags(process.argv.slice(2));
assertLocaleDirectories();

const enNamespaces = listNamespaces(DEFAULT_LOCALE);
let failures = 0;

const isStrict = (namespace: string): boolean =>
  flags.strict &&
  (flags.strictNamespaces.length === 0 || flags.strictNamespaces.includes(namespace));

console.log(
  `i18n parity — comparing ${TRANSLATED_LOCALES.join(', ') || '(no locales)'} against ${DEFAULT_LOCALE}\n`,
);

// The source catalog must itself be well-formed ICU with complete plurals.
for (const namespaceFile of enNamespaces) {
  const namespace = namespaceFile.replace(/\.json$/, '');
  const report = checkSourceNamespace(
    namespace,
    readNamespace(DEFAULT_LOCALE, namespaceFile),
    getLocaleConfig(DEFAULT_LOCALE).intlLocale,
  );
  const problems = [...report.syntaxErrors, ...report.pluralGaps];
  if (problems.length) {
    console.log(`  ${DEFAULT_LOCALE}/${namespace}: ${problems.length} source problem(s)`);
    for (const problem of problems) console.log(`      · ${problem}`);
    if (isStrict(namespace)) failures += 1;
  }
}

for (const locale of TRANSLATED_LOCALES) {
  const intlLocale = getLocaleConfig(locale).intlLocale;
  const localeNamespaces = new Set(listNamespaces(locale));
  let localeMissing = 0;
  let localeIdentical = 0;
  let localeTotal = 0;

  for (const namespaceFile of enNamespaces) {
    const namespace = namespaceFile.replace(/\.json$/, '');
    const source = readNamespace(DEFAULT_LOCALE, namespaceFile);

    if (!localeNamespaces.has(namespaceFile)) {
      const size = Object.keys(source).length;
      console.log(`  ${locale}/${namespace}: MISSING FILE (${size} keys fall back)`);
      localeTotal += size;
      localeMissing += size;
      if (isStrict(namespace)) failures += 1;
      continue;
    }

    const report = compareNamespace({
      namespace,
      source,
      translation: readNamespace(locale, namespaceFile),
      intlLocale,
    });
    const translated = report.total - report.missing.length - report.empty.length;
    localeTotal += report.total;
    localeMissing += report.missing.length + report.empty.length;
    localeIdentical += report.identical.length;

    const problems = strictProblems(report);
    if (isStrict(namespace) && problems.length > 0) failures += 1;

    const pct = report.total === 0 ? 100 : Math.round((translated / report.total) * 100);
    console.log(
      `  ${locale}/${namespace}: ${translated}/${report.total} translated (${pct}%)` +
        (report.identical.length ? ` — ${report.identical.length} identical to source` : '') +
        (report.untranslated ? ' — UNTRANSLATED' : '') +
        (problems.length ? ` — ${problems.length} problem(s)` : ''),
    );
    for (const problem of problems.slice(0, 8)) console.log(`      · ${problem}`);
    if (problems.length > 8) console.log(`      · … ${problems.length - 8} more`);
  }

  const done = localeTotal - localeMissing;
  const pct = localeTotal === 0 ? 100 : Math.round((done / localeTotal) * 100);
  console.log(
    `\n  ${locale} TOTAL: ${done}/${localeTotal} (${pct}%), ${localeIdentical} identical to source\n`,
  );

  const extraNamespaces = [...localeNamespaces].filter((file) => !enNamespaces.includes(file));
  for (const file of extraNamespaces) {
    console.log(`  ${locale}/${file}: EXTRA FILE (no ${DEFAULT_LOCALE} counterpart)`);
    if (flags.strict) failures += 1;
  }

  // Long-form content: the mapped types guarantee shape, so the only question
  // is whether the prose was translated. Only whole namespaces are strict
  // targets on the command line; content areas fail strict mode as a group.
  let contentIdentical = 0;
  let contentTotal = 0;
  for (const { area, read } of CONTENT_AREAS) {
    const report = compareContent(area, read(DEFAULT_LOCALE), read(locale));
    contentTotal += report.total;
    contentIdentical += report.identical.length;
    const translated = report.total - report.identical.length;
    const areaPct = report.total === 0 ? 100 : Math.round((translated / report.total) * 100);
    console.log(
      `  ${locale} content/${area}: ${translated}/${report.total} translated (${areaPct}%)` +
        (report.identical.length ? ` — ${report.identical.length} identical to source` : '') +
        (report.untranslated ? ' — UNTRANSLATED' : ''),
    );
    if (report.untranslated && flags.strict && flags.strictNamespaces.length === 0) failures += 1;
  }
  console.log(
    `\n  ${locale} CONTENT: ${contentTotal - contentIdentical}/${contentTotal} translated, ${contentIdentical} identical to source\n`,
  );
}

if (flags.strict && failures > 0) {
  console.error(`❌  i18n parity failed for ${failures} namespace(s)`);
  process.exit(1);
}
console.log('✅  i18n parity report complete');
