/**
 * Where anchoring records live. Pure and server-safe, so server pages,
 * client tables and tests build the same links.
 */

/** The two collections that can be anchored. */
export type AnchorCollection = 'cosmicSignature' | 'randomWalk';

/** The collection of an anchor-action route segment (`/anchor-action/1/…` is Random Walk). */
export function collectionFromRouteFlag(isRwalk: number | boolean): AnchorCollection {
  return isRwalk ? 'randomWalk' : 'cosmicSignature';
}

/** An NFT's own page: the gallery detail, or its page on randomwalknft.com. */
export function anchorTokenHref(collection: AnchorCollection, tokenId: number): string {
  return collection === 'randomWalk'
    ? `https://randomwalknft.com/detail/${tokenId}`
    : `/detail/${tokenId}`;
}

/** The record of one anchor action (the anchor and, once released, its release). */
export function anchorActionHref(collection: AnchorCollection, actionId: number): string {
  return `/anchor-action/${collection === 'randomWalk' ? 1 : 0}/${actionId}`;
}

/** Every ETH Anchor Distribution deposit one anchored Cosmic Signature NFT received. */
export function tokenDistributionsHref(address: string, tokenId: number): string {
  return `/distributions-by-token/${address}/${tokenId}`;
}
