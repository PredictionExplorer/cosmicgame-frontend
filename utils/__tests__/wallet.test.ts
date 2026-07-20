import type { AppContractAddresses } from '@/config/networks';

import { getWalletKind, isWalletAddress } from '../wallet';

const SAMPLE_WALLETS: AppContractAddresses = {
  randomWalkNft: '',
  cosmicGame: '',
  cosmicSignature: '',
  cosmicToken: '',
  cosmicDao: '',
  charity: '0xaa00000000000000000000000000000000000001',
  prizesWallet: '0xaa00000000000000000000000000000000000002',
  stakingCst: '0xAa00000000000000000000000000000000000003',
  stakingRwalk: '0xaa00000000000000000000000000000000000004',
  marketing: '0xaa00000000000000000000000000000000000005',
  implementation: '',
};

describe('getWalletKind', () => {
  it.each([
    ['cosmicSignatureAnchoring', SAMPLE_WALLETS.stakingCst],
    ['randomWalkAnchoring', SAMPLE_WALLETS.stakingRwalk],
    ['outreach', SAMPLE_WALLETS.marketing],
    ['stellarSelection', SAMPLE_WALLETS.prizesWallet],
    ['publicGoods', SAMPLE_WALLETS.charity],
  ] as const)('returns the stable %s kind', (expectedKind, address) => {
    expect(getWalletKind(address, SAMPLE_WALLETS)).toBe(expectedKind);
  });

  it('returns null for unknown and empty addresses', () => {
    expect(getWalletKind('0x0000000000000000000000000000000000000000', SAMPLE_WALLETS)).toBeNull();
    expect(getWalletKind('', SAMPLE_WALLETS)).toBeNull();
  });
});

describe('isWalletAddress', () => {
  it('returns Cosmic Signature NFT anchoring label for the CST anchoring address', () => {
    expect(isWalletAddress(SAMPLE_WALLETS.stakingCst, SAMPLE_WALLETS)).toBe(
      'Cosmic Signature NFT Anchoring Wallet',
    );
  });

  it('returns "RandomWalk Anchoring Wallet" for the RWLK anchoring address', () => {
    expect(isWalletAddress(SAMPLE_WALLETS.stakingRwalk, SAMPLE_WALLETS)).toBe(
      'RandomWalk Anchoring Wallet',
    );
  });

  it('returns "Outreach Wallet" for the outreach address', () => {
    expect(isWalletAddress(SAMPLE_WALLETS.marketing, SAMPLE_WALLETS)).toBe('Outreach Wallet');
  });

  it('returns "Stellar Selection Wallet" for the stellar-selection address', () => {
    expect(isWalletAddress(SAMPLE_WALLETS.prizesWallet, SAMPLE_WALLETS)).toBe(
      'Stellar Selection Wallet',
    );
  });

  it('returns "Public Goods Vault" for the public-goods address', () => {
    expect(isWalletAddress(SAMPLE_WALLETS.charity, SAMPLE_WALLETS)).toBe('Public Goods Vault');
  });

  it('returns empty string for an unknown address', () => {
    expect(isWalletAddress('0x0000000000000000000000000000000000000000', SAMPLE_WALLETS)).toBe('');
  });

  it('returns empty string for an empty string', () => {
    expect(isWalletAddress('', SAMPLE_WALLETS)).toBe('');
  });

  it('matches known wallets case-insensitively', () => {
    const lower = SAMPLE_WALLETS.stakingCst.toLowerCase();
    if (lower !== SAMPLE_WALLETS.stakingCst) {
      expect(isWalletAddress(lower, SAMPLE_WALLETS)).toBe('Cosmic Signature NFT Anchoring Wallet');
    }
  });
});
