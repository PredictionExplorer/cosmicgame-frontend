/**
 * Dependency audit — the pure evaluation behind `npm run deps:audit`.
 *
 * The CLI (scripts/dependency-audit.ts) collects the JSON npm already produces
 * (`npm audit --json`, `npm audit --omit=dev --json`, `npm ls --all --json`),
 * the root manifest, and the optional exception file, and hands everything to
 * `evaluateDependencyAudit`. Keeping the rules free of I/O is what lets them be
 * tested against fixtures in scripts/__tests__/dependency-audit-core.test.ts.
 *
 * Policy (README.md → Development → Dependencies):
 *
 * - An advisory reachable from a production dependency fails at any severity.
 * - High and critical advisories fail wherever they are reached.
 * - Moderate and low advisories in development tooling are reported, not blocking.
 * - Exceptions live in `audit-exceptions.json` at the repo root, which does not
 *   exist while the tree is clean. Every entry names a live advisory, states a
 *   reason, and expires within EXCEPTION_HORIZON_DAYS; expired, stale, or
 *   mistyped entries fail, so the list cannot rot the way an acceptance
 *   document does.
 * - The lockfile must satisfy every declared range: `npm ls` problems of kind
 *   `invalid`/`missing` fail. `extraneous` packages are local install noise.
 * - A nested override that names a root dependency must repeat the root's
 *   spec (npm's `$name` reference form fails on fresh resolves).
 */

export type Severity = 'info' | 'low' | 'moderate' | 'high' | 'critical';

export interface AuditAdvisory {
  name: string;
  severity: Severity;
  title: string;
  url: string;
  range?: string;
}

export interface AuditVulnerability {
  via: Array<string | AuditAdvisory>;
}

export interface AuditReport {
  vulnerabilities?: Record<string, AuditVulnerability>;
  metadata?: { vulnerabilities?: Record<string, number> };
}

export interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  overrides?: Record<string, string | Record<string, string>>;
}

export interface AuditException {
  id: string;
  package: string;
  reason: string;
  /** Calendar date (YYYY-MM-DD); the exception is honoured through that day. */
  expires: string;
}

export interface DependencyAuditInput {
  report: AuditReport;
  productionReport: AuditReport;
  lsProblems: readonly string[];
  exceptions: readonly AuditException[];
  manifest: Manifest;
  today: Date;
}

export interface DependencyAuditVerdict {
  failures: string[];
  warnings: string[];
  summary: {
    advisories: number;
    productionAdvisories: number;
    exceptionsApplied: number;
  };
}

export const EXCEPTIONS_FILE = 'audit-exceptions.json';

/** Longest an exception may run, counted from the day the gate runs. */
export const EXCEPTION_HORIZON_DAYS = { production: 30, tooling: 90 } as const;

const BLOCKING_SEVERITIES: ReadonlySet<Severity> = new Set(['high', 'critical']);
const GHSA_ID = /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function advisoryId(url: string): string | null {
  return url.match(/GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/i)?.[0]?.toUpperCase() ?? null;
}

/**
 * Flattens an npm audit report into the distinct advisories it reaches. npm
 * nests a vulnerable package's `via` as either an advisory object or the name
 * of another vulnerable package; the recursion follows the names so an
 * advisory reached only through a chain is still counted once.
 */
export function collectAdvisories(report: AuditReport): Map<string, AuditAdvisory> {
  const vulnerabilities = report.vulnerabilities ?? {};
  const advisories = new Map<string, AuditAdvisory>();

  const collect = (name: string, seen: Set<string>) => {
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
  };

  for (const name of Object.keys(vulnerabilities)) collect(name, new Set());
  return advisories;
}

/** Parses a calendar date as UTC midnight; null when the string is not a real date. */
export function parseCalendarDate(value: string): Date | null {
  const match = CALENDAR_DATE.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  const roundTrips =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return roundTrips ? date : null;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Validates the raw JSON of the exception file. Shape errors are reported
 * per entry so a malformed file fails loudly instead of silently excepting
 * nothing (or everything).
 */
export function parseExceptions(raw: unknown): { exceptions: AuditException[]; errors: string[] } {
  if (!Array.isArray(raw)) {
    return { exceptions: [], errors: [`${EXCEPTIONS_FILE} must be a JSON array of exceptions`] };
  }

  const exceptions: AuditException[] = [];
  const errors: string[] = [];

  raw.forEach((entry, index) => {
    const where = `${EXCEPTIONS_FILE}[${index}]`;
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      errors.push(`${where}: expected an object with id, package, reason, expires`);
      return;
    }
    const { id, package: pkg, reason, expires } = entry as Record<string, unknown>;
    const problems: string[] = [];
    if (typeof id !== 'string' || !GHSA_ID.test(id)) problems.push('id must be a GHSA identifier');
    if (typeof pkg !== 'string' || pkg.trim() === '')
      problems.push('package must name the package');
    if (typeof reason !== 'string' || reason.trim().length < 20) {
      problems.push(
        'reason must explain, in a sentence, why the advisory cannot be fixed yet and why it is not reachable',
      );
    }
    if (typeof expires !== 'string' || !parseCalendarDate(expires)) {
      problems.push('expires must be a calendar date (YYYY-MM-DD)');
    }
    if (problems.length > 0) {
      errors.push(`${where}: ${problems.join('; ')}`);
      return;
    }
    exceptions.push({
      id: (id as string).toUpperCase(),
      package: pkg as string,
      reason: reason as string,
      expires: expires as string,
    });
  });

  return { exceptions, errors };
}

