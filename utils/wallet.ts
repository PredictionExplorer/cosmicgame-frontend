import {
  CHARITY_WALLET_ADDRESS,
  MARKETING_WALLET_ADDRESS,
  RAFFLE_WALLET_ADDRESS,
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
} from '@/config/networks';

/** Returns a human-readable label for known system wallets (staking, charity, etc.), or empty string. */
export const isWalletAddress = (address: string): string => {
  switch (address) {
    case STAKING_WALLET_CST_ADDRESS:
      return 'Staking CST Wallet';
    case STAKING_WALLET_RWLK_ADDRESS:
      return 'Staking RandomWalk Wallet';
    case MARKETING_WALLET_ADDRESS:
      return 'Marketing Wallet';
    case RAFFLE_WALLET_ADDRESS:
      return 'Raffle Wallet';
    case CHARITY_WALLET_ADDRESS:
      return 'Charity Wallet';
    default:
      return '';
  }
};
