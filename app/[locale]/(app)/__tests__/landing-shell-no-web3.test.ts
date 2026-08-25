import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * LandingShell contract enforcement.
 *
 * The root layout (app/layout.tsx) branches the provider tree by host:
 * - landing host  → <LandingShell>     (no Web3)
 * - app host      → <Providers>        (wagmi + RainbowKit + WalletConnect + ...)
 *
 * This test locks that contract so a future refactor cannot silently pull
 * wallet / smart-contract code into the marketing landing page's client
 * bundle.
 *
 * Approach: statically walk `import ... from '...'` lines starting at
 * `app/landing-shell.tsx`, follow every relative / @-aliased import into
 * repo source, and collect the set of *external* npm-package specifiers
 * the subtree reaches. We then assert that set is disjoint from a
 * banned list of Web3-shaped packages.
 *
 * Limitations (intentional — this is a guardrail, not a linter):
 *   - Static imports only. Dynamic `import()` is not followed; we trust
 *     authors not to dynamic-import a wallet SDK into the landing.
 *   - No re-export tracing through `export * from '...'`. The current
 *     graph doesn't use it; if a file later does, the walker still
 *     visits its imports because ES modules require an import to use a
 *     re-export downstream.
 *   - No handling of conditional package-exports fields. We reason about
 *     the top-level specifier only, which matches what Turbopack's
 *     client-bundle splitter sees.
 */

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');

const LANDING_SHELL = resolve(REPO_ROOT, 'app/[locale]/(landing)/landing-shell.tsx');
const APP_PROVIDERS = resolve(REPO_ROOT, 'app/[locale]/(app)/providers.tsx');

const BANNED_PACKAGES: ReadonlyArray<RegExp> = [
  /^wagmi(\/|$)/,
  /^viem(\/|$)/,
  /^@wagmi\//,
  /^@rainbow-me\//,
  /^@walletconnect\//,
  /^@coinbase\/wallet-sdk(\/|$)/,
  /^@metamask\/(sdk|providers)(\/|$)/,
  /^@tanstack\/react-query(\/|$)/,
  /^@tsparticles\//,
];

const RESOLVE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '/index.ts',
  '/index.tsx',
  '/index.js',
] as const;

function extractStaticImports(abs: string): string[] {
  const src = readFileSync(abs, 'utf-8');
  const out: string[] = [];
  // Match: `import ... from '…';`, `import '…';`, `export ... from '…';`.
  // Multiline imports and bare side-effect imports both covered.
  const re =
    /^\s*(?:import|export)\b[\s\S]*?from\s+['"]([^'"]+)['"];?$|^\s*import\s+['"]([^'"]+)['"];?$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const spec = m[1] ?? m[2];
    if (spec) out.push(spec);
  }
  return out;
}

function resolveLocal(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) {
    base = resolve(REPO_ROOT, spec.slice(2));
  } else if (spec.startsWith('.')) {
    base = resolve(dirname(fromFile), spec);
  } else {
    return null; // external package
  }
  // If the spec already ends in an extension, try it directly first.
  if (/\.(tsx?|jsx?)$/.test(base) && existsSync(base)) return base;
  for (const ext of RESOLVE_EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function walkImports(entry: string): Set<string> {
  const visited = new Set<string>();
  const externals = new Set<string>();

  function visit(file: string): void {
    if (visited.has(file)) return;
    visited.add(file);
    for (const spec of extractStaticImports(file)) {
      // Skip `.css` / style-only imports — they never introduce client JS.
      if (/\.(css|scss|less|sass)$/.test(spec)) continue;
      const local = resolveLocal(file, spec);
      if (local) {
        visit(local);
      } else {
        externals.add(spec);
      }
    }
  }

  visit(entry);
  return externals;
}

describe('LandingShell contract — no Web3 in landing bundle', () => {
  const landingExternals = [...walkImports(LANDING_SHELL)];

  it.each(BANNED_PACKAGES)('landing-shell transitive imports do not reach %s', (banned) => {
    const hits = landingExternals.filter((spec) => banned.test(spec));
    expect(hits).toEqual([]);
  });

  it('landing-shell transitive imports list is non-empty (sanity)', () => {
    // Prevents a regression where the walker silently returns nothing
    // (e.g., due to a file rename) and every ban trivially passes.
    expect(landingExternals.length).toBeGreaterThan(0);
  });

  it('positive control: app Providers tree DOES import wagmi', () => {
    // If wagmi ever leaves the app Providers bundle entirely, the ban
    // test above becomes vacuously true. This assertion fails loudly if
    // that happens so the test stays meaningful.
    const appExternals = [...walkImports(APP_PROVIDERS)];
    expect(appExternals.some((spec) => /^wagmi(\/|$)/.test(spec))).toBe(true);
  });
});

describe('Landing page contract — no schema/transport stack on the marketing host', () => {
  const LANDING_PAGE = resolve(REPO_ROOT, 'app/[locale]/(landing)/landing-site/page.tsx');

  it('landing-site page tree never reaches axios or zod', () => {
    // The landing countdown once imported the services/api barrel, which
    // pulled axios + the full zod schema module (~90 KB gzip) into the
    // marketing bundle for three display-only reads. It now uses zod-free
    // fetch helpers (components/landing-v2/landing-cycle-data.ts).
    const landingPageExternals = [...walkImports(LANDING_PAGE)];
    for (const banned of [/^axios(\/|$)/, /^zod(\/|$)/]) {
      const hits = landingPageExternals.filter((spec) => banned.test(spec));
      expect(hits).toEqual([]);
    }
  });

  it('landing-site page tree is non-empty (sanity)', () => {
    expect([...walkImports(LANDING_PAGE)].length).toBeGreaterThan(0);
  });
});

describe('Providers contract — RainbowKit stays behind the lazy wallet chunk', () => {
  const WALLET_CONNECTORS = resolve(REPO_ROOT, 'components/wallet/wallet-connectors.ts');

  it('app Providers tree never statically reaches the wallet modal stack', () => {
    // The wallet modal UI (RainbowKit + WalletConnect + Coinbase) is loaded
    // through dynamic import on connect intent — see WalletUiProvider. The
    // static walker does not follow dynamic imports, so a hit here means
    // someone reintroduced an eager import and re-added ~100 KB gzip to
    // every app page for every visitor.
    const appExternals = [...walkImports(APP_PROVIDERS)];
    const heavyWalletPackages = [/^@rainbow-me\//, /^@walletconnect\//, /^@coinbase\//];
    for (const banned of heavyWalletPackages) {
      const hits = appExternals.filter((spec) => banned.test(spec));
      expect(hits).toEqual([]);
    }
  });

  it('positive control: the lazy wallet module DOES import RainbowKit', () => {
    const walletExternals = [...walkImports(WALLET_CONNECTORS)];
    expect(walletExternals.some((spec) => /^@rainbow-me\/rainbowkit/.test(spec))).toBe(true);
  });
});
