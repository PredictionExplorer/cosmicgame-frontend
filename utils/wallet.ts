import { getCachedDashboardContractAddresses, type AppContractAddresses } from '@/config/networks';

function addrEq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export type WalletKind =
  | 'cosmicSignatureAnchoring'
  | 'randomWalkAnchoring'
  | 'outreach'
  | 'stellarSelection'
  | 'publicGoods';

const WALLET_LABELS: Record<WalletKind, string> = {
  cosmicSignatureAnchoring: 'Cosmic Signature NFT Anchoring Wallet',
  randomWalkAnchoring: 'RandomWalk Anchoring Wallet',
  outreach: 'Outreach Wallet',
  stellarSelection: 'Stellar Selection Wallet',
  publicGoods: 'Public Goods Vault',
};

/** Stable identifier for a known system wallet, suitable for localized label lookup. */
export const getWalletKind = (
  address: string,
  resolved?: AppContractAddresses,
): WalletKind | null => {
  if (!address) return null;
  const addrs = resolved ?? getCachedDashboardContractAddresses();
  if (addrEq(address, addrs.stakingCst)) return 'cosmicSignatureAnchoring';
  if (addrEq(address, addrs.stakingRwalk)) return 'randomWalkAnchoring';
  if (addrEq(address, addrs.marketing)) return 'outreach';
  if (addrEq(address, addrs.prizesWallet)) return 'stellarSelection';
  if (addrEq(address, addrs.charity)) return 'publicGoods';
  return null;
};

/**
 * Human-readable label for known system contract/wallet addresses.
 * Uses dashboard-merged addresses when `resolved` is passed (e.g. from `useContractAddresses()`).
 */
export const isWalletAddress = (address: string, resolved?: AppContractAddresses): string => {
  const kind = getWalletKind(address, resolved);
  return kind ? WALLET_LABELS[kind] : '';
};
