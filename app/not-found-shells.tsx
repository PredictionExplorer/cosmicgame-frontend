'use client';

import dynamic from 'next/dynamic';

/*
 * The two hosts' client shells for the global 404, each behind its own
 * dynamic import. Next.js includes app/global-not-found.tsx in every route's
 * client manifest (the router can show it on any navigation), so a static
 * import here would put the app's wallet stack into every landing page and
 * the landing shell into every app page. Behind next/dynamic, a shell's code
 * downloads only when the 404 renders; the 404 itself still renders on the
 * server, complete.
 */

/** The app host's providers, header and toaster (app/[locale]/(app)/providers.tsx). */
export const AppShell = dynamic(() =>
  import('./[locale]/(app)/providers').then((module) => module.Providers),
);

/** The landing host's light shell and header (app/[locale]/(landing)/landing-shell.tsx). */
export const LandingShell = dynamic(() =>
  import('./[locale]/(landing)/landing-shell').then((module) => module.LandingShell),
);
