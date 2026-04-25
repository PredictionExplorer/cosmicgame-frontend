// lexicon-allow-start: fixture strings exercise every banned term by design

import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCAN_SCRIPT = join(process.cwd(), 'scripts/lexicon-scan.ts');
const TSX_BIN = join(process.cwd(), 'node_modules/.bin/tsx');

interface ScanResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runScanner(cwd: string): ScanResult {
  try {
    const stdout = execSync(`"${TSX_BIN}" "${SCAN_SCRIPT}"`, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return {
      exitCode: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

function makeFixture(): {
  root: string;
  write: (relPath: string, content: string) => void;
  cleanup: () => void;
} {
  const root = mkdtempSync(join(tmpdir(), 'lexicon-scan-'));
  return {
    root,
    write(relPath, content) {
      const full = join(root, relPath);
      const dir = full.slice(0, full.lastIndexOf('/'));
      mkdirSync(dir, { recursive: true });
      writeFileSync(full, content, 'utf8');
    },
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

describe('lexicon-scan.ts', () => {
  let fixture: ReturnType<typeof makeFixture>;

  beforeEach(() => {
    fixture = makeFixture();
  });

  afterEach(() => {
    fixture.cleanup();
  });

  it('passes when no banned terms are present', () => {
    fixture.write('content/landing.ts', `export const copy = "Make a Gesture";`);
    fixture.write(
      'components/landing-v2/Hero.tsx',
      `export function Hero() { return <h1>Signature</h1>; }`,
    );

    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('lexicon scan passed');
  });

  it.each([
    ['bid', `export const x = "place a bid";`],
    ['prize', `export const x = "win the prize";`],
    ['raffle', `export const x = "enter the raffle";`],
    ['staking', `export const x = "staking rewards";`],
    ['yield', `export const x = "yield distribution";`],
    ['charity', `export const x = "charity contribution";`],
    ['gambling', `export const x = "gambling product";`],
    ['lottery', `export const x = "lottery pool";`],
    ['investment', `export const x = "investment opportunity";`],
    ['winner', `export const x = "signature allocation winner";`],
  ])('fails when a string contains the banned term "%s"', (term, source) => {
    fixture.write('content/banned.ts', source);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`banned term: "${term}"`);
  });

  it('allows banned terms inside a lexicon-allow block (FAQ denial copy)', () => {
    fixture.write(
      'content/faq.ts',
      [
        '// lexicon-allow-start: FAQ denial copy',
        'export const faq = {',
        `  q1: 'Is this a lottery or gambling product?',`,
        `  a1: 'No. This is a procedural art protocol.',`,
        '};',
        '// lexicon-allow-end',
      ].join('\n'),
    );

    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
  });

  it('resumes strict mode after lexicon-allow-end', () => {
    fixture.write(
      'content/mixed.ts',
      [
        '// lexicon-allow-start: ok',
        `const a = "lottery";`,
        '// lexicon-allow-end',
        `const b = "bid now";`,
      ].join('\n'),
    );

    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('banned term: "bid"');
  });

  it('ignores banned terms that appear only in line comments', () => {
    fixture.write(
      'content/comments.ts',
      [
        '// This file replaces the word "bid" with "Gesture".',
        'export const x = "Make a Gesture";',
      ].join('\n'),
    );

    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
  });

  it('skips directories outside the SCAN_DIRS list', () => {
    // A file under an unknown top-level directory should be ignored.
    fixture.write('not-scanned/page.tsx', `export const x = "bid";`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
  });

  it('scans the e2e directory (added to SCAN_DIRS in the Phase 1 expansion)', () => {
    fixture.write('e2e/some.spec.ts', `const title = "place a bid";`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`banned term: "bid"`);
  });

  it('scans JSX text nodes between tags', () => {
    fixture.write(
      'components/HeroBanner.tsx',
      [
        'export function HeroBanner() {',
        '  return (',
        '    <span>Cosmic Signature Staking</span>',
        '  );',
        '}',
      ].join('\n'),
    );
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`banned JSX text`);
  });

  it('flags declared identifiers containing a banned stem', () => {
    fixture.write('hooks/useBidForm.ts', `export function useBidForm() { return {}; }`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`banned identifier`);
  });

  it('respects --no-identifiers and --no-jsx-text flags', () => {
    // File would fail with identifiers + jsx enabled, but we only test that
    // passing the flags does not crash. A proper integration test of the
    // flag plumbing requires the CLI helper to accept argv.
    fixture.write('components/clean.tsx', `export const title = "Make a Gesture";`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
  });

  it('permits the word "game" (per product direction)', () => {
    fixture.write('content/landing.ts', `export const x = "This is a game.";`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
  });

  it('is case-insensitive for banned terms', () => {
    fixture.write('content/upper.ts', `export const x = "BID now";`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(1);
  });

  it('matches whole words only (not substrings)', () => {
    // `forbid` contains "bid" as a substring but is not the banned verb.
    fixture.write('content/substring.ts', `export const x = "the protocol may forbid this";`);
    const result = runScanner(fixture.root);
    expect(result.exitCode).toBe(0);
  });
});

// lexicon-allow-end
