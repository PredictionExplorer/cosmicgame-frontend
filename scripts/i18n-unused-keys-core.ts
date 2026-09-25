/**
 * Message keys no code can reach (docs/i18n/README.md §7).
 *
 * Every English key is maintained and translated in all eight locales and
 * checked by the lexicon, terminology and numeric-claims gates, so a key the
 * UI no longer renders is cost with no reader. next-intl cannot tell us which
 * keys are used: a call site names a namespace in one place and a key in
 * another, and many keys are chosen at runtime (`t(\`metrics.${key}.label\`)`).
 *
 * The check is therefore deliberately coarse and never wrong in one
 * direction: a key counts as reachable when every segment of its path
 * (`status`, `metrics`, `ethGesture`) is spelled somewhere in the application
 * source, as an identifier or inside a string. A key with a segment that
 * appears nowhere cannot be addressed by any literal or template, so it is
 * dead. A key whose segments all appear somewhere may still be dead (common
 * words like `title` are everywhere); the check misses those rather than
 * flag a live key.
 *
 * The one family reached through segments no source file spells is listed
 * in `DYNAMIC_KEY_FAMILIES` with its reason.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { flattenMessages, type Messages } from './i18n-parity-core';

/** Directories whose code renders messages. Tests and fixtures are excluded below. */
export const SOURCE_DIRS = [
  'app',
  'components',
  'contexts',
  'hooks',
  'lib',
  'utils',
  'content',
  'config',
  'services',
  'i18n',
] as const;

/**
 * `namespace:key.prefix` families whose final segments come from data, not
 * code. Each needs a reason; keep the list short.
 */
export const DYNAMIC_KEY_FAMILIES: readonly string[] = [
  // Trait values are the token metadata's own words (`orbitalRibbons`,
  // `jade`), looked up as `values.${trait}.${value}` for whatever a token has.
  'traits:values.',
];

const SKIPPED_DIRECTORIES = new Set(['__tests__', '__mocks__', 'test-support', 'node_modules']);
const SOURCE_FILE = /\.(?:ts|tsx|js|jsx|mjs)$/;
const TEST_FILE = /\.(?:test|spec|stories)\.[jt]sx?$/;
/** Identifiers, and hyphenated words such as route slugs (`eth-contribution`). */
const TOKEN = /[A-Za-z_$][\w$]*(?:-[\w$]+)*/g;

function sourceFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return SKIPPED_DIRECTORIES.has(entry.name) ? [] : sourceFiles(path);
    return SOURCE_FILE.test(entry.name) && !TEST_FILE.test(entry.name) ? [path] : [];
  });
}

/** Every word the application source spells, hyphenated words both whole and split. */
export function sourceTokens(root: string, dirs: readonly string[] = SOURCE_DIRS): Set<string> {
  const tokens = new Set<string>();
  for (const dir of dirs) {
    for (const file of sourceFiles(join(root, dir))) {
      for (const [token] of readFileSync(file, 'utf8').matchAll(TOKEN)) {
        tokens.add(token);
        if (token.includes('-')) for (const part of token.split('-')) tokens.add(part);
      }
    }
  }
  return tokens;
}

/**
 * Keys of one source namespace that no code can reach: some segment of the
 * path is spelled nowhere in `tokens`. List indices (`items[2]`) are part of
 * their parent's key, not segments of their own.
 */
export function unreferencedKeys(
  namespace: string,
  messages: Messages,
  tokens: ReadonlySet<string>,
  families: readonly string[] = DYNAMIC_KEY_FAMILIES,
): string[] {
  const unreferenced: string[] = [];
  for (const key of flattenMessages(messages).keys()) {
    const path = key.replace(/\[\d+\]/g, '');
    if (families.some((family) => `${namespace}:${path}`.startsWith(family))) continue;
    if (path.split('.').some((segment) => !tokens.has(segment))) unreferenced.push(key);
  }
  return unreferenced;
}
