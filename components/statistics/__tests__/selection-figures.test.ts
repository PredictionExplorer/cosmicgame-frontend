import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Stellar Selection figures are computed in one place (lib/selectionStanding.ts)
 * and shown as a linear share of the cycle's gestures. Compounding that share
 * into a chance of "at least one" selection (1 - ((N - k) / N)^m) reads as
 * lottery odds that climb toward 100% with every paid entry, so no new file
 * may do it. The files listed below still do and are migrating; the lists
 * may only shrink.
 */

const ROOT = process.cwd();
const SCANNED = ['app', 'components', 'hooks', 'lib', 'utils'];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' || entry.name === 'node_modules' ? [] : sourceFiles(path);
    }
    return /\.[jt]sx?$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
  });
}

const files = SCANNED.flatMap((dir) => sourceFiles(join(ROOT, dir))).map((path) => ({
  path: relative(ROOT, path),
  text: readFileSync(path, 'utf8'),
}));

/** `1 - Math.pow((total - mine) / total, draws)`: the complement of missing every draw. */
const COMPOUNDED_ODDS = /1\s*-\s*Math\.pow\(\s*\(\s*[\w.]+\s*-\s*[\w.]+\s*\)\s*\/\s*[\w.]+/;

/** Files that still compound the share; remove an entry when its file moves to the share. */
const COMPOUNDING_BASELINE: readonly string[] = [
  'components/tables/StellarSelectionHolderTable.tsx',
  'lib/selectionStanding.ts',
];

/** Files that still read the deprecated compounded standing. */
const STANDING_CONSUMER_BASELINE: readonly string[] = [];

describe('Stellar Selection figures', () => {
  it('scans the sources', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('compounds no selection share outside the known files', () => {
    const offenders = files
      .filter((file) => COMPOUNDED_ODDS.test(file.text))
      .map((file) => file.path)
      .filter((path) => !COMPOUNDING_BASELINE.includes(path));
    expect(offenders).toEqual([]);
  });

  it('adds no reader of the compounded standing', () => {
    const readers = files
      .filter((file) => file.path !== 'lib/selectionStanding.ts')
      .filter((file) => /\bgetSelectionStanding\b/.test(file.text))
      .map((file) => file.path)
      .filter((path) => !STANDING_CONSUMER_BASELINE.includes(path));
    expect(readers).toEqual([]);
  });

  it('keeps the baselines pointing at files that still need them', () => {
    const stale = [
      ...COMPOUNDING_BASELINE.filter(
        (path) => !files.some((file) => file.path === path && COMPOUNDED_ODDS.test(file.text)),
      ),
      ...STANDING_CONSUMER_BASELINE.filter(
        (path) =>
          !files.some((file) => file.path === path && /\bgetSelectionStanding\b/.test(file.text)),
      ),
    ];
    expect(stale).toEqual([]);
  });

  it('computes the profile share linearly', () => {
    const view = files.find((file) => file.path === 'components/UserStatisticsView.tsx');
    expect(view?.text).toMatch(/getSelectionShare/);
    expect(view?.text).not.toMatch(/Math\.pow/);
  });
});
