import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * Embed shell contract: an embed renders without the dApp's providers (no
 * WagmiProvider, no wallet UI), so nothing it imports may reach the wallet
 * stack. A wagmi hook under an embed would throw at render for want of its
 * provider, and the stack would ship to every third-party iframe.
 *
 * Walks static and dynamic imports from the embed layout, its boundaries
 * and every embed page through repo source, collecting the npm packages
 * they reach. viem's pure utilities (unit formatting, checksums) are fine.
 */

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const EMBED_ROOT = resolve(REPO_ROOT, 'app/[locale]/(embed)');

const WALLET_STACK: readonly RegExp[] = [
  /^wagmi(\/|$)/,
  /^@wagmi\//,
  /^@rainbow-me\//,
  /^@walletconnect\//,
  /^@coinbase\/wallet-sdk(\/|$)/,
  /^@metamask\/(sdk|providers)(\/|$)/,
];

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];

function importsOf(file: string): string[] {
  const source = readFileSync(file, 'utf-8');
  const specs: string[] = [];
  const staticRe =
    /^\s*(?:import|export)\b[\s\S]*?from\s+['"]([^'"]+)['"];?$|^\s*import\s+['"]([^'"]+)['"];?$/gm;
  for (const match of source.matchAll(staticRe)) {
    const spec = match[1] ?? match[2];
    if (spec) specs.push(spec);
  }
  for (const match of source.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    if (match[1]) specs.push(match[1]);
  }
  return specs;
}

function resolveLocal(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = resolve(REPO_ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
  else return null;
  if (/\.(tsx?|jsx?)$/.test(base) && existsSync(base)) return base;
  const candidate = RESOLVE_EXTENSIONS.map((ext) => base + ext).find((path) => existsSync(path));
  return candidate ?? null;
}

/**
 * The repo files reachable from `entry`, and every external package they
 * import with the first file importing it.
 */
function walk(entry: string): { files: Set<string>; externals: Map<string, string> } {
  const files = new Set<string>();
  const externals = new Map<string, string>();
  const visit = (file: string) => {
    if (files.has(file)) return;
    files.add(file);
    for (const spec of importsOf(file)) {
      if (/\.(css|json)$/.test(spec)) continue;
      const local = resolveLocal(file, spec);
      if (local) visit(local);
      else if (!externals.has(spec)) externals.set(spec, relative(REPO_ROOT, file));
    }
  };
  visit(entry);
  return { files, externals };
}

function embedPages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : embedPages(path);
    return entry.name === 'page.tsx' ? [path] : [];
  });
}

const entries = [
  ...['layout.tsx', 'error.tsx', 'not-found.tsx'].map((name) => join(EMBED_ROOT, name)),
  ...embedPages(EMBED_ROOT),
];

describe('embed shell contract: no wallet stack', () => {
  it('walks the layout, its boundaries and the endurance embed', () => {
    expect(entries.some((file) => file.endsWith('embed/endurance/[round]/page.tsx'))).toBe(true);
  });

  it.each(entries.map((file) => [relative(EMBED_ROOT, file), file] as const))(
    '%s reaches no wallet package',
    (_rel, file) => {
      const reached = [...walk(file).externals]
        .filter(([spec]) => WALLET_STACK.some((banned) => banned.test(spec)))
        .map(([spec, from]) => `${spec} (from ${from})`);
      expect(reached).toEqual([]);
    },
  );

  it('keeps the dApp providers out of the embed layout', () => {
    const { files } = walk(join(EMBED_ROOT, 'layout.tsx'));
    expect(files.has(resolve(REPO_ROOT, 'app/[locale]/(app)/providers.tsx'))).toBe(false);
    expect(files.has(join(EMBED_ROOT, 'EmbedProviders.tsx'))).toBe(true);
  });
});
