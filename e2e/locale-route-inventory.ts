/**
 * Locale-neutral view of the page inventory under app/[locale].
 *
 * The route list itself (page files, public paths, fixtures, hosts, index
 * policy) is language-independent, so it is derived from the checked-in
 * Sprint 8 inventory rather than duplicated. What differs per language is
 * only the text a rendered route must contain — that lives in
 * ./locale-fixtures.ts, one table per translated locale, so adding a locale
 * to the e2e suite means adding one table and one three-line spec file.
 */

import {
  ZH_ROUTE_FIXTURES,
  ZH_ROUTE_INVENTORY,
  type ZhRouteCluster,
  type ZhRouteHost,
  type ZhRouteInventoryEntry,
} from './zh-route-inventory';

export type LocaleRouteHost = ZhRouteHost;
export type LocaleRouteCluster = ZhRouteCluster;

export type LocaleRouteEntry = Omit<ZhRouteInventoryEntry, 'expectedText'>;

export const ROUTE_FIXTURES = ZH_ROUTE_FIXTURES;

export const LOCALE_ROUTE_INVENTORY: readonly LocaleRouteEntry[] = ZH_ROUTE_INVENTORY.map(
  ({ expectedText: _expectedText, ...entry }) => entry,
);

export const LOCALE_ROUTE_IDS: readonly string[] = LOCALE_ROUTE_INVENTORY.map((entry) => entry.id);

/** `/gallery` → `/uk/gallery`, `/` → `/uk`. */
export function toLocalePath(locale: string, path: string): string {
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}
