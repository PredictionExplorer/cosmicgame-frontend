'use client';

import dynamic from 'next/dynamic';

/*
 * The global 404's two pages, each behind its own dynamic import. Next.js
 * ships app/global-not-found.tsx's client references with every route, so
 * any component it imported directly (the providers, the headers, the
 * footer's islands) would join every page's first download, and the shared
 * ones would be split into duplicate chunks there. Behind next/dynamic, a
 * page's code downloads only when that 404 renders; it still renders on the
 * server, complete. Two modules, so a landing 404 never loads the app's
 * wallet stack.
 */

/** The 404 in the app host's chrome (app/not-found-app-page.tsx). */
export const AppNotFound = dynamic(() => import('./not-found-app-page'));

/** The 404 in the landing host's chrome (app/not-found-landing-page.tsx). */
export const LandingNotFound = dynamic(() => import('./not-found-landing-page'));
