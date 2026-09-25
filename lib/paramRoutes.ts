import { LEARN_STRUCTURE } from '@/content/learn/structure';
import { QUIZ_TIER_IDS } from '@/content/quiz/types';

import {
  isAddressParam,
  isSystemEventWindowParams,
  parseAnchorActionParams,
  parseCanonicalNonNegativeSafeInteger,
  parseGestureId,
  parseTokenId,
} from '@/utils/routeParams';

const LEARN_SLUGS: ReadonlySet<string> = new Set(
  LEARN_STRUCTURE.articles.map((article) => article.slug),
);
const QUIZ_TIERS: ReadonlySet<string> = new Set(QUIZ_TIER_IDS);

/** A page whose last path segments are parameters, and the values it serves. */
interface ParamRoute {
  prefix: string;
  /** How many segments after the prefix the page takes. */
  segments: number;
  serves: (params: readonly string[]) => boolean;
}

const isCanonical = (param: string | undefined) =>
  param !== undefined && parseCanonicalNonNegativeSafeInteger(param) !== null;

/**
 * The pages whose last path segments are parameters, and the values each one
 * serves: the same test its route applies (a layout or page that calls
 * `notFound()` or draws an invalid-link state, or the prerendered list of a
 * route with `dynamicParams = false`).
 */
const PARAM_ROUTES: readonly ParamRoute[] = [
  { prefix: '/detail', segments: 1, serves: ([id = '']) => parseTokenId(id) !== null },
  { prefix: '/gesture', segments: 1, serves: ([id = '']) => parseGestureId(id) !== null },
  { prefix: '/allocation', segments: 1, serves: ([id]) => isCanonical(id) },
  { prefix: '/embed/endurance', segments: 1, serves: ([cycle]) => isCanonical(cycle) },
  {
    prefix: '/anchor-action',
    segments: 2,
    serves: ([flag = '', id = '']) => parseAnchorActionParams(flag, id) !== null,
  },
  {
    prefix: '/distributions-by-token',
    segments: 2,
    serves: ([address = '', tokenId]) => isAddressParam(address) && isCanonical(tokenId),
  },
  {
    prefix: '/system-event',
    segments: 3,
    serves: ([round = '', start = '', end = '']) => isSystemEventWindowParams(round, start, end),
  },
  { prefix: '/learn', segments: 1, serves: ([slug = '']) => LEARN_SLUGS.has(slug) },
  { prefix: '/quiz', segments: 1, serves: ([tier = '']) => QUIZ_TIERS.has(tier) },
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
 * Whether a locale-stripped public path names one of those pages with
 * parameters it does not serve (`/detail/abc`, `/allocation/01`,
 * `/anchor-action/2/5`, `/learn/no-such-guide`). Left to routing, the first
 * kind reaches the browser as Next.js's bare error shell (a segment's
 * `notFound()`), blank and unstyled until the app bundle runs, and the second
 * logs an internal NoFallbackError on every request. proxy.ts answers both
 * with the global 404 before routing, which renders on the server. Deeper
 * paths (`/detail/25/opengraph-image`) and shorter ones are left to routing.
 */
export function isRejectedParamPath(publicPath: string): boolean {
  for (const { prefix, segments, serves } of PARAM_ROUTES) {
    if (!publicPath.startsWith(`${prefix}/`)) continue;
    const raw = publicPath
      .slice(prefix.length + 1)
      .replace(/\/$/, '')
      .split('/');
    if (raw.length !== segments) return false;
    const params: string[] = [];
    for (const segment of raw) {
      const param = decodeSegment(segment);
      if (param === null) return true;
      params.push(param);
    }
    return !serves(params);
  }
  return false;
}
