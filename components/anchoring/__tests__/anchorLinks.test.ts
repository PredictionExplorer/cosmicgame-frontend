import {
  anchorActionHref,
  anchorTokenHref,
  collectionFromRouteFlag,
  tokenDistributionsHref,
} from '../anchorLinks';

describe('anchorLinks', () => {
  it('reads the collection from the route flag', () => {
    expect(collectionFromRouteFlag(0)).toBe('cosmicSignature');
    expect(collectionFromRouteFlag(1)).toBe('randomWalk');
    expect(collectionFromRouteFlag(true)).toBe('randomWalk');
  });

  it('links a Cosmic Signature to the gallery and a Random Walk NFT to its own site', () => {
    expect(anchorTokenHref('cosmicSignature', 25)).toBe('/detail/25');
    expect(anchorTokenHref('randomWalk', 1826)).toBe('https://randomwalknft.com/detail/1826');
  });

  it('builds the anchor-action record route with the collection flag', () => {
    expect(anchorActionHref('cosmicSignature', 12)).toBe('/anchor-action/0/12');
    expect(anchorActionHref('randomWalk', 33)).toBe('/anchor-action/1/33');
  });

  it('builds the per-token distributions route', () => {
    expect(tokenDistributionsHref('0xabc', 7)).toBe('/distributions-by-token/0xabc/7');
  });
});
