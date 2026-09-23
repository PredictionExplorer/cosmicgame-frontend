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

/**
 * Formatters whose output depends on the process time zone. Called during
 * render they print the server's zone in the HTML and the reader's after
 * hydration, so UI reaches them only through `<DateTime>`, which renders UTC
 * until hydration and the local zone afterwards.
 */
const ZONE_DEPENDENT_FORMATTER =
  /\b(?:convertTimestampToDateTime|convertTimestampToServerDateTime|formatDateTime|formatDateTimeTitle)\b/;

describe('timestamp rendering call sites', () => {
  it('routes production UI through the hydration-safe <DateTime>', () => {
    const root = process.cwd();
    const files = ['app', 'components', 'hooks'].flatMap((directory) =>
      sourceFiles(join(root, directory)),
    );
    const allowed = join(root, 'components/ui/date-time.tsx');
    const offenders = files
      .filter((path) => path !== allowed)
      .filter((path) => ZONE_DEPENDENT_FORMATTER.test(readFileSync(path, 'utf8')))
      .map((path) => relative(root, path));

    expect(offenders).toEqual([]);
  });
});
