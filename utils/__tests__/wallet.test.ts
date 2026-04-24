import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
  MARKETING_WALLET_ADDRESS,
  RAFFLE_WALLET_ADDRESS,
  CHARITY_WALLET_ADDRESS,
} from '@/config/networks';

import { isWalletAddress } from '../wallet';

describe('isWalletAddress', () => {
  it('returns "CST Anchoring Wallet" for the CST anchoring address', () => {
    expect(isWalletAddress(STAKING_WALLET_CST_ADDRESS)).toBe('CST Anchoring Wallet');
  });

  it('returns "RandomWalk Anchoring Wallet" for the RWLK anchoring address', () => {
    expect(isWalletAddress(STAKING_WALLET_RWLK_ADDRESS)).toBe('RandomWalk Anchoring Wallet');
  });

  it('returns "Outreach Wallet" for the outreach address', () => {
    expect(isWalletAddress(MARKETING_WALLET_ADDRESS)).toBe('Outreach Wallet');
  });

  it('returns "Stellar Selection Wallet" for the stellar-selection address', () => {
    expect(isWalletAddress(RAFFLE_WALLET_ADDRESS)).toBe('Stellar Selection Wallet');
  });

  it('returns "Public Goods Vault" for the public-goods address', () => {
    expect(isWalletAddress(CHARITY_WALLET_ADDRESS)).toBe('Public Goods Vault');
  });

  it('returns empty string for an unknown address', () => {
    expect(isWalletAddress('0x0000000000000000000000000000000000000000')).toBe('');
  });

  it('returns empty string for an empty string', () => {
    expect(isWalletAddress('')).toBe('');
  });

  it('is case-sensitive (lowercase variant returns empty)', () => {
    const lower = STAKING_WALLET_CST_ADDRESS.toLowerCase();
    if (lower !== STAKING_WALLET_CST_ADDRESS) {
      expect(isWalletAddress(lower)).toBe('');
    }
  });
});
