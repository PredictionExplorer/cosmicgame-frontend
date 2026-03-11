import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HUSKY_DIR = resolve(__dirname, '..', '.husky');
const PKG_PATH = resolve(__dirname, '..', 'package.json');
const JEST_CONFIG_PATH = resolve(__dirname, '..', 'jest.config.js');

function readHook(name: string): string {
  return readFileSync(resolve(HUSKY_DIR, name), 'utf-8').trim();
}

function readPkg(): {
  scripts: Record<string, string>;
  'lint-staged': Record<string, string[]>;
} {
  return JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
}

function readJestConfig(): string {
  return readFileSync(JEST_CONFIG_PATH, 'utf-8');
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

    it('runs tests with coverage collection', () => {
      expect(content).toContain('--coverage');
    });

    it('uses --coverage flag on the test command', () => {
      expect(content).toMatch(/yarn test\s+--coverage/);
    });

    it('does not run bare yarn test without coverage', () => {
      expect(content).not.toMatch(/yarn test\s*$/);
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

    it('has a test:coverage script', () => {
      expect(scripts).toHaveProperty('test:coverage');
    });

    it('test:coverage invokes jest --coverage', () => {
      expect(scripts['test:coverage']).toBe('jest --coverage');
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

  describe('coverage enforcement pipeline', () => {
    let jestConfig: string;

    beforeAll(() => {
      jestConfig = readJestConfig();
    });

    it('jest config defines coverageThreshold', () => {
      expect(jestConfig).toContain('coverageThreshold');
    });

    it('enforces branch coverage >= 60%', () => {
      const match = jestConfig.match(/branches:\s*(\d+)/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeGreaterThanOrEqual(60);
    });

    it('enforces function coverage >= 60%', () => {
      const match = jestConfig.match(/functions:\s*(\d+)/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeGreaterThanOrEqual(60);
    });

    it('enforces line coverage >= 70%', () => {
      const match = jestConfig.match(/lines:\s*(\d+)/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeGreaterThanOrEqual(70);
    });

    it('enforces statement coverage >= 70%', () => {
      const match = jestConfig.match(/statements:\s*(\d+)/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeGreaterThanOrEqual(70);
    });

    it.each(['app/', 'components/', 'contexts/', 'hooks/', 'utils/', 'services/'])(
      'collects coverage from %s',
      (dir) => {
        expect(jestConfig).toContain(`'${dir}**/*.{ts,tsx}'`);
      },
    );

    it('excludes .d.ts files from coverage', () => {
      expect(jestConfig).toContain('!**/*.d.ts');
    });

    it('excludes node_modules from coverage', () => {
      expect(jestConfig).toContain('!**/node_modules/**');
    });

    it('pre-push hook and jest config both reference coverage', () => {
      const hookContent = readHook('pre-push');
      expect(hookContent).toContain('--coverage');
      expect(jestConfig).toContain('coverageThreshold');
    });
  });
});
