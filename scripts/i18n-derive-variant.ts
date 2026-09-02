#!/usr/bin/env tsx
/**
 * Bootstraps a sibling-script locale from an existing one (docs/i18n/README.md §10).
 *
 *   npm run i18n:derive -- --from zh --to zh-TW
 *   npm run i18n:derive -- --from zh --to zh-HK --overwrite
 *
 * Writes `messages/<to>/*.json` and every `content/**` copy module of the
 * source locale (`text.<from>.ts`, `<from>.ts`, `*Content.<from>.ts`) as a
 * MECHANICAL FIRST DRAFT: OpenCC character + phrase conversion, quotation
 * marks switched to the target script's convention, glossary substitutions,
 * and module identifiers renamed (`faqTextZh` → `faqTextZhTw`). It never
 * touches the `index.ts` registries under `content/`, never runs in CI, and
 * its output is not copy — every string is then rewritten against the target
 * locale's glossary and style guide (OpenCC knows characters and some
 * vocabulary; it does not know register, rhythm, or which mainland phrases a
 * Taipei or Hong Kong reader finds foreign). The script-conventions gate and
 * terminology packs catch what the rewrite misses. Tables and conversion
 * logic live in ./i18n-derive-variant-core.ts.
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

import { routing, type AppLocale } from '../i18n/routing';

import {
  DERIVATIONS,
  convertJsonSource,
  createVariantConverter,
  renameIdentifiers,
} from './i18n-derive-variant-core';

const ROOT = resolve(process.cwd());

interface Cli {
  from: AppLocale;
  to: AppLocale;
  overwrite: boolean;
}

function parseCli(argv: readonly string[]): Cli {
  const read = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv[index + 1];
  };
  const from = read('--from');
  const to = read('--to');
  const isLocale = (value: string | undefined): value is AppLocale =>
    value !== undefined && (routing.locales as readonly string[]).includes(value);
  if (!isLocale(from) || !isLocale(to)) {
    console.error(
      `usage: i18n-derive-variant --from <locale> --to <locale> [--overwrite]\n  locales: ${routing.locales.join(', ')}`,
    );
    process.exit(2);
  }
  return { from, to, overwrite: argv.includes('--overwrite') };
}

const cli = parseCli(process.argv.slice(2));
const converter = createVariantConverter(cli.from, cli.to);
if (!converter) {
  console.error(
    `no derivation from ${cli.from} to ${cli.to}; known: ${Object.keys(DERIVATIONS).join(', ')}`,
  );
  process.exit(2);
}

function writeGuarded(target: string, contents: string): boolean {
  if (existsSync(target) && !cli.overwrite) {
    console.warn(`skip  ${relative(ROOT, target)} (exists; pass --overwrite to replace)`);
    return false;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
  console.log(`write ${relative(ROOT, target)}`);
  return true;
}

function deriveMessages(): number {
  const sourceDir = join(ROOT, 'messages', cli.from);
  let written = 0;
  for (const file of readdirSync(sourceDir)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const converted = convertJsonSource(readFileSync(join(sourceDir, file), 'utf8'), converter!);
    JSON.parse(converted); // conversion must never break the catalog
    if (writeGuarded(join(ROOT, 'messages', cli.to, file), converted)) written += 1;
  }
  return written;
}

/** Copy modules of the source locale: `text.zh.ts`, `text.basic.zh.ts`, `zh.ts`, `TermsContent.zh.ts`. */
function isSourceCopyModule(name: string): boolean {
  return name === `${cli.from}.ts` || name.endsWith(`.${cli.from}.ts`);
}

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__') continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (isSourceCopyModule(entry)) out.push(path);
  }
}

function deriveContent(): number {
  const modules: string[] = [];
  walk(join(ROOT, 'content'), modules);
  let written = 0;
  for (const source of modules.sort()) {
    const name = basename(source);
    const targetName =
      name === `${cli.from}.ts` ? `${cli.to}.ts` : name.replace(`.${cli.from}.ts`, `.${cli.to}.ts`);
    const converted = renameIdentifiers(
      converter!.text(readFileSync(source, 'utf8')),
      cli.from,
      cli.to,
    );
    if (writeGuarded(join(dirname(source), targetName), converted)) written += 1;
  }
  return written;
}

console.log(`✨  deriving ${cli.to} drafts from ${cli.from}`);
const catalogs = deriveMessages();
const modules = deriveContent();
console.log(`\n${catalogs} catalog(s), ${modules} content module(s) written.`);
console.log(
  `Drafts only: rewrite against docs/i18n/glossary-${cli.to}.md, register the modules in content/*/index.ts, then run npm run i18n:check.`,
);
