import { parseCanonicalNonNegativeSafeInteger, parseTokenId } from '@/utils/routeParams';

/**
 * The pages whose last path segment is an id, with the parser their own
 * route guard applies to it (a layout or page that calls `notFound()`).
 */
const ID_ROUTES: readonly { prefix: string; parse: (raw: string) => number | null }[] = [
  { prefix: '/detail', parse: parseTokenId },
  { prefix: '/allocation', parse: parseCanonicalNonNegativeSafeInteger },
  { prefix: '/embed/endurance', parse: parseCanonicalNonNegativeSafeInteger },
];

/**
 * The internal path proxy.ts rewrites a missing page to, under its locale
 * (`/zh/_not-found`). An underscore folder is private in the App Router, so
 * no route can ever match it and app/global-not-found.tsx answers.
 */
export const UNMATCHED_INTERNAL_PATH = '/_not-found';

function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Whether a locale-stripped public path is one of the id pages with an id
 * that page would turn away (`/detail/abc`, `/allocation/01`). A route
 * segment's `notFound()` reaches the browser as Next.js's bare error shell,
 * blank and unstyled until the app bundle runs, so proxy.ts answers these
 * URLs with the global 404 before routing, which renders on the server.
 * Deeper paths (`/detail/25/opengraph-image`) are left to their routes.
 */
export function hasMalformedRouteId(publicPath: string): boolean {
  for (const { prefix, parse } of ID_ROUTES) {
    if (!publicPath.startsWith(`${prefix}/`)) continue;
    const segment = publicPath.slice(prefix.length + 1).replace(/\/$/, '');
    if (segment.includes('/')) return false;
    const id = decodeSegment(segment);
    return id === null || parse(id) === null;
  }
  return false;
}
