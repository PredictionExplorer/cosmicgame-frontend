import { useMemo } from 'react';
import { useConfig, usePublicClient } from 'wagmi';
import { writeContract, type Config } from '@wagmi/core';
import { getContract, type Abi, type Client, type Hash } from 'viem';

import { activeChain } from '@/config/chains';
import { ChainGuardError, ensureWalletOnRequiredChain } from '@/lib/chainGuard';
import { reportError } from '@/utils/errors';

type WriteFn = (...params: unknown[]) => Promise<Hash>;

/**
 * viem's contract `write.fn(args?, options?)` convention: the first parameter
 * is the argument array when the function takes arguments, otherwise options.
 */
function splitWriteParams(params: readonly unknown[]): {
  args: readonly unknown[] | undefined;
  options: Record<string, unknown>;
} {
  const hasArgs = params.length > 0 && Array.isArray(params[0]);
  const args = hasArgs ? (params[0] as readonly unknown[]) : undefined;
  const options = ((hasArgs ? params[1] : params[0]) ?? {}) as Record<string, unknown>;
  return { args, options };
}

/**
 * Writes that are chain-guarded and resolve the signer when they run.
 *
 * A viem contract built during render captures the wallet client of that
 * render. On the wrong chain wagmi has no client for the app chain, so the
 * captured contract could not write at all, and after a switch inside the
 * same click the old instance still pointed at the stale client. Routing each
 * write through the chain guard and wagmi's `writeContract(config, …)` means
 * every `contract.write.*` call first asks the wallet to switch (the wallet
 * prompts; nothing switches silently) and then signs with the current client.
 */
function createGuardedWrite(config: Config, address: `0x${string}`, abi: Abi) {
  return new Proxy({} as Record<string, WriteFn>, {
    get(_target, functionName) {
      if (typeof functionName !== 'string') return undefined;
      const write: WriteFn = async (...params) => {
        const status = await ensureWalletOnRequiredChain(config);
        if (status !== 'ok') throw new ChainGuardError(status);
        const { args, options } = splitWriteParams(params);
        return writeContract(config, {
          ...options,
          address,
          abi,
          functionName,
          ...(args ? { args } : {}),
          chainId: activeChain.id,
        } as unknown as Parameters<typeof writeContract>[1]);
      };
      return write;
    },
  });
}

/**
 * Generic contract hook that preserves viem's ABI-level type inference.
 * Each contract hook passes a `const`-asserted ABI, so the returned
 * contract has fully typed `.read` and `.write` methods.
 *
 * `.write.*` calls are chain-guarded (see `createGuardedWrite`): prefer
 * `useTxFlow` for new flows, which adds the lifecycle toast on top.
 *
 * The contract is built on the public client only. Writes resolve the signer
 * themselves when they run, so the hook keeps no wallet-client query: a
 * chain-pinned one fails (ConnectorChainMismatchError, reported to Sentry)
 * on every page, for as long as a connected wallet sits on another network.
 */
export default function useContract<const TAbi extends Abi>(address: string, abi: TAbi) {
  const config = useConfig();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!address || !abi || !publicClient) return null;
    try {
      const contract = getContract({
        address: address as `0x${string}`,
        abi,
        client: publicClient as Client,
      });
      const write = createGuardedWrite(config, address as `0x${string}`, abi);
      return Object.assign(contract, { write }) as typeof contract;
    } catch (error) {
      reportError(error, 'useContract init');
      return null;
    }
  }, [address, abi, config, publicClient]);
}
