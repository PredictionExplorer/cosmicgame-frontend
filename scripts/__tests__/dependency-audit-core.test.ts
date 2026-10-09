import {
  EXCEPTION_HORIZON_DAYS,
  advisoryId,
  collectAdvisories,
  evaluateDependencyAudit,
  overrideDrift,
  parseCalendarDate,
  parseExceptions,
  type AuditAdvisory,
  type AuditException,
  type AuditReport,
  type DependencyAuditInput,
  type Manifest,
  type Severity,
} from '../dependency-audit-core';

const TODAY = new Date('2026-09-02T15:30:00Z');

function advisory(
  id: string,
  name: string,
  severity: Severity,
  title = `${name} issue`,
): AuditAdvisory {
  return { name, severity, title, url: `https://github.com/advisories/${id}` };
}

/** Builds an npm audit report where each listed package is reached directly. */
function report(advisories: AuditAdvisory[]): AuditReport {
  const vulnerabilities: NonNullable<AuditReport['vulnerabilities']> = {};
  for (const entry of advisories) {
    const vulnerability = (vulnerabilities[entry.name] ??= { via: [] });
    vulnerability.via.push(entry);
  }
  return { vulnerabilities };
}

function daysFromToday(days: number): string {
  const date = new Date(TODAY);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const MANIFEST: Manifest = {
  dependencies: { wagmi: '^3.6.15', viem: '^2.50.4' },
  devDependencies: { tsx: '^4.23.11' },
  overrides: { '@rainbow-me/rainbowkit': { wagmi: '^3.6.15' } },
};

function evaluate(overrides: Partial<DependencyAuditInput> = {}) {
  return evaluateDependencyAudit({
    report: { vulnerabilities: {} },
    productionReport: { vulnerabilities: {} },
    lsProblems: [],
    exceptions: [],
    manifest: MANIFEST,
    today: TODAY,
    ...overrides,
  });
}

const HIGH_TOOLING = advisory('GHSA-aaaa-bbbb-cccc', 'minimatch', 'high', 'ReDoS');
const MODERATE_PROD = advisory('GHSA-dddd-eeee-ffff', 'ws', 'moderate', 'DoS');

function exception(id: string, pkg: string, expires: string): AuditException {
  return {
    id,
    package: pkg,
    expires,
    reason: 'Reached only through local tooling; upstream fix is pending review.',
  };
}

describe('collectAdvisories', () => {
  it('follows via chains so an advisory reached through another package is counted once', () => {
    const chained: AuditReport = {
      vulnerabilities: {
        'jest-util': { via: ['picomatch'] },
        picomatch: { via: [advisory('GHSA-1111-2222-3333', 'picomatch', 'high')] },
        micromatch: { via: ['picomatch'] },
      },
    };
    const advisories = collectAdvisories(chained);
    expect([...advisories.keys()]).toEqual(['GHSA-1111-2222-3333']);
    expect(advisories.get('GHSA-1111-2222-3333')?.name).toBe('picomatch');
  });

  it('normalises advisory ids to upper case', () => {
    expect(advisoryId('https://github.com/advisories/ghsa-abcd-ef12-3456')).toBe(
      'GHSA-ABCD-EF12-3456',
    );
    expect(advisoryId('https://example.com/no-id')).toBeNull();
  });
});

describe('evaluateDependencyAudit', () => {
  it('passes a clean tree with no warnings', () => {
    const verdict = evaluate();
    expect(verdict.failures).toEqual([]);
    expect(verdict.warnings).toEqual([]);
    expect(verdict.summary).toEqual({
      advisories: 0,
      productionAdvisories: 0,
      exceptionsApplied: 0,
    });
  });

  it('fails any advisory reachable from a production dependency, whatever its severity', () => {
    const verdict = evaluate({
      report: report([MODERATE_PROD]),
      productionReport: report([MODERATE_PROD]),
    });
    expect(verdict.failures).toEqual(['production: GHSA-DDDD-EEEE-FFFF ws (moderate): DoS']);
  });

  it('fails high and critical tooling advisories but only warns about moderate and low ones', () => {
    const low = advisory('GHSA-1234-5678-9abc', 'tar', 'low');
    const verdict = evaluate({ report: report([HIGH_TOOLING, low]) });
    expect(verdict.failures).toEqual(['tooling: GHSA-AAAA-BBBB-CCCC minimatch (high): ReDoS']);
    expect(verdict.warnings).toEqual(['tooling: GHSA-1234-5678-9ABC tar (low): tar issue']);
  });

  it('honours a valid exception and reports it as a warning', () => {
    const verdict = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [exception('GHSA-aaaa-bbbb-cccc', 'minimatch', daysFromToday(30))],
    });
    expect(verdict.failures).toEqual([]);
    expect(verdict.warnings).toHaveLength(1);
    expect(verdict.warnings[0]).toMatch(
      /^exception applied: GHSA-AAAA-BBBB-CCCC minimatch \(high\): ReDoS — until \d{4}-\d{2}-\d{2}: Reached only/,
    );
    expect(verdict.summary.exceptionsApplied).toBe(1);
  });

  it('honours an exception through its expiry day and fails it the day after', () => {
    const throughToday = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [exception('GHSA-aaaa-bbbb-cccc', 'minimatch', daysFromToday(0))],
    });
    expect(throughToday.failures).toEqual([]);

    const expired = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [exception('GHSA-aaaa-bbbb-cccc', 'minimatch', daysFromToday(-1))],
    });
    // A rejected exception is reported alongside the advisory it failed to cover.
    expect(expired.failures).toEqual([
      `exception GHSA-AAAA-BBBB-CCCC expired on ${daysFromToday(-1)}; fix the advisory or renew it with a fresh reason`,
      'tooling: GHSA-AAAA-BBBB-CCCC minimatch (high): ReDoS',
    ]);
  });

  it('caps tooling exceptions at the tooling horizon', () => {
    const atHorizon = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [
        exception(
          'GHSA-aaaa-bbbb-cccc',
          'minimatch',
          daysFromToday(EXCEPTION_HORIZON_DAYS.tooling),
        ),
      ],
    });
    expect(atHorizon.failures).toEqual([]);

    const beyond = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [
        exception(
          'GHSA-aaaa-bbbb-cccc',
          'minimatch',
          daysFromToday(EXCEPTION_HORIZON_DAYS.tooling + 1),
        ),
      ],
    });
    expect(beyond.failures).toEqual([
      `exception GHSA-AAAA-BBBB-CCCC expires ${daysFromToday(91)}, more than 90 days out; tooling exceptions renew at most 90 days at a time`,
      'tooling: GHSA-AAAA-BBBB-CCCC minimatch (high): ReDoS',
    ]);
  });

  it('caps production exceptions at the shorter production horizon', () => {
    const production = {
      report: report([MODERATE_PROD]),
      productionReport: report([MODERATE_PROD]),
    };
    const withinHorizon = evaluate({
      ...production,
      exceptions: [
        exception('GHSA-dddd-eeee-ffff', 'ws', daysFromToday(EXCEPTION_HORIZON_DAYS.production)),
      ],
    });
    expect(withinHorizon.failures).toEqual([]);

    const beyond = evaluate({
      ...production,
      exceptions: [
        exception(
          'GHSA-dddd-eeee-ffff',
          'ws',
          daysFromToday(EXCEPTION_HORIZON_DAYS.production + 1),
        ),
      ],
    });
    expect(beyond.failures).toEqual([
      `exception GHSA-DDDD-EEEE-FFFF expires ${daysFromToday(31)}, more than 30 days out; production exceptions renew at most 30 days at a time`,
      'production: GHSA-DDDD-EEEE-FFFF ws (moderate): DoS',
    ]);
  });

  it('fails a stale exception whose advisory has left the tree', () => {
    const verdict = evaluate({
      exceptions: [exception('GHSA-aaaa-bbbb-cccc', 'minimatch', daysFromToday(10))],
    });
    expect(verdict.failures).toEqual([
      'exception GHSA-AAAA-BBBB-CCCC is stale: the advisory is no longer in the dependency tree; remove the entry',
    ]);
  });

  it('fails an exception that names the wrong package or repeats an id', () => {
    const wrongPackage = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [exception('GHSA-aaaa-bbbb-cccc', 'picomatch', daysFromToday(10))],
    });
    expect(wrongPackage.failures).toEqual([
      'exception GHSA-AAAA-BBBB-CCCC names picomatch but the advisory is against minimatch',
      'tooling: GHSA-AAAA-BBBB-CCCC minimatch (high): ReDoS',
    ]);

    const duplicated = evaluate({
      report: report([HIGH_TOOLING]),
      exceptions: [
        exception('GHSA-aaaa-bbbb-cccc', 'minimatch', daysFromToday(10)),
        exception('GHSA-AAAA-BBBB-CCCC', 'minimatch', daysFromToday(10)),
      ],
    });
    expect(duplicated.failures).toEqual(['exception GHSA-AAAA-BBBB-CCCC is listed more than once']);
  });

  it('fails invalid and missing lockfile edges and ignores extraneous packages', () => {
    const verdict = evaluate({
      lsProblems: [
        'invalid: @base-org/account@2.4.0 /repo/node_modules/@base-org/account',
        'missing: webpack@>=5.0.0, required by @sentry/webpack-plugin@5.3.0',
        'extraneous: @img/sharp-wasm32@0.35.3 /repo/node_modules/@img/sharp-wasm32',
      ],
    });
    expect(verdict.failures).toEqual([
      'lockfile: invalid: @base-org/account@2.4.0 /repo/node_modules/@base-org/account',
      'lockfile: missing: webpack@>=5.0.0, required by @sentry/webpack-plugin@5.3.0',
    ]);
  });

  it('fails a nested override that drifts from the root spec', () => {
    const verdict = evaluate({
      manifest: { ...MANIFEST, overrides: { '@rainbow-me/rainbowkit': { wagmi: '^3.0.0' } } },
    });
    expect(verdict.failures).toEqual([
      'override @rainbow-me/rainbowkit > wagmi is "^3.0.0" but the root declares "^3.6.15"; keep them identical',
    ]);
  });
});

