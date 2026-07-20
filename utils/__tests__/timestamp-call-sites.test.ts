import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.[cm]?[jt]sx?$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
  });
}

describe('timestamp rendering call sites', () => {
  it('routes production UI through the hydration-safe formatter', () => {
    const root = process.cwd();
    const files = ['app', 'components', 'hooks'].flatMap((directory) =>
      sourceFiles(join(root, directory)),
    );
    const allowed = join(root, 'components/common/HydrationSafeDateTime.tsx');
    const offenders = files
      .filter((path) => path !== allowed)
      .filter((path) => readFileSync(path, 'utf8').includes('convertTimestampToDateTime'))
      .map((path) => relative(root, path));

    expect(offenders).toEqual([]);
  });
});
