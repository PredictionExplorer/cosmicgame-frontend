import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

interface NpmAuditAdvisory {
  name: string;
  severity: string;
  title: string;
  url: string;
}

interface NpmAuditVulnerability {
  via: Array<string | NpmAuditAdvisory>;
}

interface NpmAuditReport {
  vulnerabilities?: Record<string, NpmAuditVulnerability>;
  metadata?: {
    vulnerabilities?: Record<string, number>;
  };
}

const repoRoot = process.cwd();
const acceptedDoc = readFileSync(path.join(repoRoot, 'docs/SECURITY.md'), 'utf8');
const acceptedIds = new Set<string>(
  Array.from(acceptedDoc.matchAll(/^### (GHSA-[a-z0-9-]+)$/gim), (match) => match[1]).filter(
    (id): id is string => id !== undefined,
  ),
);

function advisoryId(url: string): string | null {
  return url.match(/GHSA-[a-z0-9-]+/i)?.[0] ?? null;
}

function runNpmAudit(args: string[] = []): NpmAuditReport {
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
    return JSON.parse(execFileSync('npm', ['audit', ...args, '--json'], { encoding: 'utf8', env }));
  } catch (error) {
    const stdout = (error as { stdout?: string }).stdout;
    if (!stdout) throw error;
    return JSON.parse(stdout);
  }
}

const report = runNpmAudit();
const productionReport = runNpmAudit(['--omit=dev']);
const productionTotal = productionReport.metadata?.vulnerabilities?.total ?? 0;

if (productionTotal > 0) {
  console.error(`Production dependency audit found ${productionTotal} advisories.`);
  for (const [name, vulnerability] of Object.entries(productionReport.vulnerabilities ?? {})) {
    console.error(
      `- ${name}: ${vulnerability.via.map((via) => (typeof via === 'string' ? via : via.title)).join('; ')}`,
    );
  }
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities ?? {};
const advisories = new Map<string, NpmAuditAdvisory>();

function collect(name: string, seen = new Set<string>()) {
  if (seen.has(name)) return;
  seen.add(name);

  for (const via of vulnerabilities[name]?.via ?? []) {
    if (typeof via === 'string') {
      collect(via, seen);
      continue;
    }

    const id = advisoryId(via.url);
    if (id) advisories.set(id, via);
  }
}

for (const name of Object.keys(vulnerabilities)) {
  collect(name);
}

const unacceptedHighs = Array.from(advisories)
  .filter(([, advisory]) => advisory.severity === 'high' || advisory.severity === 'critical')
  .filter(([id]) => !acceptedIds.has(id));

if (unacceptedHighs.length > 0) {
  console.error('Unaccepted high/critical dependency advisories found:');
  for (const [id, advisory] of unacceptedHighs) {
    console.error(`- ${id} ${advisory.name}: ${advisory.title}`);
  }
  process.exit(1);
}

/**
 * Accepted advisories that no longer appear in the tree.
 *
 * Reported but not fatal. An acceptance records that no fix was available at
 * the time, which stops being true the moment upstream ships one — the js-yaml
 * entry sat here as "no fixed 3.x/4.x release exists" for a while after both
 * 3.15.1 and 4.3.1 were published, and a high advisory stayed in the tree
 * because nobody re-checked. Surfacing the gap is what makes the policy's
 * "revisit when a patch lands" line actually happen.
 */
const staleAcceptances = Array.from(acceptedIds).filter((id) => !advisories.has(id));

process.stdout.write(
  `Dependency audit passed: 0 production advisories; ${advisories.size} dev/tooling advisories found, all high/critical advisories are documented.\n`,
);

if (staleAcceptances.length > 0) {
  // Summarised rather than listed in full: a wall of ids on every CI run gets
  // skimmed past, which is how the js-yaml entry went stale in the first place.
  const shown = staleAcceptances.slice(0, 5);
  const remainder = staleAcceptances.length - shown.length;
  process.stdout.write(
    `\n${staleAcceptances.length} accepted advisor${staleAcceptances.length === 1 ? 'y' : 'ies'} in docs/SECURITY.md no longer appear in the dependency tree.\n` +
      `Confirm each is fixed rather than merely absent, then remove the entry: ${shown.join(', ')}` +
      `${remainder > 0 ? ` and ${remainder} more` : ''}.\n`,
  );
}
