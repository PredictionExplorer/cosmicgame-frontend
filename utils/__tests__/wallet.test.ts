import {
  STAKING_WALLET_CST_ADDRESS,
  STAKING_WALLET_RWLK_ADDRESS,
  MARKETING_WALLET_ADDRESS,
  RAFFLE_WALLET_ADDRESS,
  CHARITY_WALLET_ADDRESS,
} from '@/config/networks';

import { isWalletAddress } from '../wallet';

describe('isWalletAddress', () => {
  it('returns "Staking CST Wallet" for the CST staking address', () => {
    expect(isWalletAddress(STAKING_WALLET_CST_ADDRESS)).toBe('Staking CST Wallet');
  });

  it('returns "Staking RandomWalk Wallet" for the RWLK staking address', () => {
    expect(isWalletAddress(STAKING_WALLET_RWLK_ADDRESS)).toBe('Staking RandomWalk Wallet');
  });

  it('returns "Marketing Wallet" for the marketing address', () => {
    expect(isWalletAddress(MARKETING_WALLET_ADDRESS)).toBe('Marketing Wallet');
  });

  it('returns "Raffle Wallet" for the raffle address', () => {
    expect(isWalletAddress(RAFFLE_WALLET_ADDRESS)).toBe('Raffle Wallet');
  });

  it('returns "Charity Wallet" for the charity address', () => {
    expect(isWalletAddress(CHARITY_WALLET_ADDRESS)).toBe('Charity Wallet');
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
