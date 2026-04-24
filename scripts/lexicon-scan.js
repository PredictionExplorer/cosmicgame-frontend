#!/usr/bin/env node
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
 *
 * NOTE: "game" and "play" are intentionally excluded from BANNED per
 * product direction (user opted for casual usage).
 */

'use strict';

const { readFileSync, readdirSync, statSync } = require('node:fs');
const { extname, join, relative, resolve } = require('node:path');

const { DEFAULT_BANNED_TERMS, buildBannedPattern, scanContent } = require('./lexicon-scan-core.js');

const ROOT = resolve(process.cwd());

const SCAN_DIRS = [
  'content',
  'components/landing-v2',
  'components/three',
  'app/landing-site',
  'hooks',
  'lib',
];

const INCLUDE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);
const EXCLUDE_DIRS = new Set(['__tests__', '__mocks__', 'node_modules']);

const PATTERN = buildBannedPattern(DEFAULT_BANNED_TERMS);

let failed = false;

function walk(dir) {
  const abs = join(ROOT, dir);
  let entries;
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
