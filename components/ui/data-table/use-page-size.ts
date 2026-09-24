'use client';

import { useSyncExternalStore } from 'react';

/** Rows per page from `sm` up. */
export const DEFAULT_PAGE_SIZE = 20;

/** Rows per page on a phone, where a record is several lines tall (about two screens). */
export const PHONE_PAGE_SIZE = 10;

/** The width below which tables switch to their phone layout; matches styles/tables.css. */
const PHONE_QUERY = '(max-width: 39.99em)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(PHONE_QUERY).matches;
}

/** The server renders the wide layout; phones switch after hydration. */
function getServerSnapshot(): boolean {
  return false;
}

/** True while the viewport is narrow enough for the phone table layout. */
export function usePhoneLayout(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Rows per page: {@link DEFAULT_PAGE_SIZE}, or {@link PHONE_PAGE_SIZE} on a phone. */
export function useTablePageSize(): number {
  return usePhoneLayout() ? PHONE_PAGE_SIZE : DEFAULT_PAGE_SIZE;
}
