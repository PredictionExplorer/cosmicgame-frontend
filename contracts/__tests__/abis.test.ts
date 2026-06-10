import type { Abi, AbiEvent, AbiFunction } from 'viem';

import * as abis from '../abis';

const allAbis: Array<[string, Abi]> = [
  ['charityWalletAbi', abis.charityWalletAbi],
  ['cosmicDaoAbi', abis.cosmicDaoAbi],
  ['cosmicGameAbi', abis.cosmicGameAbi],
  ['cosmicSignatureAbi', abis.cosmicSignatureAbi],
  ['cosmicTokenAbi', abis.cosmicTokenAbi],
  ['ethDonationsAbi', abis.ethDonationsAbi],
  ['prizesWalletAbi', abis.prizesWalletAbi],
  ['randomWalkNftAbi', abis.randomWalkNftAbi],
  ['stakingWalletCstAbi', abis.stakingWalletCstAbi],
  ['stakingWalletRwlkAbi', abis.stakingWalletRwlkAbi],
  ['systemManagementAbi', abis.systemManagementAbi],
];

function eventNames(abi: Abi): string[] {
  return abi.filter((item): item is AbiEvent => item.type === 'event').map((item) => item.name);
}

function functionNames(abi: Abi): string[] {
  return abi
    .filter((item): item is AbiFunction => item.type === 'function')
    .map((item) => item.name);
}

describe('generated ABI barrel', () => {
  it.each(allAbis)('%s is a non-empty array of parsed ABI entries', (_name, abi) => {
    expect(Array.isArray(abi)).toBe(true);
    expect(abi.length).toBeGreaterThan(0);
    for (const entry of abi) {
      // Human-readable ABI strings would break viem encoding at runtime.
      expect(typeof entry).toBe('object');
      expect(typeof (entry as { type?: unknown }).type).toBe('string');
    }
  });

  it('exposes the BidPlaced event the live refresh watcher depends on', () => {
    expect(eventNames(abis.cosmicGameAbi)).toContain('BidPlaced');
  });

  it('parses the human-readable CosmicDAO ABI into structured entries', () => {
    expect(functionNames(abis.cosmicDaoAbi).length).toBeGreaterThan(0);
    expect(eventNames(abis.cosmicDaoAbi)).toContain('ProposalCreated');
  });

  it('keeps the anchoring wallets distinct', () => {
    expect(abis.stakingWalletCstAbi).not.toBe(abis.stakingWalletRwlkAbi);
  });
});
