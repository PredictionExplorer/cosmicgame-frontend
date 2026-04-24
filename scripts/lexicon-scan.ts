#!/usr/bin/env tsx
/**
 * Cosmic Signature lexicon scanner (CLI).
 *
 * Walks configured directories, runs each source file through the
 * lexicon-scan core, and exits non-zero on any hit. Used as a CI gate
 * (`yarn lexicon:scan`) and as a `pre-push` husky hook.
 *
 * Allow-list pragmas (recognised by the core):
 *   // lexicon-allow-start: <reason>
 *   ...
 *   // lexicon-allow-end
 *
 * The only legitimate uses are FAQ "deny" copy that must literally say
 * "Is this a lottery?" / "No, this is not an investment." per the lexicon,
 * and internal developer-facing content that explains what terms are
 * banned and why.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

import { DEFAULT_BANNED_TERMS, buildBannedPattern, scanContent } from './lexicon-scan-core';

const ROOT = resolve(process.cwd());

const SCAN_DIRS: readonly string[] = ['app', 'components', 'content', 'hooks', 'lib', 'utils'];

const INCLUDE_EXTS: ReadonlySet<string> = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);
const EXCLUDE_DIRS: ReadonlySet<string> = new Set(['__tests__', '__mocks__', 'node_modules']);

const PATTERN = buildBannedPattern(DEFAULT_BANNED_TERMS);

let failed = false;

function walk(dir: string): void {
  const abs = join(ROOT, dir);
  let entries: string[];
  try {
    entries = readdirSync(abs);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const path = join(abs, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(join(dir, entry));
    } else if (INCLUDE_EXTS.has(extname(entry))) {
      if (/\.test\.(ts|tsx|js|jsx)$/.test(entry)) continue;
      const content = readFileSync(path, 'utf8');
      const hits = scanContent(content, PATTERN);
      for (const h of hits) {
        const rel = relative(ROOT, path);
        console.error(`\u274c  ${rel}:${h.line}  banned term: "${h.term}" in ${h.literal}`);
        failed = true;
      }
    }
  }
}

/* eslint-disable no-console -- CLI banner output. This file is a Node
   script run via `yarn lexicon:scan` and never ships to the browser. */
console.log('\u2728  Cosmic Signature lexicon scanner');
console.log('   scanning:', SCAN_DIRS.join(', '));
console.log('');

for (const dir of SCAN_DIRS) walk(dir);

if (failed) {
  console.error(
    '\n\u274c  lexicon scan failed \u2014 replace banned terms per /marketing/cosmic-lexicon.md',
  );
  process.exit(1);
}

console.log('\u2705  lexicon scan passed \u2014 no banned terms found');
