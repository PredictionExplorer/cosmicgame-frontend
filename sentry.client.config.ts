import * as Sentry from '@sentry/nextjs';

/**
 * Client Sentry stays error-capture-only at boot.
 *
 * Session replay and browser tracing added ~80 KB of gzip to the entry
 * bundle of every page for every visitor. Replay (error-sampled) is instead
 * lazy-loaded from Sentry's CDN after the page settles, so the bundle never
 * carries it; errors thrown in the first idle seconds simply lack a replay,
 * which is an accepted trade for the mobile bundle-size win. Client-side
 * performance tracing is intentionally off — Vercel Speed Insights already
 * reports field Web Vitals; server/edge tracing is unaffected (see
 * sentry.server.config.ts / sentry.edge.config.ts).
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
  const scheduleIdle =
    typeof window.requestIdleCallback === 'function'
      ? (task: () => void) => window.requestIdleCallback(task, { timeout: 5_000 })
      : (task: () => void) => window.setTimeout(task, 3_000);

  scheduleIdle(() => {
    Sentry.lazyLoadIntegration('replayIntegration')
      .then((replayIntegration) => {
        Sentry.addIntegration(replayIntegration());
      })
      .catch(() => {
        // Replay is a nice-to-have; error capture works without it.
      });
  });
}
