#!/usr/bin/env node
/**
 * Cosmic Signature lexicon scanner.
 *
 * Scans landing + content files for regulator-risky vocabulary per
 * /marketing/cosmic-lexicon.md. Fails with exit code 1 on any match.
 *
 * Allow-list pragmas:
 *   // lexicon-allow-start: <reason>
 *   ...
 *   // lexicon-allow-end
 *
 * The only legitimate use is FAQ "deny" copy that must literally say
 * "Is this a lottery?" / "No, this is not an investment." per the lexicon.
 * All other uses must be replaced with the cosmic-primary term.
 *
 * NOTE: "game" and "play" are intentionally excluded from BANNED per
 * product direction (user opted for casual usage).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

const SCAN_DIRS = ['content', 'components/landing-v2', 'components/three', 'app/landing-site'];

const INCLUDE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);

const BANNED = [
  'bid',
  'bids',
  'bidding',
  'bidder',
  'bidders',
  'prize',
  'prizes',
  'raffle',
  'raffles',
  'winner',
  'winners',
  'gambling',
  'gamble',
  'lottery',
  'lotteries',
  'bet',
  'bets',
  'wager',
  'wagers',
  'odds',
  'investor',
  'investors',
  'investment',
  'investments',
  'profit',
  'profits',
  'ROI',
  'dividend',
  'dividends',
  'tax-deductible',
  'house edge',
  'degen',
  'moon',
  'lambo',
  'yield',
  'staker',
  'stakers',
  'staking',
  'charity',
  'donate',
  'donation',
  'donations',
  'donor',
  'Dutch auction',
  'cash out',
];

const ESCAPED = BANNED.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const PATTERN = new RegExp(`\\b(${ESCAPED.join('|')})\\b`, 'gi');

let failed = false;

const EXCLUDE_DIRS = new Set(['__tests__', '__mocks__', 'node_modules']);

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
      scan(path);
    }
  }
}

function scan(path) {
  const content = readFileSync(path, 'utf8');
  const rel = relative(ROOT, path);
  const lines = content.split('\n');

  let inAllowBlock = false;

  lines.forEach((line, idx) => {
    if (/\/\/\s*lexicon-allow-start/i.test(line)) {
      inAllowBlock = true;
      return;
    }
    if (/\/\/\s*lexicon-allow-end/i.test(line)) {
      inAllowBlock = false;
      return;
    }
    if (inAllowBlock) return;

    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    const stringLiterals = line.match(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g);
    if (!stringLiterals) return;

    for (const literal of stringLiterals) {
      const matches = literal.match(PATTERN);
      if (matches) {
        for (const m of matches) {
          console.error(`\u274c  ${rel}:${idx + 1}  banned term: "${m}" in ${literal}`);
          failed = true;
        }
      }
    }
  });
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
