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

/**
 * Contract names and descriptions come from the `contracts` message catalog
 * (`entries.*`) — callers translate for the active locale and pass the copy
 * in, so no English defaults live here.
 */
export type ContractEntryCopy = Record<
  ContractEntryId,
  Pick<ContractEntry, 'name' | 'description'>
>;

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
  copy: ContractEntryCopy,
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
  labels: Record<string, string>,
) {
  return Object.entries(getDisplayContractAddresses(apiAddrs))
    .filter((entry): entry is [string, string] => isAddress(entry[1]))
    .map(([key, address]) => ({
      key,
      label: labels[key] ?? key,
      address,
    }));
}
