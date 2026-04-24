import {
  CHARITY_WALLET_ADDRESS,
  MARKETING_WALLET_ADDRESS,
  RAFFLE_WALLET_ADDRESS,
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from '@/config/networks';

/** Returns a human-readable label for known system wallets, or empty string. */
export const isWalletAddress = (address: string): string => {
  switch (address) {
    case STAKING_WALLET_CST_ADDRESS:
      return 'CST Anchoring Wallet';
    case STAKING_WALLET_RWLK_ADDRESS:
      return 'RandomWalk Anchoring Wallet';
    case MARKETING_WALLET_ADDRESS:
      return 'Outreach Wallet';
    case RAFFLE_WALLET_ADDRESS:
      return 'Stellar Selection Wallet';
    case CHARITY_WALLET_ADDRESS:
      return 'Public Goods Vault';
    default:
      return '';
  }
};
