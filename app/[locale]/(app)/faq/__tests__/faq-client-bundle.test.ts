import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * The FAQ page reads the reader's locale's content on the server and hands it
 * to the client as a prop. `@/content/faq` builds all eight locales' FAQs at
 * import, so a runtime import of it from a client module would ship every
 * locale's text (about 300 KB) with each visit. Client code imports the
 * copy-free leaf modules (`@/content/faq/lookup`, `@/content/faq/types`)
 * instead; a type-only import of the barrel is erased and allowed.
 */
const REPO_ROOT = join(__dirname, '..', '..', '..', '..', '..');
const FAQ_ROUTE = join(REPO_ROOT, 'app/[locale]/(app)/faq');
/** The route's server modules, which may read the content. */
const SERVER_MODULES = new Set(['page.tsx', 'opengraph-image.tsx']);
/** A runtime import of the barrel or of a locale's text module. */
const COPY_IMPORT =
  /^import\s+(?!type\b)[^;]*?from\s+['"]@\/content\/faq(?:\/index|\/text\.[\w-]+)?['"]/gm;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !SERVER_MODULES.has(name) ? [path] : [];
  });
}

describe('FAQ client bundle', () => {
  const files = sourceFiles(FAQ_ROUTE);

  it('finds the client modules', () => {
    expect(files.map((file) => relative(FAQ_ROUTE, file))).toEqual(
      expect.arrayContaining(['FAQPage.tsx', 'components/PopularQuestions.tsx']),
    );
  });

  it('imports no locale copy from a client module', () => {
    const offenders = files
      .filter((file) => {
        COPY_IMPORT.lastIndex = 0;
        return COPY_IMPORT.test(readFileSync(file, 'utf8'));
      })
      .map((file) => relative(REPO_ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('keeps the lookup module free of copy', () => {
    const lookup = readFileSync(join(REPO_ROOT, 'content/faq/lookup.ts'), 'utf8');
    const imports = [...lookup.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);
    expect(imports).toEqual(['./types']);
  });
});
