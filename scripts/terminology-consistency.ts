#!/usr/bin/env tsx
/* eslint-disable no-console -- command-line quality gate */

import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';

import { TRANSLATED_LOCALES } from '../i18n/routing';

import {
  TERMINOLOGY_PACKS,
  scanTerminology,
  validateTerminologyPacks,
  type TerminologyHit,
} from './terminology-consistency-core';

const ROOT = resolve(process.cwd());
const MESSAGES_ROOT = join(ROOT, 'messages');
const CONTENT_ROOT = join(ROOT, 'content');
const CONTENT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json']);

interface ScannableText {
  location: string;
  text: string;
}

function walkFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

/**
 * Per-locale content modules follow two naming conventions:
 * `text.<locale>.ts` / `TermsContent.<locale>.ts` (structure/text split) and
 * bare `<locale>.ts` (small areas such as content/about).
 */
function isLocaleContentFile(path: string, locale: string): boolean {
  if (!CONTENT_EXTENSIONS.has(extname(path))) return false;
  const name = basename(path);
  return (
    new RegExp(`^${locale}(?:[.-]|$)`, 'i').test(name) ||
    new RegExp(`\\.${locale}(?:[.-]|$)`, 'i').test(name)
  );
}

function flattenJsonStrings(value: unknown, prefix = ''): ScannableText[] {
  if (typeof value === 'string') {
    return [{ location: prefix || '(root)', text: value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenJsonStrings(item, `${prefix}[${index}]`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenJsonStrings(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

function reportHit(file: string, location: string, hit: TerminologyHit): void {
  const suffix = location ? `:${location}` : `:${hit.line}`;
  console.error(
    `\u274c  ${file}${suffix}  "${hit.variant}" drifts from ${hit.concept}; use "${hit.canonical}"`,
  );
  if (hit.excerpt) console.error(`    ${hit.excerpt}`);
}

const packErrors = validateTerminologyPacks();
if (packErrors.length > 0) {
  for (const error of packErrors) console.error(`\u274c  terminology rule error: ${error}`);
  process.exit(1);
}

let failureCount = 0;
let valueCount = 0;
const contentFiles = walkFiles(CONTENT_ROOT);

console.log('\ud83d\udcd8  Terminology consistency');

for (const locale of TRANSLATED_LOCALES) {
  const pack = TERMINOLOGY_PACKS[locale];
  const messageFiles = walkFiles(join(MESSAGES_ROOT, locale))
    .filter((path) => extname(path) === '.json')
    .sort();
  const localeContentFiles = contentFiles
    .filter((path) => isLocaleContentFile(path, locale))
    .sort();

  console.log(
    `   ${locale}: ${messageFiles.length} message catalogs, ${localeContentFiles.length} content modules (${pack.glossary})`,
  );

  for (const path of messageFiles) {
    const file = relative(ROOT, path);
    const raw = readFileSync(path, 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error(`\u274c  ${file} is not valid JSON: ${String(error)}`);
      failureCount += 1;
      continue;
    }

    for (const value of flattenJsonStrings(parsed)) {
      valueCount += 1;
      for (const hit of scanTerminology(value.text, pack)) {
        reportHit(file, value.location, hit);
        failureCount += 1;
      }
    }
  }

  for (const path of localeContentFiles) {
    const file = relative(ROOT, path);
    const source = readFileSync(path, 'utf8');
    valueCount += 1;
    for (const hit of scanTerminology(source, pack)) {
      reportHit(file, '', hit);
      failureCount += 1;
    }
  }
}

console.log('');

if (failureCount > 0) {
  console.error(
    `\n\u274c  terminology consistency failed with ${failureCount} drift occurrence(s)`,
  );
  process.exit(1);
}

console.log(
  `\u2705  terminology consistency passed \u2014 ${valueCount} catalog values/modules checked`,
);
