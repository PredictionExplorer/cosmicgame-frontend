#!/usr/bin/env tsx
/**
 * Scaffolds every per-locale file a new language needs (docs/i18n/README.md §10).
 *
 *   npm run i18n:scaffold -- --locale ko
 *   npm run i18n:scaffold -- --locale pt-BR --from pt --overwrite
 *
 * Writes the message catalogs, copy modules, gate stub, e2e suites, and
 * documentation templates for the locale (see ./i18n-scaffold-locale-core.ts
 * for the list), then prints the compiler-driven steps that follow. Nothing it
 * writes is copy: catalogs and modules still read as the source language and
 * `npm run i18n:strict` reports them UNTRANSLATED until they are rewritten.
 * Never runs in CI.
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { resolve } from 'node:path';

import { routing } from '../i18n/routing';

import {
  languageNames,
  nextSteps,
  scaffoldLocale,
  scaffoldLocaleProblem,
} from './i18n-scaffold-locale-core';

interface Cli {
  locale: string;
  source: string;
  overwrite: boolean;
}

function parseCli(argv: readonly string[]): Cli {
  const read = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv[index + 1];
  };
  const locale = read('--locale');
  const source = read('--from') ?? routing.defaultLocale;
  const usage = `usage: i18n-scaffold-locale --locale <bcp47> [--from <locale>] [--overwrite]\n  source locales: ${routing.locales.join(', ')}`;
  if (!locale) {
    console.error(usage);
    process.exit(2);
  }
  const problem = scaffoldLocaleProblem(locale);
  if (problem) {
    console.error(`${problem}\n${usage}`);
    process.exit(2);
  }
  if (!(routing.locales as readonly string[]).includes(source)) {
    console.error(`--from must name a routing locale\n${usage}`);
    process.exit(2);
  }
  return { locale, source, overwrite: argv.includes('--overwrite') };
}

const cli = parseCli(process.argv.slice(2));
const names = languageNames(cli.locale);

console.log(
  `✨  scaffolding ${cli.locale} (${names.english} — ${names.autonym}) from ${cli.source}`,
);
const result = scaffoldLocale({
  root: resolve(process.cwd()),
  locale: cli.locale,
  source: cli.source,
  overwrite: cli.overwrite,
});
for (const path of result.written) console.log(`write ${path}`);
for (const path of result.skipped)
  console.warn(`skip  ${path} (exists; pass --overwrite to replace)`);

console.log(`\n${result.written.length} file(s) written, ${result.skipped.length} skipped.\n`);
console.log('Next, in order:');
nextSteps(cli.locale, names).forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
