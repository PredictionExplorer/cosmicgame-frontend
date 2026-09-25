import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * Landing contract enforcement: no Web3 on cosmicsignature.com.
 *
 * The marketing route group (`app/[locale]/(landing)`) renders its own root
 * layout with the lightweight <LandingShell>, while the app group renders the
 * full <Providers> tree (wagmi + RainbowKit + WalletConnect + ...). This test
 * locks that split so a future refactor cannot silently pull wallet or
 * smart-contract code into the marketing host.
 *
 * Approach: statically walk `import ... from '...'` lines from every file the
 * landing group can render (each layout, page, template, error and not-found
 * file, the shell, and every 'use client' island in the landing component
 * trees), follow every relative / @-aliased import into repo source, and
 * collect the *external* npm-package specifiers each root reaches. Each set
 * must be disjoint from a banned list of Web3-shaped packages. The walk
 * includes server components on purpose: a server file that reaches a wallet
 * package is one 'use client' away from shipping it.
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

const LANDING_GROUP = resolve(REPO_ROOT, 'app/[locale]/(landing)');
const LANDING_SHELL = resolve(LANDING_GROUP, 'landing-shell.tsx');
const APP_PROVIDERS = resolve(REPO_ROOT, 'app/[locale]/(app)/providers.tsx');

/** Component trees only the landing group renders; each 'use client' file is a root. */
const LANDING_COMPONENT_TREES = [
  'components/landing-v2',
  'components/learn',
  'components/quiz',
  'components/reading',
  'components/white-paper',
].map((dir) => resolve(REPO_ROOT, dir));

/** Next.js route files that render UI (opengraph images are server-only handlers). */
const ROUTE_ENTRY = /^(layout|page|template|error|not-found|loading|default)\.tsx$/;

const BANNED_PACKAGES: ReadonlyArray<RegExp> = [
  /^wagmi(\/|$)/,
  /^viem(\/|$)/,
  /^@wagmi\//,
  /^@rainbow-me\//,
  /^@walletconnect\//,
  /^@coinbase\/wallet-sdk(\/|$)/,
  /^@metamask\/(sdk|providers)(\/|$)/,
  /^@tanstack\/react-query(\/|$)/,
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
  return new Set(walkImportChains(entry).keys());
}

/**
 * Every external specifier reachable from `entry`, each with the first import
 * chain that reaches it (entry first), so a failure names the path to fix.
 */
function walkImportChains(entry: string): Map<string, string[]> {
  const visited = new Set<string>();
  const externals = new Map<string, string[]>();

  function visit(file: string, chain: string[]): void {
    if (visited.has(file)) return;
    visited.add(file);
    const path = [...chain, relative(REPO_ROOT, file)];
    for (const spec of extractStaticImports(file)) {
      // Skip `.css` / style-only imports — they never introduce client JS.
      if (/\.(css|scss|less|sass)$/.test(spec)) continue;
      const local = resolveLocal(file, spec);
      if (local) {
        visit(local, path);
      } else if (!externals.has(spec)) {
        externals.set(spec, path);
      }
    }
  }

  visit(entry, []);
  return externals;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const isClientModule = (file: string): boolean =>
  /^\s*['"]use client['"]/.test(readFileSync(file, 'utf8'));

const fileName = (file: string): string => file.slice(file.lastIndexOf('/') + 1);

/** Every file the landing group can render: route entries, the shell, client islands. */
const LANDING_ROOTS: ReadonlyArray<string> = [
  ...new Set([
    LANDING_SHELL,
    ...sourceFiles(LANDING_GROUP).filter((file) => ROUTE_ENTRY.test(fileName(file))),
    ...sourceFiles(LANDING_GROUP).filter(isClientModule),
    ...LANDING_COMPONENT_TREES.flatMap(sourceFiles).filter(isClientModule),
  ]),
].sort();

const label = (file: string): string => relative(REPO_ROOT, file);

const bannedHits = (externals: Map<string, string[]>, banned: ReadonlyArray<RegExp>): string[] =>
  [...externals.entries()]
    .filter(([spec]) => banned.some((pattern) => pattern.test(spec)))
    .map(([spec, chain]) => `${spec} via ${chain.join(' -> ')}`);

describe('Landing contract — no Web3 anywhere the landing group renders', () => {
  it('walks the shell, every route entry and every client island', () => {
    expect(LANDING_ROOTS.map(label)).toEqual(
      expect.arrayContaining([
        'app/[locale]/(landing)/landing-shell.tsx',
        'app/[locale]/(landing)/layout.tsx',
        'app/[locale]/(landing)/landing-site/page.tsx',
        'app/[locale]/(landing)/about/page.tsx',
        'app/[locale]/(landing)/learn/[slug]/page.tsx',
        'app/[locale]/(landing)/quiz/[tier]/page.tsx',
        'app/[locale]/(landing)/white-paper/page.tsx',
        'components/landing-v2/ImprintedFigure.tsx',
        'components/quiz/QuizRunner.tsx',
      ]),
    );
  });

  describe.each(LANDING_ROOTS.map((root) => [label(root), root] as const))('%s', (_, root) => {
    const externals = walkImportChains(root);

    it('reaches no Web3 package', () => {
      expect(bannedHits(externals, BANNED_PACKAGES)).toEqual([]);
    });

    it('never reaches axios or zod', () => {
      // The landing countdown once imported the services/api barrel, which
      // pulled axios + the full zod schema module (~90 KB gzip) into the
      // marketing bundle for three display-only reads. It now uses zod-free
      // fetch helpers (components/landing-v2/landing-cycle-data.ts).
      expect(bannedHits(externals, [/^axios(\/|$)/, /^zod(\/|$)/])).toEqual([]);
    });
  });

  it.each(
    LANDING_ROOTS.filter((root) => !isClientModule(root) || root === LANDING_SHELL).map(label),
  )('%s has a non-empty import walk (sanity)', (root) => {
    // Prevents a regression where the walker silently returns nothing
    // (e.g., a broken resolver) and every ban trivially passes. Route
    // entries always import React, Next or next-intl; a client island may
    // be a leaf module, so it is not held to this.
    expect(walkImportChains(resolve(REPO_ROOT, root)).size).toBeGreaterThan(0);
  });

  it('positive control: app Providers tree DOES import wagmi', () => {
    // If wagmi ever leaves the app Providers bundle entirely, the ban
    // test above becomes vacuously true. This assertion fails loudly if
    // that happens so the test stays meaningful.
    const appExternals = [...walkImports(APP_PROVIDERS)];
    expect(appExternals.some((spec) => /^wagmi(\/|$)/.test(spec))).toBe(true);
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
