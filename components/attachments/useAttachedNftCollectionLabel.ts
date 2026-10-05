import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { findKnownAddress } from '@/utils/format';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import type { AttachedNftMetadata } from './attachedNftMetadata';

/**
 * The words that name an attached NFT's collection, or `undefined` when
 * none are known and the caption shows the contract address instead.
 *
 * A protocol contract reads by its name on /contracts ("Random Walk NFT"),
 * so its on-chain name ("RandomWalkNFT") never reaches a caption. Any other
 * contract reads by the collection its metadata names, then by the contract's
 * own ERC-721 `name()`, which the server reads (`contract_name`).
 */
export function useAttachedNftCollectionLabel(
  tokenAddr: string | null | undefined,
  metadata: Pick<AttachedNftMetadata, 'collection_name' | 'contract_name'> | null | undefined,
): string | undefined {
  const tFormats = useTranslations('formats');
  const contracts = useContractAddresses();
  const knownKey = findKnownAddress(tokenAddr, {
    ...contracts,
    // The dashboard may not have answered yet; the Random Walk contract never moves.
    randomWalkNft: contracts.randomWalkNft || protocolFacts.contractAddresses.randomWalkNft,
  });
  if (knownKey) return tFormats(`address.known.${knownKey}`);
  return metadata?.collection_name ?? metadata?.contract_name ?? undefined;
}
