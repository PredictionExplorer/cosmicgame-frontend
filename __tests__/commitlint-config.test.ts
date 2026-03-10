import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_PATH = resolve(__dirname, '..', 'commitlint.config.mjs');

function lintMessage(message: string): { valid: boolean; output: string } {
  try {
    const output = execSync(`echo "${message}" | npx commitlint --config "${CONFIG_PATH}"`, {
      cwd: resolve(__dirname, '..'),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { valid: true, output };
  } catch (err) {
    const error = err as { stderr?: string; stdout?: string };
    return { valid: false, output: error.stderr ?? error.stdout ?? '' };
  }
}

describe('commitlint config', () => {
  describe('config structure', () => {
    const configContent = readFileSync(CONFIG_PATH, 'utf-8');

    it('uses .mjs extension for proper ESM support', () => {
      expect(CONFIG_PATH).toMatch(/\.mjs$/);
    });

    it('uses ESM export default syntax', () => {
      expect(configContent).toMatch(/export\s+default/);
    });

    it('extends @commitlint/config-conventional', () => {
      expect(configContent).toContain('@commitlint/config-conventional');
    });
  });

  describe('conventional commit validation', () => {
    it('accepts a valid feat commit', () => {
      expect(lintMessage('feat: add new bidding feature').valid).toBe(true);
    });

    it('accepts a valid fix commit with scope', () => {
      expect(lintMessage('fix(api): handle timeout errors').valid).toBe(true);
    });

    it.each([
      'build',
      'chore',
      'ci',
      'docs',
      'feat',
      'fix',
      'perf',
      'refactor',
      'revert',
      'style',
      'test',
    ])('accepts type "%s"', (type) => {
      expect(lintMessage(`${type}: valid message`).valid).toBe(true);
    });

    it('rejects a message without a type prefix', () => {
      expect(lintMessage('add new feature').valid).toBe(false);
    });

    it('rejects a non-conventional type', () => {
      expect(lintMessage('yolo: ship it').valid).toBe(false);
    });
  });
});
