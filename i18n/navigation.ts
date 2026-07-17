import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware wrappers around Next.js navigation APIs.
 *
 * ALWAYS import `Link`, `useRouter`, `usePathname`, `redirect`, and
 * `permanentRedirect` from here instead of `next/link` / `next/navigation`
 * (enforced by the `no-restricted-imports` ESLint rule). These wrappers keep
 * the user inside their current locale: a click on `/gallery` from a `/zh`
 * page navigates to `/zh/gallery`.
 *
 * `usePathname` returns the pathname WITHOUT the locale prefix, which is what
 * nav active-state checks expect.
 */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
