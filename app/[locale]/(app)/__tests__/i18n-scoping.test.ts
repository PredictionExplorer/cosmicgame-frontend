import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { NAMESPACES } from '@/i18n/request';
import { APP_CHROME_NAMESPACES } from '@/lib/i18n/clientMessages';

/**
 * i18n scoping contract.
 *
 * The root layouts serialize only chrome namespaces into the client
 * provider; every page declares the rest via <PageMessages>. A page that
 * under-declares would render missing-message errors at runtime, and one
 * that stops declaring would silently regress to broken copy. This walker
 * statically computes the namespaces each page's component tree can reach
 * (following static AND dynamic imports) and requires the declaration to
 * cover them.
 *
 * Over-approximation is deliberate: server components' useTranslations
 * calls are counted too, which at worst serializes a few unused namespaces
 * for a page — never a missing one.
 */

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const APP_GROUP_ROOT = resolve(REPO_ROOT, 'app/[locale]/(app)');

const RESOLVE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '/index.ts',
  '/index.tsx',
  '/index.js',
] as const;

function extractImports(source: string): string[] {
  const out: string[] = [];
  const staticRe =
    /^\s*(?:import|export)\b[\s\S]*?from\s+['"]([^'"]+)['"];?$|^\s*import\s+['"]([^'"]+)['"];?$/gm;
  let match: RegExpExecArray | null;
  while ((match = staticRe.exec(source)) !== null) {
    const spec = match[1] ?? match[2];
    if (spec) out.push(spec);
  }
  const dynamicRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicRe.exec(source)) !== null) {
    if (match[1]) out.push(match[1]);
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
    return null;
  }
  if (/\.(tsx?|jsx?)$/.test(base) && existsSync(base)) return base;
  for (const ext of RESOLVE_EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function collectUsedNamespaces(entry: string): Set<string> {
  const visited = new Set<string>();
  const used = new Set<string>();

  function visit(file: string): void {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, 'utf-8');

    const usageRe = /useTranslations\(\s*['"]([a-zA-Z]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = usageRe.exec(source)) !== null) {
      if (match[1]) used.add(match[1]);
    }

    for (const spec of extractImports(source)) {
      if (/\.(css|scss|less|sass|json)$/.test(spec)) continue;
      const local = resolveLocal(file, spec);
      if (local) visit(local);
    }
  }

  visit(entry);
  return used;
}

function findScopedEntryFiles(dir: string, isRoot = true): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      out.push(...findScopedEntryFiles(full, false));
    } else if (entry.name === 'page.tsx') {
      out.push(full);
    } else if (entry.name === 'layout.tsx' && !isRoot) {
      // Nested segment layouts (e.g. statistics/layout.tsx) render OUTSIDE
      // every page's <PageMessages> boundary — client components they mount
      // only see the chrome catalog unless the layout declares its own
      // scope. The root group layout is excluded: it IS the chrome provider.
      out.push(full);
    }
  }
  return out;
}

/** Namespaces declared through <PageMessages namespaces={[...]}> in a page module. */
function readDeclaredNamespaces(pageFile: string): Set<string> {
  const source = readFileSync(pageFile, 'utf-8');
  const declared = new Set<string>();
  const blockMatch = source.match(/<PageMessages\s+namespaces=\{\[([\s\S]*?)\]\}/);
  if (!blockMatch?.[1]) return declared;
  for (const literal of blockMatch[1].matchAll(/['"]([a-zA-Z]+)['"]/g)) {
    if (literal[1]) declared.add(literal[1]);
  }
  return declared;
}

const chrome = new Set<string>(APP_CHROME_NAMESPACES);
const known = new Set<string>(NAMESPACES);
const pageFiles = findScopedEntryFiles(APP_GROUP_ROOT);

describe('app route group i18n scoping', () => {
  it('found the app pages and nested layouts (walker sanity)', () => {
    expect(pageFiles.length).toBeGreaterThan(30);
    expect(pageFiles.some((file) => file.endsWith('statistics/layout.tsx'))).toBe(true);
  });

  it.each(pageFiles.map((file) => [relative(APP_GROUP_ROOT, file), file] as const))(
    '%s declares every client namespace its tree uses',
    (_rel, file) => {
      const used = collectUsedNamespaces(file);
      const declared = readDeclaredNamespaces(file);
      const missing = [...used].filter(
        (namespace) => !chrome.has(namespace) && !declared.has(namespace),
      );
      expect(missing).toEqual([]);
    },
  );

  it.each(pageFiles.map((file) => [relative(APP_GROUP_ROOT, file), file] as const))(
    '%s declares only known namespaces',
    (_rel, file) => {
      const declared = readDeclaredNamespaces(file);
      const unknown = [...declared].filter((namespace) => !known.has(namespace));
      expect(unknown).toEqual([]);
    },
  );
});
