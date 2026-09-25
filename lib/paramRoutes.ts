import { LEARN_STRUCTURE } from '@/content/learn/structure';
import { QUIZ_TIER_IDS } from '@/content/quiz/types';

import {
  parseCanonicalNonNegativeSafeInteger,
  parseGestureId,
  parseTokenId,
} from '@/utils/routeParams';

const LEARN_SLUGS: ReadonlySet<string> = new Set(
  LEARN_STRUCTURE.articles.map((article) => article.slug),
);
const QUIZ_TIERS: ReadonlySet<string> = new Set(QUIZ_TIER_IDS);

/**
 * The pages whose last path segment is a parameter, and the values each one
 * serves: the same test its route applies (a layout or page that calls
 * `notFound()`, or the prerendered list of a route with `dynamicParams =
 * false`).
 */
const PARAM_ROUTES: readonly { prefix: string; serves: (param: string) => boolean }[] = [
  { prefix: '/detail', serves: (id) => parseTokenId(id) !== null },
  { prefix: '/gesture', serves: (id) => parseGestureId(id) !== null },
  { prefix: '/allocation', serves: (id) => parseCanonicalNonNegativeSafeInteger(id) !== null },
  {
    prefix: '/embed/endurance',
    serves: (cycle) => parseCanonicalNonNegativeSafeInteger(cycle) !== null,
  },
  { prefix: '/learn', serves: (slug) => LEARN_SLUGS.has(slug) },
  { prefix: '/quiz', serves: (tier) => QUIZ_TIERS.has(tier) },
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
 * Whether a locale-stripped public path names one of those pages with a
 * parameter it does not serve (`/detail/abc`, `/allocation/01`,
 * `/learn/no-such-guide`). Left to routing, the first kind reaches the
 * browser as Next.js's bare error shell (a segment's `notFound()`), blank and
 * unstyled until the app bundle runs, and the second logs an internal
 * NoFallbackError on every request. proxy.ts answers both with the global
 * 404 before routing, which renders on the server. Deeper paths
 * (`/detail/25/opengraph-image`) are left to their routes.
 */
export function isRejectedParamPath(publicPath: string): boolean {
  for (const { prefix, serves } of PARAM_ROUTES) {
    if (!publicPath.startsWith(`${prefix}/`)) continue;
    const segment = publicPath.slice(prefix.length + 1).replace(/\/$/, '');
    if (segment.includes('/')) return false;
    const param = decodeSegment(segment);
    return param === null || !serves(param);
  }
  return false;
}
