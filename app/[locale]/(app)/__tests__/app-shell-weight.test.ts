import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

/**
 * What every app page downloads before its own code: the provider tree and
 * the header and footer inside it (app/[locale]/(app)/providers.tsx).
 *
 * The legal pages, the FAQ and the site map once shipped about 540 KB of
 * gzipped JavaScript, as much as the dApp itself: the API client with its
 * schemas, every contract ABI, the chain-event polling, the account menu and
 * the command palette all sat in the shell. They now load when a page needs
 * them (next/dynamic or a dynamic `import()`), and this test keeps them out
 * of the shell's static import graph. Dynamic imports are deliberately not
 * followed: they are exactly how the shell defers these modules.
 */

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const APP_PROVIDERS = resolve(REPO_ROOT, 'app/[locale]/(app)/providers.tsx');

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '/index.ts', '/index.tsx'] as const;

/** Static value imports and re-exports; `import type` lines bring no code. */
function extractStaticImports(abs: string): string[] {
  const src = readFileSync(abs, 'utf-8');
  const out: string[] = [];
  const re =
    /^\s*(import|export)\b(\s+type\b)?[\s\S]*?from\s+['"]([^'"]+)['"];?$|^\s*import\s+['"]([^'"]+)['"];?$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m[2]) continue;
    const spec = m[3] ?? m[4];
    if (spec) out.push(spec);
  }
  return out;
}

function resolveLocal(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = resolve(REPO_ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
  else return null;
  if (/\.(tsx?|jsx?)$/.test(base) && existsSync(base)) return base;
  for (const ext of RESOLVE_EXTENSIONS) {
    if (existsSync(base + ext)) return base + ext;
  }
  return null;
}

function walk(entry: string): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const visit = (file: string) => {
    if (files.has(file)) return;
    files.add(file);
    for (const spec of extractStaticImports(file)) {
      if (/\.(css|json)$/.test(spec)) continue;
      const local = resolveLocal(file, spec);
      if (local) visit(local);
      else packages.add(spec);
    }
  };
  visit(entry);
  return { files, packages };
}

const shell = walk(APP_PROVIDERS);
const shellFiles = [...shell.files].map((file) => relative(REPO_ROOT, file));

describe('app shell weight', () => {
  it.each([
    // The API client, its schemas and the query hooks.
    'services/api/index.ts',
    'hooks/useApiQuery.ts',
    // Every contract ABI, the contract hooks and the chain-event polling.
    'contracts/abis.ts',
    'contracts/generated.ts',
    'lib/chainEvents.ts',
    'hooks/useCosmicSignatureContract.ts',
    // The wallet's chain switching (the connected wallet's chip and menu).
    'lib/chainGuard.ts',
    // The connected wallet's reads and account menu.
    'contexts/AnchoredTokenContext.tsx',
    'contexts/ApiDataContext.tsx',
    'components/layout/useAccountSummary.ts',
    'components/common/ConnectWalletButton.tsx',
    // The command palette's list and search.
    'components/layout/CommandPalette.tsx',
    'lib/siteSearch.ts',
  ])('loads %s on demand, never with the shell', (file) => {
    expect(shellFiles).not.toContain(file);
  });

  it.each([/^zod(\/|$)/, /^axios(\/|$)/, /^@rainbow-me\//])(
    'keeps %s out of the shell',
    (pattern) => {
      expect([...shell.packages].filter((spec) => pattern.test(spec))).toEqual([]);
    },
  );

  it('still ships the wallet connection itself (positive control)', () => {
    expect(shell.packages.has('wagmi')).toBe(true);
    expect(shellFiles).toContain('components/layout/Header.tsx');
  });
});
