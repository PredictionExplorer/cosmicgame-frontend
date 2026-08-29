import { getAttachedAssetValues, getAttachedAssetVariant } from '@/lib/attachedAssets';

describe('attached allocation asset copy helpers', () => {
  it.each([
    { nftCount: 0, erc20Count: 0, variant: 'base' },
    { nftCount: 2, erc20Count: 0, variant: 'withNft' },
    { nftCount: 0, erc20Count: 3, variant: 'withErc20' },
    { nftCount: 2, erc20Count: 3, variant: 'withBoth' },
  ] as const)('selects $variant for $nftCount NFTs and $erc20Count tokens', (sample) => {
    expect(getAttachedAssetVariant(sample.nftCount, sample.erc20Count)).toBe(sample.variant);
  });

  it('only supplies interpolation values required by the selected variant', () => {
    expect(getAttachedAssetValues('base', 2, 3)).toEqual({});
    expect(getAttachedAssetValues('withNft', 2, 3)).toEqual({ nftCount: 2 });
    expect(getAttachedAssetValues('withErc20', 2, 3)).toEqual({ erc20Count: 3 });
    expect(getAttachedAssetValues('withBoth', 2, 3)).toEqual({
      nftCount: 2,
      erc20Count: 3,
    });
  });
});
