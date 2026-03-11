import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HUSKY_DIR = resolve(__dirname, '..', '.husky');
const PKG_PATH = resolve(__dirname, '..', 'package.json');

function readHook(name: string): string {
  return readFileSync(resolve(HUSKY_DIR, name), 'utf-8').trim();
}

function readPkg(): {
  scripts: Record<string, string>;
  'lint-staged': Record<string, string[]>;
} {
  return JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
}

describe('git hooks', () => {
  describe('hook file structure', () => {
    it.each(['pre-push', 'pre-commit', 'commit-msg'])('%s hook file exists', (hook) => {
      expect(existsSync(resolve(HUSKY_DIR, hook))).toBe(true);
    });
  });

  describe('pre-push hook', () => {
    let content: string;

    beforeAll(() => {
      content = readHook('pre-push');
    });

    it('runs type-check', () => {
      expect(content).toContain('type-check');
    });

    it('runs the test suite', () => {
      expect(content).toContain('yarn test');
    });

    it('runs type-check before tests (fail-fast)', () => {
      expect(content).toMatch(/type-check\s*&&\s*yarn test/);
    });

    it('is not a bare yarn test without type-checking', () => {
      expect(content).not.toBe('yarn test');
    });

    it('is a single-line script', () => {
      expect(content.split('\n').filter((l) => l.trim()).length).toBe(1);
    });
  });

  describe('pre-commit hook', () => {
    let content: string;

    beforeAll(() => {
      content = readHook('pre-commit');
    });

    it('runs lint-staged', () => {
      expect(content).toContain('lint-staged');
    });

    it('uses npx to invoke lint-staged', () => {
      expect(content).toMatch(/npx\s+lint-staged/);
    });

    it('is a single-line script', () => {
      expect(content.split('\n').filter((l) => l.trim()).length).toBe(1);
    });
  });

  describe('commit-msg hook', () => {
    let content: string;

    beforeAll(() => {
      content = readHook('commit-msg');
    });

    it('runs commitlint', () => {
      expect(content).toContain('commitlint');
    });

    it('passes the commit message file via --edit $1', () => {
      expect(content).toContain('--edit $1');
    });

    it('is a single-line script', () => {
      expect(content.split('\n').filter((l) => l.trim()).length).toBe(1);
    });
  });

  describe('package.json scripts', () => {
    let scripts: Record<string, string>;

    beforeAll(() => {
      scripts = readPkg().scripts;
    });

    it('has a type-check script', () => {
      expect(scripts).toHaveProperty('type-check');
    });

    it('type-check invokes tsc --noEmit', () => {
      expect(scripts['type-check']).toBe('tsc --noEmit');
    });

    it('test script invokes jest', () => {
      expect(scripts.test).toBe('jest');
    });
  });

  describe('lint-staged config', () => {
    let tsCommands: string[];

    beforeAll(() => {
      const pkg = readPkg();
      tsCommands = pkg['lint-staged']['*.{ts,tsx}'] ?? [];
    });

    it('runs tsc --noEmit on ts/tsx files', () => {
      expect(tsCommands).toEqual(expect.arrayContaining([expect.stringContaining('tsc --noEmit')]));
    });

    it('runs prettier --write on ts/tsx files', () => {
      expect(tsCommands).toContain('prettier --write');
    });

    it('runs eslint --fix on ts/tsx files', () => {
      expect(tsCommands).toContain('eslint --fix');
    });
  });
});
