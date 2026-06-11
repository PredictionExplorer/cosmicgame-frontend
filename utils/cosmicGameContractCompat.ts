/**
 * V1 / V2 Cosmic Game contract compatibility helpers.
 *
 * Until mainnet upgrades to V2-only ABIs, the merged JSON ABI contains both
 * function signatures. Call sites try the legacy shape first and fall back to
 * V2 when the node reports an unrecognized selector.
 */

import { networkConfig } from '@/config/networks';

import cosmicGameJson from '@/contracts/CosmicGame.json';

import type { Abi, AbiFunction } from 'viem';

const cosmicGameAbiFull = cosmicGameJson as Abi;

/** Default min CST reward accepted on V2 bid entrypoints (0 = accept contract value). */
export const BID_CST_REWARD_AMOUNT_MIN_LIMIT_V2 = 0n;

export type CosmicGameBidFunctionName =
  | 'bidWithEth'
  | 'bidWithEthAndDonateNft'
  | 'bidWithEthAndDonateToken'
  | 'bidWithCst'
  | 'bidWithCstAndDonateNft'
  | 'bidWithCstAndDonateToken';

const UNRECOGNIZED_SELECTOR_MARKERS = [
  'function selector was not recognized',
  "there's no fallback function",
  'there is no fallback function',
  'method not found',
  'invalid opcode',
] as const;

function errorText(err: unknown): string {
  if (!(err instanceof Error)) return String(err ?? '');
  const extended = err as Error & {
    shortMessage?: string;
    details?: string;
    metaMessages?: string[];
    reason?: string;
  };
  return [
    err.message,
    extended.shortMessage,
    extended.details,
    extended.reason,
    ...(extended.metaMessages ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

/** True when the chain/proxy has no matching function for the attempted selector. */
export function isUnrecognizedSelectorError(err: unknown): boolean {
  const text = errorText(err).toLowerCase();
  if (UNRECOGNIZED_SELECTOR_MARKERS.some((m) => text.includes(m))) return true;

  const walkable = err as Error & { cause?: unknown };
  if (walkable.cause) return isUnrecognizedSelectorError(walkable.cause);
  return false;
}

/**
 * Try readers in order; skip unrecognized-selector failures and rethrow other errors.
 */
export async function readCosmicGameWithFallback<T>(
  readers: Array<() => Promise<T | undefined>>,
): Promise<T | undefined> {
  let lastSelectorError: unknown;
  for (const read of readers) {
    try {
      return await read();
    } catch (err) {
      if (isUnrecognizedSelectorError(err)) {
        lastSelectorError = err;
        continue;
      }
      throw err;
    }
  }
  if (lastSelectorError) throw lastSelectorError;
  return undefined;
}

/** Local Hardhat stack runs V2 after populate-old-v2; try V2 args first to avoid Rabby simulating a doomed V1 call. */
export function preferV2BidArgsFirst(): boolean {
  return networkConfig.chainId === 31337;
}

/** Narrow ABI slice for a single bid overload (avoids duplicate-name encoding ambiguity). */
export function pickBidWriteAbi(
  functionName: CosmicGameBidFunctionName,
  callArgs: readonly unknown[],
): Abi {
  const match = cosmicGameAbiFull.find(
    (item): item is AbiFunction =>
      item.type === 'function' &&
      item.name === functionName &&
      (item.inputs?.length ?? 0) === callArgs.length,
  );
  return match ? [match] : cosmicGameAbiFull;
}

/** Coerce gesture args to viem-friendly shapes before encoding. */
export function normalizeV1BidArgs(
  functionName: CosmicGameBidFunctionName,
  v1Args: readonly unknown[],
): readonly unknown[] {
  switch (functionName) {
    case 'bidWithEth':
    case 'bidWithEthAndDonateNft':
    case 'bidWithEthAndDonateToken':
      return [BigInt(v1Args[0] as number | bigint), v1Args[1], ...v1Args.slice(2)];
    case 'bidWithCst':
    case 'bidWithCstAndDonateNft':
    case 'bidWithCstAndDonateToken':
      return v1Args;
    default: {
      const _exhaustive: never = functionName;
      return _exhaustive;
    }
  }
}

/** Insert V2 `bidCstRewardAmountMinLimit_` after the message argument. */
export function bidArgsForV2(
  functionName: CosmicGameBidFunctionName,
  v1Args: readonly unknown[],
): readonly unknown[] {
  const minLimit = BID_CST_REWARD_AMOUNT_MIN_LIMIT_V2;
  switch (functionName) {
    case 'bidWithEth':
      return [v1Args[0], v1Args[1], minLimit];
    case 'bidWithEthAndDonateNft':
    case 'bidWithEthAndDonateToken':
    case 'bidWithCstAndDonateNft':
    case 'bidWithCstAndDonateToken':
      return [v1Args[0], v1Args[1], minLimit, v1Args[2], v1Args[3]];
    case 'bidWithCst':
      return [v1Args[0], v1Args[1], minLimit];
    default: {
      const _exhaustive: never = functionName;
      return _exhaustive;
    }
  }
}

/**
 * Run an async action with V1/V2 args, retrying the alternate shape on unrecognized selector.
 * On local Hardhat (chain 31337), V2 is tried first because populate-old-v2 upgrades the proxy.
 */
export async function withBidArgsV1ThenV2<T>(
  functionName: CosmicGameBidFunctionName,
  v1Args: readonly unknown[],
  run: (args: readonly unknown[]) => Promise<T>,
): Promise<T> {
  const normalized = normalizeV1BidArgs(functionName, v1Args);
  const v2Args = bidArgsForV2(functionName, normalized);
  const attempts = preferV2BidArgsFirst()
    ? [v2Args, normalized]
    : [normalized, v2Args];

  let lastSelectorError: unknown;
  for (const args of attempts) {
    try {
      return await run(args);
    } catch (err) {
      if (!isUnrecognizedSelectorError(err)) {
        throw err;
      }
      lastSelectorError = err;
    }
  }
  throw lastSelectorError;
}
