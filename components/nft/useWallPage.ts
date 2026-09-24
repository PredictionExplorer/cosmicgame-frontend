'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';

/** The query parameter that holds a paged wall's page: `?page=2`. */
export const WALL_PAGE_PARAM = 'page';

/** The page a `?page=` value names; 1 for a missing or malformed value. */
export function parseWallPage(value: string | null | undefined): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/** The query string with the page set (the first page drops the parameter). */
export function wallPageSearch(search: string, page: number): string {
  const params = new URLSearchParams(search);
  if (page <= 1) params.delete(WALL_PAGE_PARAM);
  else params.set(WALL_PAGE_PARAM, String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * A paged wall's page, kept in the URL: a page is a place, so it gets a
 * history entry, and Back from an artwork's record returns to it. Reading the
 * search params renders the caller on the client in a prerendered page, so
 * the route wraps it in Suspense with the first page as the fallback (the
 * static HTML), as the gallery does.
 */
export function useWallPage(): { page: number; setPage: (next: number) => void } {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const search = searchParams.toString();
  const page = parseWallPage(searchParams.get(WALL_PAGE_PARAM));

  const setPage = useCallback(
    (next: number) => {
      router.push(`${pathname}${wallPageSearch(search, next)}`, { scroll: false });
    },
    [router, pathname, search],
  );

  return { page, setPage };
}
