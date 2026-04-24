/**
 * Lexicon-safe URL path rewrites.
 *
 * This module contains ONLY pure functions and data so it can be imported
 * from unit tests without pulling in `next/server` (which requires a
 * Request global not available in jsdom). The proxy.ts entry point
 * re-exports from this module and adds the middleware wrapper.
 */

interface PathRewrite {
  newPath: RegExp;
  toLegacy: (m: RegExpMatchArray) => string;
}

export const PATH_REWRITES: PathRewrite[] = [
  {
    newPath: /^\/current-cycle(\/.*)?$/,
    toLegacy: (m) => `/current-round${m[1] ?? ''}`,
  },
  {
    newPath: /^\/gesture\/([^/]+)$/,
    toLegacy: (m) => `/bid/${m[1]}`,
  },
  {
    newPath: /^\/allocation$/,
    toLegacy: () => '/prize',
  },
  {
    newPath: /^\/allocation\/([^/]+)$/,
    toLegacy: (m) => `/prize/${m[1]}`,
  },
  {
    newPath: /^\/allocation-finalized$/,
    toLegacy: () => '/prize-claimed',
  },
  {
    newPath: /^\/anchoring$/,
    toLegacy: () => '/staking',
  },
  {
    newPath: /^\/anchor-action\/([^/]+)\/([^/]+)$/,
    toLegacy: (m) => `/staking-action/${m[1]}/${m[2]}`,
  },
  {
    newPath: /^\/my-anchors$/,
    toLegacy: () => '/my-staking',
  },
  {
    newPath: /^\/my-allocations$/,
    toLegacy: () => '/my-winnings',
  },
  {
    newPath: /^\/public-goods-contributions-cg$/,
    toLegacy: () => '/charity-deposits-cg',
  },
  {
    newPath: /^\/public-goods-contributions-voluntary$/,
    toLegacy: () => '/charity-deposits-voluntary',
  },
  {
    newPath: /^\/public-goods-retrievals$/,
    toLegacy: () => '/charity-withdrawals',
  },
  {
    newPath: /^\/recipient-history$/,
    toLegacy: () => '/winning-history',
  },
  {
    newPath: /^\/coordination-changes$/,
    toLegacy: () => '/changed-parameters',
  },
];

/**
 * Resolves a requested pathname to its legacy handler, if it matches one of
 * the lexicon-safe aliases. Returns null if the path is already a legacy
 * path or an unrelated route.
 */
export function resolveNewPathToLegacy(pathname: string): string | null {
  for (const rule of PATH_REWRITES) {
    const match = pathname.match(rule.newPath);
    if (match) return rule.toLegacy(match);
  }
  return null;
}
