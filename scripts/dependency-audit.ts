#!/usr/bin/env tsx
/* eslint-disable no-console -- command-line quality gate */

/**
 * Dependency audit gate (`npm run deps:audit`), run on pre-push and in CI.
 *
 * Collects npm's own JSON reports and hands them to the pure rules in
 * dependency-audit-core.ts: production advisories at any severity fail,
 * high/critical advisories anywhere fail, the lockfile must satisfy every
 * declared range, and exceptions (audit-exceptions.json, normally absent) are
 * time-boxed. README.md → Development → Dependencies documents the policy and
 * the remediation ladder printed below.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  EXCEPTIONS_FILE,
  EXCEPTION_HORIZON_DAYS,
  evaluateDependencyAudit,
  parseExceptions,
  type AuditReport,
  type Manifest,
} from './dependency-audit-core';

const repoRoot = process.cwd();

/**
 * `npm audit` and `npm ls` exit non-zero when they find something, with the
 * JSON report still on stdout, so a non-zero exit is data rather than an error.
 */
function runNpmJson<T>(args: string[]): T {
  const env = { ...process.env };
  for (const key of [
    'npm_config_argv',
    'npm_config_ignore_engines',
    'npm_config_version_commit_hooks',
    'npm_config_version_git_message',
    'npm_config_version_git_tag',
    'npm_config_version_tag_prefix',
  ]) {
    delete env[key];
  }

  try {
    return JSON.parse(
      execFileSync('npm', [...args, '--json'], {
        encoding: 'utf8',
        env,
        maxBuffer: 256 * 1024 * 1024,
      }),
    ) as T;
  } catch (error) {
    const stdout = (error as { stdout?: string }).stdout;
    if (!stdout) throw error;
    return JSON.parse(stdout) as T;
  }
}

function readExceptions(): {
  exceptions: ReturnType<typeof parseExceptions>['exceptions'];
  errors: string[];
} {
  const file = path.join(repoRoot, EXCEPTIONS_FILE);
  if (!existsSync(file)) return { exceptions: [], errors: [] };
  try {
    return parseExceptions(JSON.parse(readFileSync(file, 'utf8')));
  } catch (error) {
    return {
      exceptions: [],
      errors: [`${EXCEPTIONS_FILE} is not valid JSON: ${(error as Error).message}`],
    };
  }
}

console.log('\u{1f512}  Dependency audit');

const manifest = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as Manifest;
const { exceptions, errors: exceptionErrors } = readExceptions();
const report = runNpmJson<AuditReport>(['audit']);
const productionReport = runNpmJson<AuditReport>(['audit', '--omit=dev']);
const { problems = [] } = runNpmJson<{ problems?: string[] }>(['ls', '--all']);

const verdict = evaluateDependencyAudit({
  report,
  productionReport,
  lsProblems: problems,
  exceptions,
  manifest,
  today: new Date(),
});
const failures = [...exceptionErrors, ...verdict.failures];

for (const warning of verdict.warnings) console.log(`\u26a0\ufe0f   ${warning}`);
for (const failure of failures) console.error(`\u274c  ${failure}`);

if (failures.length > 0) {
  console.error(
    `\n\u274c  dependency audit failed with ${failures.length} problem(s). Fix, in this order:`,
  );
  console.error(
    '   1. npm update <package>          when the patched release is inside the range the consumer declares',
  );
  console.error(
    '   2. bump the consuming package    when a newer release of the consumer declares a patched range',
  );
  console.error(
    '   3. "overrides" in package.json   only when the consumer pins the vulnerable version; add a row to README.md',
  );
  console.error(
    `   4. ${EXCEPTIONS_FILE}          last resort: id, package, reason, expires (\u2264 ${EXCEPTION_HORIZON_DAYS.tooling} days tooling, \u2264 ${EXCEPTION_HORIZON_DAYS.production} production)`,
  );
  process.exit(1);
}

const { advisories, productionAdvisories, exceptionsApplied } = verdict.summary;
console.log(
  `\u2705  dependency audit passed \u2014 ${productionAdvisories} production and ${advisories} total advisories, ${exceptionsApplied} exception(s) applied, lockfile satisfies every declared range`,
);
