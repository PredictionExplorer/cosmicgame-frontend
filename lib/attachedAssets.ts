/**
 * Copy helpers for enumerating the assets attached to the Signature Allocation.
 *
 * Shared because the Signature Allocation is stated in one place only
 * (CycleMonument's reserve); GestureStatus still uses the same variants for
 * its cycle-standing copy.
 */
export type AttachedAssetVariant = 'base' | 'withNft' | 'withErc20' | 'withBoth';

/**
 * Selects the ICU message variant for copy that enumerates the attached
 * assets included in the Signature Allocation (none / NFTs / ERC20 / both).
 */
export function getAttachedAssetVariant(
  nftCount: number,
  erc20Count: number,
): AttachedAssetVariant {
  if (nftCount > 0 && erc20Count > 0) return 'withBoth';
  if (nftCount > 0) return 'withNft';
  if (erc20Count > 0) return 'withErc20';
  return 'base';
}

export function getAttachedAssetValues(
  variant: AttachedAssetVariant,
  nftCount: number,
  erc20Count: number,
): Record<string, number> {
  if (variant === 'withBoth') return { nftCount, erc20Count };
  if (variant === 'withNft') return { nftCount };
  if (variant === 'withErc20') return { erc20Count };
  return {};
}
