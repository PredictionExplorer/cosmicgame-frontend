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
const acceptedIds = new Set(
  Array.from(acceptedDoc.matchAll(/^### (GHSA-[a-z0-9-]+)$/gim), (match) => match[1]),
);

function advisoryId(url: string): string | null {
  return url.match(/GHSA-[a-z0-9-]+/i)?.[0] ?? null;
}

function runNpmAudit(args: string[] = []): NpmAuditReport {
  try {
    return JSON.parse(execFileSync('npm', ['audit', ...args, '--json'], { encoding: 'utf8' }));
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

console.warn(
  `Dependency audit passed: 0 production advisories; ${advisories.size} dev/tooling advisories found, all high/critical advisories are documented.`,
);
