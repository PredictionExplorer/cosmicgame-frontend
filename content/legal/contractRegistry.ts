import { protocolFacts } from '@/content/protocol-facts';

import { activeChain } from '@/config/chains';
import type { ContractAddresses } from '@/services/api/types';

import { ARBITRUM_ONE_CHAIN_ID } from './officialAddresses';

/**
 * Every Cosmic Signature contract, for the one address list (/contracts) and
 * the operator settings: on Arbitrum One the addresses are the verified set
 * in `protocolFacts`, whatever the indexer answers, so a trust page never
 * loses a contract to an outage and the API never silently replaces a
 * verified address. The indexer's answer is kept only to show drift.
 */

/** The address list's groups, in reading order. */
export const CONTRACT_CATEGORIES = ['core', 'wallet', 'anchoring'] as const;
export type ContractCategory = (typeof CONTRACT_CATEGORIES)[number];

type ProtocolAddressKey = keyof typeof protocolFacts.contractAddresses;

/** Each contract: its group, its verified address, and the dashboard field that reports it. */
const REGISTRY = [
  { id: 'protocol', category: 'core', verified: 'proxy', api: 'CosmicGameAddr' },
  { id: 'implementation', category: 'core', verified: 'implementation', api: 'ImplementationAddr' },
  { id: 'cst', category: 'core', verified: 'cstToken', api: 'CosmicTokenAddr' },
  { id: 'nft', category: 'core', verified: 'cosmicSignatureNft', api: 'CosmicSignatureAddr' },
  { id: 'randomWalk', category: 'core', verified: 'randomWalkNft', api: 'RandomWalkAddr' },
  { id: 'council', category: 'core', verified: 'cosmicCouncil', api: 'CosmicDaoAddr' },
  { id: 'publicGoods', category: 'wallet', verified: 'publicGoodsVault', api: 'CharityWalletAddr' },
  { id: 'outreach', category: 'wallet', verified: 'outreachReserve', api: 'MarketingWalletAddr' },
  { id: 'allocations', category: 'wallet', verified: 'allocationsWallet', api: 'PrizesWalletAddr' },
  {
    id: 'cosmicAnchor',
    category: 'anchoring',
    verified: 'cosmicSignatureNftAnchoringWallet',
    api: 'StakingWalletCSTAddr',
  },
  {
    id: 'rwalkAnchor',
    category: 'anchoring',
    verified: 'rwlkAnchoringWallet',
    api: 'StakingWalletRWalkAddr',
  },
] as const satisfies readonly {
  id: string;
  category: ContractCategory;
  verified: ProtocolAddressKey;
  api: keyof ContractAddresses;
}[];

export const CONTRACT_ENTRY_IDS = REGISTRY.map((entry) => entry.id);
export type ContractEntryId = (typeof REGISTRY)[number]['id'];

export interface ContractEntry {
  id: ContractEntryId;
  name: string;
  address: string;
  description: string;
  category: ContractCategory;
  /**
   * The address the indexer reports when it differs from the verified one:
   * shown as a caption, never in its place.
   */
  reported?: string;
}

/**
 * Contract names and descriptions come from the `contracts` message catalog
 * (`entries.*`); callers translate for the active locale and pass the copy in.
 */
export type ContractEntryCopy = Record<
  ContractEntryId,
  Pick<ContractEntry, 'name' | 'description'>
>;

/** The catalog copy of every entry, from a `contracts` translator. */
export function contractEntryCopy(t: (key: string) => string): ContractEntryCopy {
  return Object.fromEntries(
    CONTRACT_ENTRY_IDS.map((id) => [
      id,
      { name: t(`entries.${id}.name`), description: t(`entries.${id}.description`) },
    ]),
  ) as ContractEntryCopy;
}

/** Whether this build shows the verified Arbitrum One set (every other network shows the API's). */
export const SHOWS_VERIFIED_CONTRACTS = activeChain.id === ARBITRUM_ONE_CHAIN_ID;

/**
 * The contract list. With `verified` (Arbitrum One) every address is the
 * verified one and the indexer's differing answer rides along as `reported`;
 * otherwise (a test network) the list is what the indexer reports, and a
 * contract it does not report is left out.
 */
export function buildContracts(
  apiAddrs: ContractAddresses | undefined | null,
  copy: ContractEntryCopy,
  { verified = SHOWS_VERIFIED_CONTRACTS }: { verified?: boolean } = {},
): ContractEntry[] {
  return REGISTRY.flatMap(({ id, category, verified: verifiedKey, api }) => {
    const reportedAddress = apiAddrs?.[api]?.trim() || '';
    if (!verified) {
      return reportedAddress ? [{ id, category, ...copy[id], address: reportedAddress }] : [];
    }
    const address = protocolFacts.contractAddresses[verifiedKey];
    // The dashboard lags a proxy upgrade (it still reports the implementation
    // before V2); the verified one is read from the proxy's EIP-1967 slot, so
    // a different implementation from the API is not drift.
    const drifted =
      id !== 'implementation' &&
      reportedAddress !== '' &&
      reportedAddress.toLowerCase() !== address.toLowerCase();
    return [
      { id, category, ...copy[id], address, ...(drifted ? { reported: reportedAddress } : {}) },
    ];
  });
}