function describe(id: string, advisory: AuditAdvisory): string {
  return `${id} ${advisory.name} (${advisory.severity}): ${advisory.title}`;
}

/**
 * Nested overrides such as `"@rainbow-me/rainbowkit": { "wagmi": "^3.6.15" }`
 * exist to satisfy a peer range the package has not caught up with. When the
 * root also depends on that package, the two specs must stay identical or the
 * override silently pins an older line than the app installs.
 */
export function overrideDrift(manifest: Manifest): string[] {
  const rootSpecs = { ...manifest.devDependencies, ...manifest.dependencies };
  const failures: string[] = [];
  for (const [parent, value] of Object.entries(manifest.overrides ?? {})) {
    if (typeof value !== 'object') continue;
    for (const [child, spec] of Object.entries(value)) {
      const rootSpec = rootSpecs[child];
      if (rootSpec === undefined || spec.startsWith('$') || spec === rootSpec) continue;
      failures.push(
        `override ${parent} > ${child} is "${spec}" but the root declares "${rootSpec}"; keep them identical`,
      );
    }
  }
  return failures;
}

export function evaluateDependencyAudit(input: DependencyAuditInput): DependencyAuditVerdict {
  const failures: string[] = [];
  const warnings: string[] = [];

  const advisories = collectAdvisories(input.report);
  const productionIds = new Set(collectAdvisories(input.productionReport).keys());
  const today = startOfUtcDay(input.today);

  // Exceptions are validated first so a stale or expired entry fails even when
  // nothing else is wrong — that is the whole point of time-boxing them.
  const active = new Map<string, AuditException>();
  const seen = new Set<string>();
  for (const exception of input.exceptions) {
    const id = exception.id.toUpperCase();
    if (seen.has(id)) {
      failures.push(`exception ${id} is listed more than once`);
      continue;
    }
    seen.add(id);

    const advisory = advisories.get(id);
    if (!advisory) {
      failures.push(
        `exception ${id} is stale: the advisory is no longer in the dependency tree; remove the entry`,
      );
      continue;
    }
    if (advisory.name !== exception.package) {
      failures.push(
        `exception ${id} names ${exception.package} but the advisory is against ${advisory.name}`,
      );
      continue;
    }

    const expires = parseCalendarDate(exception.expires);
    if (!expires) {
      failures.push(`exception ${id} has an invalid expiry "${exception.expires}"`);
      continue;
    }
    const daysLeft = Math.round((expires.getTime() - today.getTime()) / DAY_MS);
    const scope = productionIds.has(id) ? 'production' : 'tooling';
    const horizon = EXCEPTION_HORIZON_DAYS[scope];
    if (daysLeft < 0) {
      failures.push(
        `exception ${id} expired on ${exception.expires}; fix the advisory or renew it with a fresh reason`,
      );
      continue;
    }
    if (daysLeft > horizon) {
      failures.push(
        `exception ${id} expires ${exception.expires}, more than ${horizon} days out; ${scope} exceptions renew at most ${horizon} days at a time`,
      );
      continue;
    }

    active.set(id, exception);
    warnings.push(
      `exception applied: ${describe(id, advisory)} — until ${exception.expires}: ${exception.reason}`,
    );
  }

  for (const [id, advisory] of advisories) {
    if (active.has(id)) continue;
    if (productionIds.has(id)) {
      failures.push(`production: ${describe(id, advisory)}`);
    } else if (BLOCKING_SEVERITIES.has(advisory.severity)) {
      failures.push(`tooling: ${describe(id, advisory)}`);
    } else {
      warnings.push(`tooling: ${describe(id, advisory)}`);
    }
  }

  for (const problem of input.lsProblems) {
    if (/^(invalid|missing):/.test(problem)) failures.push(`lockfile: ${problem}`);
  }

  failures.push(...overrideDrift(input.manifest));

  return {
    failures,
    warnings,
    summary: {
      advisories: advisories.size,
      productionAdvisories: productionIds.size,
      exceptionsApplied: active.size,
    },
  };
}
