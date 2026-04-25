#!/usr/bin/env tsx
/**
 * Cosmic Signature lexicon scanner (CLI).
 *
 * Walks configured directories, runs each source file through the
 * lexicon-scan core, and exits non-zero on any hit. Used as a CI gate
 * (`yarn lexicon:scan`) and as a `pre-push` husky hook.
 *
 * Flags:
 *   --skip-tests         Skip `__tests__/` dirs and `*.test.*` files
 *                        (default: tests are included and enforced).
 *   --no-identifiers     Disable the identifier matcher (on by default).
 *   --no-jsx-text        Disable the JSX-text matcher (on by default).
 *   --warn-comments      Scan comments too; hits are printed as warnings
 *                        and do not fail the build.
 *
 * Allow pragmas (recognised by the core):
 *   // lexicon-allow-start: <reason>
 *   ...
 *   // lexicon-allow-end
 *   // lexicon-allow-abi            (single line, e.g. contract.write.mint)
 *   // lexicon-allow-backend-type   (single line, e.g. BidderAddr in wire shape)
 *
 * Legitimate uses: FAQ denial copy that must literally say "Is this a
 * lottery?" / "No, this is not an investment.", internal developer docs
 * explaining banned vocabulary, ABI method calls preserved per §G of the
 * lexicon, and sealed backend wire-format field names.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

import {
  DEFAULT_BANNED_STEMS,
  DEFAULT_BANNED_TERMS,
  buildBannedPattern,
  buildIdentifierPattern,
  scanComments,
  scanContent,
  scanIdentifiers,
  scanJsxTextNodes,
} from './lexicon-scan-core';

const ROOT = resolve(process.cwd());

const SCAN_DIRS: readonly string[] = [
  'app',
  'components',
  'content',
  'hooks',
  'lib',
  'utils',
  'services',
  'config',
  'contexts',
  'types',
  'scripts',
  'e2e',
  'marketing',
  'public',
  'pages',
];

const INCLUDE_EXTS: ReadonlySet<string> = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mdx',
  '.md',
]);
const EXCLUDE_DIRS_BASE: ReadonlySet<string> = new Set(['__mocks__', 'node_modules', '.next']);

interface CliFlags {
  skipTests: boolean;
  identifiers: boolean;
  jsxText: boolean;
  warnComments: boolean;
}

function parseFlags(argv: readonly string[]): CliFlags {
  return {
    skipTests: argv.includes('--skip-tests'),
    identifiers: !argv.includes('--no-identifiers'),
    jsxText: !argv.includes('--no-jsx-text'),
    warnComments: argv.includes('--warn-comments'),
  };
}

const flags = parseFlags(process.argv.slice(2));

const EXCLUDE_DIRS: ReadonlySet<string> = new Set(
  flags.skipTests ? [...EXCLUDE_DIRS_BASE, '__tests__'] : EXCLUDE_DIRS_BASE,
);

const STRING_PATTERN = buildBannedPattern(DEFAULT_BANNED_TERMS);
const IDENT_PATTERN = buildIdentifierPattern(DEFAULT_BANNED_STEMS);

interface PhaseCounts {
  strings: number;
  jsxText: number;
  identifiers: number;
  commentWarnings: number;
}

const counts: PhaseCounts = { strings: 0, jsxText: 0, identifiers: 0, commentWarnings: 0 };
let failed = false;

function isJsxFile(path: string): boolean {
  const e = extname(path);
  return e === '.tsx' || e === '.jsx' || e === '.mdx';
}

function isMarkdownFile(path: string): boolean {
  const e = extname(path);
  return e === '.md' || e === '.mdx';
}

function scanFile(absPath: string, relPath: string, content: string): void {
  // Markdown files are prose, not code. Only run the string-content matcher
  // (it treats the whole document as a long literal-free line sequence,
  // which is exactly what we want for prose). Skip identifier + JSX matchers.
  if (isMarkdownFile(absPath)) {
    const hits = scanContent(content, STRING_PATTERN);
    for (const h of hits) {
      console.error(`\u274c  ${relPath}:${h.line}  banned term: "${h.term}" in ${h.literal}`);
      counts.strings += 1;
      failed = true;
    }
    if (flags.warnComments) {
      for (const h of scanComments(content, STRING_PATTERN)) {
        console.warn(
          `\u26a0\ufe0f   ${relPath}:${h.line}  comment term: "${h.term}" in ${h.literal}`,
        );
        counts.commentWarnings += 1;
      }
    }
    return;
  }

  for (const h of scanContent(content, STRING_PATTERN)) {
    console.error(`\u274c  ${relPath}:${h.line}  banned term: "${h.term}" in ${h.literal}`);
    counts.strings += 1;
    failed = true;
  }

  if (flags.jsxText && isJsxFile(absPath)) {
    for (const h of scanJsxTextNodes(content, STRING_PATTERN)) {
      console.error(`\u274c  ${relPath}:${h.line}  banned JSX text: "${h.term}" in "${h.literal}"`);
      counts.jsxText += 1;
      failed = true;
    }
  }

  if (flags.identifiers) {
    for (const h of scanIdentifiers(content, IDENT_PATTERN, { onlyDeclarations: true })) {
      console.error(
        `\u274c  ${relPath}:${h.line}  banned identifier: "${h.term}" — rename per marketing/cosmic-lexicon.md`,
      );
      counts.identifiers += 1;
      failed = true;
    }
  }

  if (flags.warnComments) {
    for (const h of scanComments(content, STRING_PATTERN)) {
      console.warn(
        `\u26a0\ufe0f   ${relPath}:${h.line}  comment term: "${h.term}" in ${h.literal}`,
      );
      counts.commentWarnings += 1;
    }
  }
}

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
      if (flags.skipTests && /\.test\.(ts|tsx|js|jsx)$/.test(entry)) continue;
      const content = readFileSync(path, 'utf8');
      const rel = relative(ROOT, path);
      scanFile(path, rel, content);
    }
  }
}

/* eslint-disable no-console -- CLI banner output. This file is a Node
   script run via `yarn lexicon:scan` and never ships to the browser. */
console.log('\u2728  Cosmic Signature lexicon scanner');
console.log('   scanning:', SCAN_DIRS.join(', '));
const phases: string[] = ['strings'];
if (flags.jsxText) phases.push('jsx-text');
if (flags.identifiers) phases.push('identifiers');
if (flags.warnComments) phases.push('comments(warn)');
console.log('   phases:  ', phases.join(', '));
if (flags.skipTests) console.log('   note:    tests skipped');
console.log('');

for (const dir of SCAN_DIRS) walk(dir);

if (failed) {
  console.error(
    `\n\u274c  lexicon scan failed \u2014 strings:${counts.strings} jsx:${counts.jsxText} identifiers:${counts.identifiers}`,
  );
  console.error('   Replace banned terms per marketing/cosmic-lexicon.md');
  process.exit(1);
}

if (flags.warnComments && counts.commentWarnings > 0) {
  console.log(
    `\u26a0\ufe0f   ${counts.commentWarnings} comment warnings (non-blocking). Clean up when convenient.`,
  );
}
console.log('\u2705  lexicon scan passed \u2014 no banned terms found');