describe('overrideDrift', () => {
  it('accepts identical specs, $references, string overrides, and packages the root does not declare', () => {
    expect(
      overrideDrift({
        dependencies: { wagmi: '^3.6.15', axios: '^1.18.1' },
        overrides: {
          '@rainbow-me/rainbowkit': { wagmi: '^3.6.15' },
          'some-plugin': { wagmi: '$wagmi', picomatch: '^4.0.4' },
          axios: '^1.18.1',
        },
      }),
    ).toEqual([]);
  });

  it('checks devDependencies too', () => {
    expect(
      overrideDrift({
        devDependencies: { tsx: '^4.23.11' },
        overrides: { tool: { tsx: '^4.0.0' } },
      }),
    ).toEqual([
      'override tool > tsx is "^4.0.0" but the root declares "^4.23.11"; keep them identical',
    ]);
  });
});

describe('parseExceptions', () => {
  it('accepts a well-formed entry and upper-cases the id', () => {
    const { exceptions, errors } = parseExceptions([
      exception('ghsa-aaaa-bbbb-cccc', 'minimatch', '2026-10-01'),
    ]);
    expect(errors).toEqual([]);
    expect(exceptions).toEqual([
      expect.objectContaining({ id: 'GHSA-AAAA-BBBB-CCCC', package: 'minimatch' }),
    ]);
  });

  it('rejects anything that is not an array of objects', () => {
    expect(parseExceptions({ id: 'GHSA-aaaa-bbbb-cccc' }).errors).toEqual([
      'audit-exceptions.json must be a JSON array of exceptions',
    ]);
    expect(parseExceptions(['GHSA-aaaa-bbbb-cccc']).errors).toEqual([
      'audit-exceptions.json[0]: expected an object with id, package, reason, expires',
    ]);
  });

  it('reports every malformed field of an entry', () => {
    const { exceptions, errors } = parseExceptions([
      { id: 'CVE-2026-1', package: '', reason: 'n/a', expires: '2026-02-30' },
    ]);
    expect(exceptions).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(
      /^audit-exceptions.json\[0\]: id must be a GHSA identifier; package must name the package; reason must explain/,
    );
    expect(errors[0]).toMatch(/expires must be a calendar date \(YYYY-MM-DD\)$/);
  });
});

describe('parseCalendarDate', () => {
  it('parses real dates as UTC midnight and rejects impossible ones', () => {
    expect(parseCalendarDate('2026-09-02')?.toISOString()).toBe('2026-09-02T00:00:00.000Z');
    expect(parseCalendarDate('2026-02-30')).toBeNull();
    expect(parseCalendarDate('2026-9-2')).toBeNull();
    expect(parseCalendarDate('tomorrow')).toBeNull();
  });
});
