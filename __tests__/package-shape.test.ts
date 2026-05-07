import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const sourceDirs = ['app', 'components', 'services', 'hooks', 'lib', 'utils', 'contexts'];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const vercelImportPattern =
  /(?:from\s+['"]vercel['"]|import\s*\(\s*['"]vercel['"]\s*\)|require\s*\(\s*['"]vercel['"]\s*\))/;

function walkFiles(dir: string): string[] {
  const absDir = path.join(repoRoot, dir);
  const stat = statSync(absDir, { throwIfNoEntry: false });
  if (!stat?.isDirectory()) return [];

  return readdirSync(absDir).flatMap((entry) => {
    const absEntry = path.join(absDir, entry);
    const relEntry = path.relative(repoRoot, absEntry);
    const entryStat = statSync(absEntry);

    if (entryStat.isDirectory()) {
      return walkFiles(relEntry);
    }

    return sourceExtensions.has(path.extname(entry)) ? [relEntry] : [];
  });
}

describe('package shape', () => {
  it('keeps the Vercel CLI out of production dependencies', () => {
    expect(packageJson.dependencies).not.toHaveProperty('vercel');
    expect(packageJson.devDependencies).toHaveProperty('vercel');
  });

  it('does not import the Vercel CLI from runtime source', () => {
    const offenders = sourceDirs
      .flatMap(walkFiles)
      .filter((file) => vercelImportPattern.test(readFileSync(path.join(repoRoot, file), 'utf8')));

    expect(offenders).toEqual([]);
  });
});
