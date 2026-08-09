import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');
const PKG_PATH = resolve(ROOT, 'package.json');
const CI_WORKFLOW_PATH = resolve(ROOT, '.github/workflows/ci.yml');

function readPkg(): {
  packageManager?: string;
  resolutions?: Record<string, unknown>;
  overrides?: Record<string, unknown>;
} {
  return JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
}

/**
 * The project must have exactly one package manager.
 *
 * It previously had three stories at once: the README told developers to run
 * `yarn install`, `packageManager` named yarn 1.22, `.yarnrc.yml` and `.yarn/`
 * were Yarn Berry artifacts, and CI plus the git hooks used npm. Two committed
 * lockfiles meant a developer following the README installed a different tree
 * from the one CI validated, and Dependabot scanned both manifests and so
 * reported every advisory twice.
 */
describe('package manager', () => {
  it('commits exactly one lockfile', () => {
    expect(existsSync(resolve(ROOT, 'package-lock.json'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'yarn.lock'))).toBe(false);
    expect(existsSync(resolve(ROOT, 'pnpm-lock.yaml'))).toBe(false);
  });

  it('has no yarn configuration left behind', () => {
    expect(existsSync(resolve(ROOT, '.yarnrc.yml'))).toBe(false);
    expect(existsSync(resolve(ROOT, '.yarnrc'))).toBe(false);
    expect(existsSync(resolve(ROOT, '.yarn'))).toBe(false);
  });

  it('declares npm as the package manager', () => {
    expect(readPkg().packageManager).toMatch(/^npm@\d+\.\d+\.\d+/);
  });

  it('installs with npm in CI, matching the declared manager', () => {
    const workflow = readFileSync(CI_WORKFLOW_PATH, 'utf-8');
    expect(workflow).toContain('npm ci');
    expect(workflow).not.toMatch(/^\s*run:\s*yarn\b/m);
  });

  it('has no yarn-only resolutions field', () => {
    // npm ignores `resolutions` entirely. Keeping it alongside `overrides`
    // meant maintaining two lists of the same pins that could silently
    // disagree, with only one of them taking effect.
    expect(readPkg().resolutions).toBeUndefined();
    expect(readPkg().overrides).toBeDefined();
  });

  it('documents npm commands rather than yarn', () => {
    const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf-8');
    expect(readme).not.toMatch(/\byarn\b/i);
  });
});
