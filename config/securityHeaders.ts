/**
 * Response headers every page and asset carries on both hosts, applied by
 * `headers()` in next.config.ts.
 *
 * The Content Security Policy ships in two parts:
 *
 * - **Enforced**: the directives no legitimate flow of the site needs to
 *   break. No plugins (`object-src`), no `<base>` that re-points relative
 *   URLs, no framing by another origin (the embed routes are framed by the
 *   site itself; this matches `X-Frame-Options: SAMEORIGIN` for browsers
 *   that honour only one of them), and no form posting off the site.
 * - **Report-only**: the full source allowlist the site is meant to run
 *   under (scripts from the site, Google Analytics, the Sentry replay loader
 *   and Vercel's scripts; frames only for WalletConnect's verify service).
 *   A browser reports what it would have blocked without blocking it, to
 *   Sentry when a DSN is configured, so the policy can be enforced once the
 *   reports show that wallets and analytics run clean under it.
 *
 * Scripts keep `'unsafe-inline'`: Next.js streams its flight data and the
 * pre-paint theme script as inline scripts, and nonces would force every
 * statically generated page to render per request (see the Next.js CSP
 * guide). Moving to nonces or hashes is a separate, measured change.
 */

export interface SecurityHeader {
  key: string;
  value: string;
}

export interface SecurityHeaderOptions {
  /** `next dev`: React's dev build evaluates strings for its error overlays. */
  development?: boolean;
  /** `NEXT_PUBLIC_SENTRY_DSN`, when set: violation reports go to its project. */
  sentryDsn?: string;
  /**
   * API, media and RPC endpoints the deployment is configured with
   * (`NEXT_PUBLIC_API_URL(S)`, `NEXT_PUBLIC_RPC_URL(S)`). Any https origin is
   * allowed already; these add a plain-http local backend.
   */
  dataEndpoints?: readonly string[];
}

type Policy = Record<string, readonly string[]>;

/** Directives enforced on every response. */
export const ENFORCED_CSP: Policy = {
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'frame-ancestors': ["'self'"],
  'form-action': ["'self'"],
};

/** Third-party script origins the site loads on purpose. */
export const SCRIPT_ORIGINS = [
  // gtag.js (app/root-document.tsx), only when a GA id is configured.
  'https://www.googletagmanager.com',
  // Sentry's lazily loaded session-replay integration (sentry.client.config.ts).
  'https://browser.sentry-cdn.com',
  // Vercel Analytics and Speed Insights serve from /_vercel in production
  // and from this origin in development and previews.
  'https://va.vercel-scripts.com',
] as const;

/** Frames the wallet stack opens (WalletConnect's domain verification). */
export const FRAME_ORIGINS = [
  'https://verify.walletconnect.com',
  'https://verify.walletconnect.org',
] as const;

/** The distinct origins of `endpoints`, skipping entries that are not URLs. */
export function originsOf(endpoints: readonly string[]): string[] {
  const origins = new Set<string>();
  for (const entry of endpoints) {
    try {
      const url = new URL(entry.trim());
      if (url.protocol === 'https:' || url.protocol === 'http:') origins.add(url.origin);
    } catch {
      // Not a URL: the fetch layer reports misconfigured endpoints.
    }
  }
  return [...origins];
}

function reportOnlyPolicy(development: boolean, dataOrigins: readonly string[]): Policy {
  return {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(development ? ["'unsafe-eval'"] : []),
      ...SCRIPT_ORIGINS,
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    // Artwork comes from the rotating API origins and wallets bring their
    // own icons, so any https image is allowed; data: and blob: for
    // generated previews.
    'img-src': ["'self'", 'data:', 'blob:', 'https:', ...dataOrigins],
    'font-src': ["'self'", 'data:'],
    'media-src': ["'self'", 'https:', ...dataOrigins],
    // RPC endpoints, the API rotation and WalletConnect's relays vary by
    // deployment and wallet: any secure origin, plain http only for the
    // endpoints the deployment names.
    'connect-src': ["'self'", 'https:', 'wss:', ...dataOrigins],
    'frame-src': ["'self'", ...FRAME_ORIGINS],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    ...ENFORCED_CSP,
  };
}

/** `{ 'a': ['x', 'y'] }` → `a x y`, directives joined with `; `. */
export function serializePolicy(policy: Policy): string {
  return Object.entries(policy)
    .map(([directive, sources]) => [directive, ...sources].join(' '))
    .join('; ');
}

/**
 * Sentry's security-report endpoint for a DSN
 * (`https://<key>@<host>/<project>` → `https://<host>/api/<project>/security/?sentry_key=<key>`),
 * or `null` for a DSN that is missing or not in that form.
 */
export function sentryCspReportUri(dsn: string | undefined): string | null {
  if (!dsn?.trim()) return null;
  try {
    const url = new URL(dsn.trim());
    const project = url.pathname.replace(/^\/+|\/+$/g, '');
    if (url.protocol !== 'https:' || !url.username || !/^\d+$/.test(project)) return null;
    return `https://${url.host}/api/${project}/security/?sentry_key=${url.username}`;
  } catch {
    return null;
  }
}

/** The headers `next.config.ts` applies to `/(.*)`. */
export function securityHeaders({
  development = false,
  sentryDsn,
  dataEndpoints = [],
}: SecurityHeaderOptions = {}): SecurityHeader[] {
  const reportUri = sentryCspReportUri(sentryDsn);
  // Only plain-http origins need naming: `https:` already covers the rest.
  const httpOrigins = originsOf(dataEndpoints).filter((origin) => origin.startsWith('http:'));
  const reportOnly = serializePolicy(reportOnlyPolicy(development, httpOrigins));
  return [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' },
    { key: 'Content-Security-Policy', value: serializePolicy(ENFORCED_CSP) },
    {
      key: 'Content-Security-Policy-Report-Only',
      value: reportUri ? `${reportOnly}; report-uri ${reportUri}` : reportOnly,
    },
  ];
}
