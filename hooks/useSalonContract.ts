import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { cosmicGameV4Abi } from '@/contracts/abis';
import { cosmicSignatureArtAuctionAbi } from '@/contracts/generated';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

/** The query key of the salon contract's address (per chain and game). */
export const SALON_ADDRESS_QUERY_KEY = 'salonAddress';

const ZERO_ADDRESS = `0x${'0'.repeat(40)}`;

/**
 * The getter is genuinely absent (a V3 game), rather than the read having
 * failed: mirrors `isMissingGetter` in `lib/writeTargets`, plus the plain
 * revert older nodes answer an unknown selector with.
 */
function isMissingGetter(err: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = err;
  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);
    const node = current as { name?: unknown; message?: unknown; cause?: unknown };
    if (node.name === 'ContractFunctionZeroDataError') return true;
    const message = typeof node.message === 'string' ? node.message.toLowerCase() : '';
    if (
      message.includes('returned no data') ||
      message.includes('selector was not recognized') ||
      message.includes('execution reverted')
    ) {
      return true;
    }
    current = node.cause;
  }
  return false;
}

/**
 * The salon contract's address, read from the game proxy itself. The
 * dashboard API does not publish it, and the chain is the right source
 * anyway: offers carry ETH, so the address must come from the contract the
 * protocol names, not from an API response (`lib/writeTargets` enforces the
 * same rule before any write).
 *
 * On a chain still running V3 the getter reverts (or returns no data) and
 * the salon reads as absent: `address` settles `''`. A transport failure is
 * NOT absence — it rejects, retries, and surfaces as `isError`, so a flaky
 * first read is never cached as "no salon on this network".
 */
export function useSalonAddress(): { address: string; isPending: boolean; isError: boolean } {
  const { cosmicGame } = useContractAddresses();
  const publicClient = usePublicClient();

  const { data, isPending, isError } = useQuery({
    queryKey: [SALON_ADDRESS_QUERY_KEY, publicClient?.chain?.id ?? 0, cosmicGame],
    enabled: !!cosmicGame && !!publicClient,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const found = (await publicClient!.readContract({
          address: cosmicGame as `0x${string}`,
          abi: cosmicGameV4Abi,
          functionName: 'artAuction', // lexicon-allow-abi
        })) as string;
        return found && found.toLowerCase() !== ZERO_ADDRESS ? found : '';
      } catch (err) {
        // A V3 game has no such getter: the salon is absent, not broken.
        if (isMissingGetter(err)) return '';
        throw err;
      }
    },
  });

  return {
    address: data ?? '',
    // Until the dashboard names the game contract the salon is unknown, not
    // absent: the page shows its skeleton rather than "not on this network".
    isPending: !cosmicGame || !publicClient || isPending,
    isError,
  };
}

/**
 * The salon contract, read-only, with viem's full ABI-level typing
 * (`contracts/generated`, not the widened barrel). `null` until the address
 * is known; writes go through `useTxFlow` as everywhere else.
 */
export default function useSalonContract() {
  const { address } = useSalonAddress();
  return useContract(address, cosmicSignatureArtAuctionAbi);
}
