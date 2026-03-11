import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_PATH = resolve(__dirname, '..', 'eslint.config.mjs');
const configContent = readFileSync(CONFIG_PATH, 'utf-8');

 
const prettierConfig = require('eslint-config-prettier/flat') as {
  name: string;
  rules: Record<string, 'off' | 0>;
};

describe('eslint config', () => {
  describe('config file structure', () => {
    it('uses ESM export default syntax', () => {
      expect(configContent).toMatch(/export\s+default\s+config/);
    });

    it('imports from eslint-config-prettier/flat', () => {
      expect(configContent).toContain('eslint-config-prettier/flat');
    });

    it('includes prettierConfig as a single config element (not spread)', () => {
      expect(configContent).toMatch(/^\s+prettierConfig,$/m);
      expect(configContent).not.toMatch(/\.\.\.prettierConfig/);
    });

    it('places prettierConfig after the custom rules block', () => {
      const lastRulesClose = configContent.lastIndexOf('rules:');
      const prettierIndex = configContent.indexOf('prettierConfig,');
      expect(prettierIndex).toBeGreaterThan(lastRulesClose);
    });

    it('spreads nextCoreWebVitals at the start of the config array', () => {
      expect(configContent).toMatch(/\[\s*\n?\s*\.\.\.nextCoreWebVitals/);
    });
  });

  describe('eslint-config-prettier export shape', () => {
    it('exports a plain object (not an array)', () => {
      expect(typeof prettierConfig).toBe('object');
      expect(Array.isArray(prettierConfig)).toBe(false);
    });

    it('has name "config-prettier" for flat config debugging', () => {
      expect(prettierConfig).toHaveProperty('name', 'config-prettier');
    });

    it('has a rules object with entries', () => {
      expect(prettierConfig).toHaveProperty('rules');
      expect(typeof prettierConfig.rules).toBe('object');
      expect(Object.keys(prettierConfig.rules).length).toBeGreaterThan(0);
    });

    it('all rule values are "off" or 0', () => {
      Object.entries(prettierConfig.rules).forEach(([rule, value]) => {
        expect(value === 'off' || value === 0).toBe(true);
        if (value !== 'off' && value !== 0) {
          throw new Error(`Rule "${rule}" has unexpected value: ${value}`);
        }
      });
    });
  });

  describe('prettier-conflicting rules are disabled', () => {
    it.each([
      'indent',
      '@typescript-eslint/indent',
      'quotes',
      '@typescript-eslint/quotes',
      'semi',
      '@typescript-eslint/semi',
      'comma-dangle',
      '@typescript-eslint/comma-dangle',
      'arrow-parens',
      'max-len',
      'no-mixed-spaces-and-tabs',
      'no-tabs',
      'brace-style',
      '@typescript-eslint/brace-style',
      'comma-spacing',
      '@typescript-eslint/comma-spacing',
      'object-curly-spacing',
      '@typescript-eslint/object-curly-spacing',
    ])('%s is disabled ("off" or 0)', (rule) => {
      const value = prettierConfig.rules[rule];
      expect(value === 'off' || value === 0).toBe(true);
    });
  });

  describe('non-formatting rules are not overridden by prettier config', () => {
    it.each(['no-console', 'no-loss-of-precision', 'react-hooks/exhaustive-deps'])(
      '%s is NOT in the prettier override set',
      (rule) => {
        expect(prettierConfig.rules).not.toHaveProperty(rule);
      },
    );
  });

  describe('integration', () => {
    it('eslint loads the flat config without errors', () => {
      const output = execSync('npx eslint --print-config eslint.config.mjs', {
        cwd: resolve(__dirname, '..'),
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('rules');
    });
  });
});
