#!/usr/bin/env tsx
/* eslint-disable no-console -- command-line quality gate */

import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';

import {
  scanTerminology,
  validateTerminologyRules,
  type TerminologyHit,
} from './terminology-consistency-core';

const ROOT = resolve(process.cwd());
const MESSAGE_ROOT = join(ROOT, 'messages', 'zh');
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

function isChineseContentFile(path: string): boolean {
  if (!CONTENT_EXTENSIONS.has(extname(path))) return false;
  const name = basename(path);
  return (
    /^zh(?:[.-]|$)/i.test(name) ||
    /\.zh(?:[.-]|$)/i.test(name) ||
    /(?:^|[.-])zh-hans(?:[.-]|$)/i.test(name)
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

const ruleErrors = validateTerminologyRules();
if (ruleErrors.length > 0) {
  for (const error of ruleErrors) console.error(`\u274c  terminology rule error: ${error}`);
  process.exit(1);
}

const messageFiles = walkFiles(MESSAGE_ROOT)
  .filter((path) => extname(path) === '.json')
  .sort();
const contentFiles = walkFiles(CONTENT_ROOT).filter(isChineseContentFile).sort();

let failureCount = 0;
let valueCount = 0;

console.log('\ud83d\udcd8  Simplified-Chinese terminology consistency');
console.log(
  `   scanning ${messageFiles.length} message catalogs and ${contentFiles.length} zh content modules`,
);
console.log('');

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
    const hits = scanTerminology(value.text);
    for (const hit of hits) {
      reportHit(file, value.location, hit);
      failureCount += 1;
    }
  }
}

for (const path of contentFiles) {
  const file = relative(ROOT, path);
  const source = readFileSync(path, 'utf8');
  valueCount += 1;
  for (const hit of scanTerminology(source)) {
    reportHit(file, '', hit);
    failureCount += 1;
  }
}

if (failureCount > 0) {
  console.error(
    `\n\u274c  terminology consistency failed with ${failureCount} drift occurrence(s)`,
  );
  process.exit(1);
}

console.log(
  `\u2705  terminology consistency passed \u2014 ${valueCount} catalog values/modules checked`,
);
