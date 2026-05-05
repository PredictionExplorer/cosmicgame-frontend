import {
  getCachedDashboardContractAddresses,
  type AppContractAddresses,
} from '@/config/networks';

function addrEq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Human-readable label for known system contract/wallet addresses.
 * Uses dashboard-merged addresses when `resolved` is passed (e.g. from `useContractAddresses()`).
 */
export const isWalletAddress = (address: string, resolved?: AppContractAddresses): string => {
  if (!address) return '';
  const addrs = resolved ?? getCachedDashboardContractAddresses();
  if (addrEq(address, addrs.stakingCst)) return 'CST Anchoring Wallet';
  if (addrEq(address, addrs.stakingRwalk)) return 'RandomWalk Anchoring Wallet';
  if (addrEq(address, addrs.marketing)) return 'Outreach Wallet';
  if (addrEq(address, addrs.prizesWallet)) return 'Stellar Selection Wallet';
  if (addrEq(address, addrs.charity)) return 'Public Goods Vault';
  return '';
};
