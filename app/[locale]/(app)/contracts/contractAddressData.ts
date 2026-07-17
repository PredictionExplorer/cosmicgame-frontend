import { protocolFacts } from '@/content/protocol-facts';

import type { ContractAddresses } from '@/services/api/types';

export type ContractCategory = 'core' | 'wallet' | 'anchoring';

export interface ContractEntry {
  name: string;
  address: string;
  description: string;
  category: ContractCategory;
}

export const CONTRACT_LABELS: Record<string, string> = {
  CosmicGameAddr: 'Cosmic Signature Protocol',
  ImplementationAddr: 'Implementation Contract',
  CosmicTokenAddr: 'Cosmic Signature CST Token',
  CosmicSignatureAddr: 'Cosmic Signature NFT',
  RandomWalkAddr: 'RandomWalk NFT',
  CosmicDaoAddr: 'Cosmic Council',
  CharityWalletAddr: 'Public Goods Vault',
  PrizesWalletAddr: 'Allocations Wallet',
  StakingWalletCSTAddr: 'Cosmic Signature NFT Anchoring Wallet',
  StakingWalletRWalkAddr: 'RWLK Anchoring Wallet',
  MarketingWalletAddr: 'Outreach Reserve',
};

const STATIC_MAINNET_CONTRACTS = {
  CosmicGameAddr: protocolFacts.contractAddresses.proxy,
  ImplementationAddr: protocolFacts.contractAddresses.implementation,
} satisfies Partial<ContractAddresses>;

export function isAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function getDisplayContractAddresses(
  apiAddrs: ContractAddresses | undefined | null,
): Partial<ContractAddresses> {
  return {
    ...STATIC_MAINNET_CONTRACTS,
    ...(apiAddrs ?? {}),
    // The dashboard can lag a proxy upgrade; the frontend fact is verified from
    // the proxy's EIP-1967 implementation slot and should win for this field.
    ImplementationAddr: STATIC_MAINNET_CONTRACTS.ImplementationAddr,
  };
}

export function buildContracts(apiAddrs: ContractAddresses | undefined | null): ContractEntry[] {
  const addrs = getDisplayContractAddresses(apiAddrs);
  const contracts: ContractEntry[] = [
    {
      name: 'Cosmic Signature Protocol',
      address: addrs.CosmicGameAddr ?? '',
      description:
        'The main protocol proxy contract that manages cycles, gestures, and allocation distribution',
      category: 'core',
    },
    {
      name: 'Implementation Contract',
      address: addrs.ImplementationAddr ?? '',
      description: 'The current implementation behind the Cosmic Signature Protocol proxy contract',
      category: 'core',
    },
    {
      name: 'Cosmic Signature CST Token',
      address: addrs.CosmicTokenAddr ?? '',
      description:
        'ERC-20 token (CST) imprinted with every gesture and used to express Coordination Weight on the Cosmic Council',
      category: 'core',
    },
    {
      name: 'Cosmic Signature NFT',
      address: addrs.CosmicSignatureAddr ?? '',
      description: 'ERC-721 NFT collection imprinted as allocations to cycle recipients',
      category: 'core',
    },
    {
      name: 'RandomWalk',
      address: addrs.RandomWalkAddr ?? '',
      description:
        'RandomWalk NFT collection that can be attached to ETH gestures for a one-time discount or anchored for Anchored-NFT Stellar Selection eligibility',
      category: 'core',
    },
    {
      name: 'Cosmic Council',
      address: addrs.CosmicDaoAddr ?? '',
      description: 'On-chain Protocol Coordination contract for Coordination Proposals',
      category: 'core',
    },
    {
      name: 'Public Goods Vault',
      address: addrs.CharityWalletAddr ?? '',
      description: "Receives the Public Goods Allocation from each cycle's Cycle Reserve",
      category: 'wallet',
    },
    {
      name: 'Outreach Reserve',
      address: addrs.MarketingWalletAddr ?? '',
      description: 'Funds allocated for outreach distributions and ecosystem contributors',
      category: 'wallet',
    },
    {
      name: 'Allocations Wallet',
      address: addrs.PrizesWalletAddr ?? '',
      description: 'Escrow contract holding allocations awaiting retrieval',
      category: 'wallet',
    },
    {
      name: 'Cosmic Signature NFT Anchoring Wallet',
      address: addrs.StakingWalletCSTAddr ?? '',
      description: 'Anchoring contract for Cosmic Signature NFTs',
      category: 'anchoring',
    },
    {
      name: 'RWLK Anchoring Wallet',
      address: addrs.StakingWalletRWalkAddr ?? '',
      description: 'Anchoring contract for RandomWalk NFTs',
      category: 'anchoring',
    },
  ];

  return contracts.filter((c) => c.address);
}

export function getSeoContractAddressEntries(apiAddrs: ContractAddresses | undefined | null) {
  return Object.entries(getDisplayContractAddresses(apiAddrs))
    .filter((entry): entry is [string, string] => isAddress(entry[1]))
    .map(([key, address]) => ({
      key,
      label: CONTRACT_LABELS[key] ?? key,
      address,
    }));
}
