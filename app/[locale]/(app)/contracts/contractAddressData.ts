import { protocolFacts } from '@/content/protocol-facts';

import type { ContractAddresses } from '@/services/api/types';

export type ContractCategory = 'core' | 'wallet' | 'anchoring';
export const CONTRACT_ENTRY_IDS = [
  'protocol',
  'implementation',
  'cst',
  'nft',
  'randomWalk',
  'council',
  'publicGoods',
  'outreach',
  'allocations',
  'cosmicAnchor',
  'rwalkAnchor',
] as const;
export type ContractEntryId = (typeof CONTRACT_ENTRY_IDS)[number];

export interface ContractEntry {
  id: ContractEntryId;
  name: string;
  address: string;
  description: string;
  category: ContractCategory;
}

export type ContractEntryCopy = Record<
  ContractEntryId,
  Pick<ContractEntry, 'name' | 'description'>
>;

export const CONTRACT_ENTRY_COPY_EN: ContractEntryCopy = {
  protocol: {
    name: 'Cosmic Signature Protocol',
    description:
      'The main protocol proxy contract that manages cycles, gestures, and allocation distribution',
  },
  implementation: {
    name: 'Implementation Contract',
    description: 'The current implementation behind the Cosmic Signature Protocol proxy contract',
  },
  cst: {
    name: 'Cosmic Signature CST Token',
    description:
      'ERC-20 token (CST) imprinted with every gesture and used to express Coordination Weight on the Cosmic Council',
  },
  nft: {
    name: 'Cosmic Signature NFT',
    description: 'ERC-721 NFT collection imprinted as allocations to cycle recipients',
  },
  randomWalk: {
    name: 'RandomWalk',
    description:
      'RandomWalk NFT collection that can be attached to ETH gestures for a one-time discount or anchored for Anchored-NFT Stellar Selection eligibility',
  },
  council: {
    name: 'Cosmic Council',
    description: 'On-chain Protocol Coordination contract for Coordination Proposals',
  },
  publicGoods: {
    name: 'Public Goods Vault',
    description: "Receives the Public Goods Allocation from each cycle's Cycle Reserve",
  },
  outreach: {
    name: 'Outreach Reserve',
    description: 'Funds allocated for outreach distributions and ecosystem contributors',
  },
  allocations: {
    name: 'Allocations Wallet',
    description: 'Escrow contract holding allocations awaiting retrieval',
  },
  cosmicAnchor: {
    name: 'Cosmic Signature NFT Anchoring Wallet',
    description: 'Anchoring contract for Cosmic Signature NFTs',
  },
  rwalkAnchor: {
    name: 'RWLK Anchoring Wallet',
    description: 'Anchoring contract for RandomWalk NFTs',
  },
};

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

export function buildContracts(
  apiAddrs: ContractAddresses | undefined | null,
  copy: ContractEntryCopy = CONTRACT_ENTRY_COPY_EN,
): ContractEntry[] {
  const addrs = getDisplayContractAddresses(apiAddrs);
  const contracts: ContractEntry[] = [
    {
      id: 'protocol',
      ...copy.protocol,
      address: addrs.CosmicGameAddr ?? '',
      category: 'core',
    },
    {
      id: 'implementation',
      ...copy.implementation,
      address: addrs.ImplementationAddr ?? '',
      category: 'core',
    },
    {
      id: 'cst',
      ...copy.cst,
      address: addrs.CosmicTokenAddr ?? '',
      category: 'core',
    },
    {
      id: 'nft',
      ...copy.nft,
      address: addrs.CosmicSignatureAddr ?? '',
      category: 'core',
    },
    {
      id: 'randomWalk',
      ...copy.randomWalk,
      address: addrs.RandomWalkAddr ?? '',
      category: 'core',
    },
    {
      id: 'council',
      ...copy.council,
      address: addrs.CosmicDaoAddr ?? '',
      category: 'core',
    },
    {
      id: 'publicGoods',
      ...copy.publicGoods,
      address: addrs.CharityWalletAddr ?? '',
      category: 'wallet',
    },
    {
      id: 'outreach',
      ...copy.outreach,
      address: addrs.MarketingWalletAddr ?? '',
      category: 'wallet',
    },
    {
      id: 'allocations',
      ...copy.allocations,
      address: addrs.PrizesWalletAddr ?? '',
      category: 'wallet',
    },
    {
      id: 'cosmicAnchor',
      ...copy.cosmicAnchor,
      address: addrs.StakingWalletCSTAddr ?? '',
      category: 'anchoring',
    },
    {
      id: 'rwalkAnchor',
      ...copy.rwalkAnchor,
      address: addrs.StakingWalletRWalkAddr ?? '',
      category: 'anchoring',
    },
  ];

  return contracts.filter((c) => c.address);
}

export function getSeoContractAddressEntries(
  apiAddrs: ContractAddresses | undefined | null,
  labels: Record<string, string> = CONTRACT_LABELS,
) {
  return Object.entries(getDisplayContractAddresses(apiAddrs))
    .filter((entry): entry is [string, string] => isAddress(entry[1]))
    .map(([key, address]) => ({
      key,
      label: labels[key] ?? key,
      address,
    }));
}
