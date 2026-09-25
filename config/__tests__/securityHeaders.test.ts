import {
  ENFORCED_CSP,
  FRAME_ORIGINS,
  SCRIPT_ORIGINS,
  originsOf,
  securityHeaders,
  sentryCspReportUri,
  serializePolicy,
} from '@/config/securityHeaders';

/** `directive → sources` of a serialized policy. */
function parsePolicy(value: string | undefined): Map<string, string[]> {
  return new Map(
    (value ?? '')
      .split(';')
      .map((part) => part.trim().split(/\s+/))
      .filter(([directive]) => directive)
      .map(([directive = '', ...sources]) => [directive, sources]),
  );
}

const header = (headers: ReturnType<typeof securityHeaders>, key: string) =>
  headers.find((entry) => entry.key === key)?.value;

describe('security headers', () => {
  it('keeps the framing, sniffing, referrer and permission headers', () => {
    expect(securityHeaders()).toEqual(
      expect.arrayContaining([
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ]),
    );
  });

  // V163: the wallet-connected app host shipped no CSP at all.
  it('enforces the directives no flow of the site needs to break', () => {
    const enforced = parsePolicy(header(securityHeaders(), 'Content-Security-Policy'));
    expect(Object.fromEntries(enforced)).toEqual({
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      // The embed routes are framed by the site itself, as X-Frame-Options says.
      'frame-ancestors': ["'self'"],
      'form-action': ["'self'"],
    });
    // Nothing that could stop a script, a wallet request or an image is enforced yet.
    for (const directive of ['script-src', 'connect-src', 'img-src', 'default-src']) {
      expect(enforced.has(directive)).toBe(false);
    }
  });

  const DSN = 'https://abc123@o42.ingest.sentry.io/4507';

  it('reports against the full allowlist without blocking', () => {
    const policy = parsePolicy(
      header(securityHeaders({ sentryDsn: DSN }), 'Content-Security-Policy-Report-Only'),
    );
    expect(policy.get('default-src')).toEqual(["'self'"]);
    expect(policy.get('script-src')).toEqual(["'self'", "'unsafe-inline'", ...SCRIPT_ORIGINS]);
    expect(policy.get('frame-src')).toEqual(["'self'", ...FRAME_ORIGINS]);
    expect(policy.get('connect-src')).toEqual(["'self'", 'https:', 'wss:']);
    // Complete the day it is enforced, except frame-ancestors: browsers ignore
    // it in a report-only policy and warn about it on every page.
    for (const [directive, sources] of Object.entries(ENFORCED_CSP)) {
      if (directive === 'frame-ancestors') expect(policy.has(directive)).toBe(false);
      else expect(policy.get(directive)).toEqual(sources);
    }
  });

  it('ships the report-only policy only where a report can go or a console is watched', () => {
    const reportOnly = (options: Parameters<typeof securityHeaders>[0]) =>
      header(securityHeaders(options), 'Content-Security-Policy-Report-Only');
    // No destination: it would block nothing and make Safari log an error per page.
    expect(reportOnly({})).toBeUndefined();
    expect(reportOnly({ sentryDsn: 'not a dsn' })).toBeUndefined();
    expect(parsePolicy(reportOnly({ development: true })).has('report-uri')).toBe(false);
    expect(parsePolicy(reportOnly({ sentryDsn: DSN })).has('report-uri')).toBe(true);
    // The enforced baseline ships either way.
    expect(header(securityHeaders(), 'Content-Security-Policy')).toBe(
      serializePolicy(ENFORCED_CSP),
    );
  });

  it("allows React's development eval only under next dev", () => {
    const scriptSrc = (development: boolean) =>
      parsePolicy(
        header(
          securityHeaders({ development, sentryDsn: DSN }),
          'Content-Security-Policy-Report-Only',
        ),
      ).get('script-src');
    expect(scriptSrc(true)).toContain("'unsafe-eval'");
    expect(scriptSrc(false)).not.toContain("'unsafe-eval'");
  });

  it('names a plain-http backend the deployment is configured with, and only that', () => {
    const policy = parsePolicy(
      header(
        securityHeaders({
          sentryDsn: DSN,
          dataEndpoints: [
            'http://127.0.0.1:8099/api/cosmicgame/',
            'https://a1.cosmicsignature.com/api/cosmicgame/',
            ' http://127.0.0.1:8099/other ',
            'not a url',
          ],
        }),
        'Content-Security-Policy-Report-Only',
      ),
    );
    expect(policy.get('connect-src')).toEqual([
      "'self'",
      'https:',
      'wss:',
      'http://127.0.0.1:8099',
    ]);
    expect(policy.get('img-src')).toContain('http://127.0.0.1:8099');
  });

  it('sends violation reports to the Sentry project when a DSN is set', () => {
    const reportOnly = header(
      securityHeaders({ sentryDsn: DSN }),
      'Content-Security-Policy-Report-Only',
    );
    expect(parsePolicy(reportOnly).get('report-uri')).toEqual([
      'https://o42.ingest.sentry.io/api/4507/security/?sentry_key=abc123',
    ]);
  });
});

describe('sentryCspReportUri', () => {
  it.each([
    undefined,
    '',
    '  ',
    'not a dsn',
    'http://key@host/1',
    'https://host/1',
    'https://key@host/',
  ])('returns null for %p', (dsn) => {
    expect(sentryCspReportUri(dsn)).toBeNull();
  });
});

describe('policy helpers', () => {
  it('serializes directives in order, sources space-separated', () => {
    expect(serializePolicy({ a: ['x', 'y'], b: ["'none'"] })).toBe("a x y; b 'none'");
  });

  it('keeps each http(s) origin once', () => {
    expect(originsOf(['https://a.test/x', 'https://a.test/y', 'ws://b.test', 'nope'])).toEqual([
      'https://a.test',
    ]);
  });
});
