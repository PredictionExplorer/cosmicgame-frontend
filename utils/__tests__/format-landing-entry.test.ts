import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * The landing host ships a small bundle (`npm run bundle:budget`). The
 * `@/utils/format` entry re-exports the whole formatting layer, and `@/utils`
 * re-exports that, so landing code imports leaf modules instead (formatId
 * from `@/utils/format/ids`). This keeps a barrel import from creeping back.
 */
const REPO_ROOT = join(__dirname, '..', '..');
const LANDING_ROOTS = ['app/[locale]/(landing)', 'components/landing-v2'];
const BARREL_IMPORT = /from\s+['"]@\/utils(?:\/format|\/index)?['"]/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('landing imports of the formatting layer', () => {
  const files = LANDING_ROOTS.flatMap((root) => sourceFiles(join(REPO_ROOT, root)));

  it('finds the landing sources', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('never imports the @/utils or @/utils/format barrel', () => {
    const offenders = files
      .filter((file) => BARREL_IMPORT.test(readFileSync(file, 'utf8')))
      .map((file) => relative(REPO_ROOT, file));
    expect(offenders).toEqual([]);
  });
});
