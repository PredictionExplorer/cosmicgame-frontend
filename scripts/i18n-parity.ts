#!/usr/bin/env tsx
/**
 * Message-catalog parity report (docs/i18n/README.md §7).
 *
 * Compares every non-default locale's catalogs against the English source of
 * truth in messages/en/ and reports, per namespace:
 *   - missing keys (present in en, absent in the locale) — fall back to en,
 *   - empty keys (present but ''), treated the same as missing,
 *   - extra keys (absent in en) — dead weight, likely a typo or stale key.
 *
 * Exit code:
 *   0  in report mode (default) unless namespaces are malformed.
 *   1  with --strict [ns ...] when the listed namespaces (or all, if none
 *      listed) have missing/empty/extra keys. Sprints flip namespaces to
 *      strict as their translations complete (docs/i18n/progress.md).
 */
/* eslint-disable no-console -- CLI report output. This file is a Node script
   run via `yarn i18n:parity` and never ships to the browser. */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MESSAGES_DIR = resolve(process.cwd(), 'messages');
const DEFAULT_LOCALE = 'en';

interface CliFlags {
  strict: boolean;
  strictNamespaces: readonly string[];
}

function parseFlags(argv: readonly string[]): CliFlags {
  const strictIndex = argv.indexOf('--strict');
  if (strictIndex === -1) return { strict: false, strictNamespaces: [] };
  return { strict: true, strictNamespaces: argv.slice(strictIndex + 1) };
}

type Json = Record<string, unknown>;

function isPlainObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Flattens {a:{b:'x'}} to ['a.b', ...] with empty-string values marked. */
function flattenKeys(node: Json, prefix = ''): Map<string, boolean> {
  const keys = new Map<string, boolean>();
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      for (const [childKey, childEmpty] of flattenKeys(value, path)) {
        keys.set(childKey, childEmpty);
      }
    } else {
      keys.set(path, value === '');
    }
  }
  return keys;
}

function readNamespace(locale: string, fileName: string): Json {
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

const flags = parseFlags(process.argv.slice(2));
const locales = readdirSync(MESSAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== DEFAULT_LOCALE)
  .map((entry) => entry.name)
  .sort();

const enNamespaces = listNamespaces(DEFAULT_LOCALE);
let strictFailures = 0;

console.log(`i18n parity — comparing ${locales.join(', ') || '(no locales)'} against en\n`);

for (const locale of locales) {
  const localeNamespaces = new Set(listNamespaces(locale));
  let localeMissing = 0;
  let localeTotal = 0;

  for (const namespaceFile of enNamespaces) {
    const namespace = namespaceFile.replace(/\.json$/, '');
    const enKeys = flattenKeys(readNamespace(DEFAULT_LOCALE, namespaceFile));
    localeTotal += enKeys.size;

    if (!localeNamespaces.has(namespaceFile)) {
      console.log(`  ${locale}/${namespace}: MISSING FILE (${enKeys.size} keys fall back)`);
      localeMissing += enKeys.size;
      strictFailures += 1;
      continue;
    }

    const localeKeys = flattenKeys(readNamespace(locale, namespaceFile));
    const missing = [...enKeys.keys()].filter((key) => !localeKeys.has(key));
    const empty = [...localeKeys.entries()]
      .filter(([key, isEmpty]) => isEmpty && enKeys.has(key))
      .map(([key]) => key);
    const extra = [...localeKeys.keys()].filter((key) => !enKeys.has(key));
    const translated = enKeys.size - missing.length - empty.length;
    localeMissing += missing.length + empty.length;

    const strictHere =
      flags.strict &&
      (flags.strictNamespaces.length === 0 || flags.strictNamespaces.includes(namespace));
    const problems = missing.length + empty.length + extra.length;
    if (strictHere && problems > 0) strictFailures += 1;

    const pct = enKeys.size === 0 ? 100 : Math.round((translated / enKeys.size) * 100);
    console.log(
      `  ${locale}/${namespace}: ${translated}/${enKeys.size} translated (${pct}%)` +
        (missing.length ? ` — ${missing.length} missing` : '') +
        (empty.length ? ` — ${empty.length} empty` : '') +
        (extra.length ? ` — ${extra.length} EXTRA` : ''),
    );
    for (const key of [...missing.slice(0, 5), ...empty.slice(0, 5)]) {
      console.log(`      · ${key}`);
    }
    if (missing.length > 5) console.log(`      · … ${missing.length - 5} more`);
    for (const key of extra) console.log(`      · extra: ${key}`);
  }

  const done = localeTotal - localeMissing;
  const pct = localeTotal === 0 ? 100 : Math.round((done / localeTotal) * 100);
  console.log(`\n  ${locale} TOTAL: ${done}/${localeTotal} (${pct}%)\n`);

  const extraNamespaces = [...localeNamespaces].filter((file) => !enNamespaces.includes(file));
  for (const file of extraNamespaces) {
    console.log(`  ${locale}/${file}: EXTRA FILE (no en counterpart)`);
    strictFailures += 1;
  }
}

if (flags.strict && strictFailures > 0) {
  console.error(`❌  i18n parity failed for ${strictFailures} namespace(s)`);
  process.exit(1);
}
console.log('✅  i18n parity report complete');
