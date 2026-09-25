import { useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { getContract, type Abi, type Client } from 'viem';

import { reportError } from '@/utils/errors';

/**
 * A read-only contract on the public client that preserves viem's ABI-level
 * type inference: each contract hook passes a `const`-asserted ABI, so the
 * returned contract has fully typed `.read` methods, plus its `address` and
 * `abi` for a write.
 *
 * There is deliberately no `.write`. Every transaction goes through
 * `useTxFlow`'s `ctx.writeContract`, the one write path: it runs the chain
 * guard, checks the target against the protocol's on-chain addresses,
 * simulates the call and drives the lifecycle toast. A second path here
 * would skip all of that.
 *
 * The contract is built on the public client only, so the hook keeps no
 * wallet-client query: a chain-pinned one fails (ConnectorChainMismatchError,
 * reported to Sentry) on every page, for as long as a connected wallet sits
 * on another network.
 */
export default function useContract<const TAbi extends Abi>(address: string, abi: TAbi) {
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!address || !abi || !publicClient) return null;
    try {
      return getContract({
        address: address as `0x${string}`,
        abi,
        client: publicClient as Client,
      });
    } catch (error) {
      reportError(error, 'useContract init');
      return null;
    }
  }, [address, abi, publicClient]);
}
