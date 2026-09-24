import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Design-token ratchet (docs/design-system.md → "Retired patterns").
 *
 * Each pattern below bypasses a token: an opacity-dimmed text colour instead
 * of a text tier, a sub-12px arbitrary size instead of the type scale, a
 * white-alpha fill or border instead of the surface ladder, a focus reset
 * that replaces the shared outline, or a bold display face. Call sites are
 * migrating; the counts may only go down. When a change removes some, lower
 * the number here in the same change. When a change adds one, use the token
 * the pattern names instead.
 */

const ROOT = resolve(__dirname, '..', '..');
const SCANNED = ['app', 'components'];

function sourceFiles(directory: string, out: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, out);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(path);
  }
  return out;
}

const files = SCANNED.flatMap((directory) => sourceFiles(resolve(ROOT, directory))).map((path) => ({
  path: relative(ROOT, path),
  text: readFileSync(path, 'utf8'),
}));

interface RetiredPattern {
  /** What to write instead. */
  use: string;
  pattern: RegExp;
  /** Occurrences allowed today; lower it as call sites migrate. */
  baseline: number;
}

const RETIRED: Record<string, RetiredPattern> = {
  'dimmed text colour': {
    use: 'text-subtle (or text-muted-foreground at full strength)',
    // Opacity 60% or less on a text colour; disabled states are exempt
    // (WCAG exempts inactive controls).
    pattern:
      /(?<!disabled:)(?<![\w-])text-(?:muted-foreground|white)\/(?:[0-5]?\d|60|\[0?\.[0-6]\d*\])(?![\w.])/g,
    baseline: 149,
  },
  'text below the 12px floor': {
    use: 'type-caption (12px) or type-label (13px)',
    pattern: /(?<![\w-])text-\[(?:[5-9]|1[01])(?:\.\d+)?px\]/g,
    baseline: 179,
  },
  'white-alpha surface or border': {
    use: 'bg-surface-sunken / bg-surface / bg-surface-raised, border-rule / border-rule-faint',
    pattern: /(?<![\w-])(?:bg|border(?:-[trblxy])?)-white\/(?:\[[\d.]+\]|\d+)/g,
    baseline: 650,
  },
  'focus reset that replaces the shared outline': {
    use: 'the global :focus-visible outline (styles/focus-ring.css), focus-ring-inset or focus-ring-within',
    pattern: /focus-visible:outline-none/g,
    baseline: 22,
  },
  'bold display face': {
    use: 'type-heading-3 / type-title (Inter 600) below 24px, a display tier above',
    pattern:
      /font-display(?=[^'"`]*\bfont-(?:bold|extrabold|black)\b)|\bfont-(?:bold|extrabold|black)\b(?=[^'"`]*\bfont-display\b)/g,
    baseline: 50,
  },
};

function count(pattern: RegExp): { total: number; byFile: Record<string, number> } {
  const byFile: Record<string, number> = {};
  let total = 0;
  for (const file of files) {
    const matches = file.text.match(pattern)?.length ?? 0;
    if (matches) {
      byFile[file.path] = matches;
      total += matches;
    }
  }
  return { total, byFile };
}

describe('retired design-token patterns', () => {
  it('scans the component sources', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it.each(Object.entries(RETIRED))(
    'does not add new uses of %s',
    (name, { use, pattern, baseline }) => {
      const { total, byFile } = count(pattern);
      if (total > baseline) {
        throw new Error(
          `${total} uses of ${name} (allowed: ${baseline}). Use ${use} instead.\n` +
            JSON.stringify(byFile, null, 2),
        );
      }
      expect(total).toBeLessThanOrEqual(baseline);
    },
  );
});
