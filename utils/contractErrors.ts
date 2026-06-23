import { decodeErrorResult, formatEther, type Abi, type Hex } from 'viem';

import { cosmicGameAbi } from '@/contracts/abis';

/**
 * Contract-revert error helpers.
 *
 * These utilities import viem and deal exclusively with on-chain
 * revert decoding — they live in a separate module from
 * `utils/errors.ts` so that generic error-reporting consumers
 * (ErrorBoundary, globalErrorHandlers, the LandingShell) don't drag
 * viem into their bundle.
 */

/** Detects viem's `ContractFunctionExecutionError` (on-chain revert) by error name. */
export function isContractRevertError(err: unknown): boolean {
  return err instanceof Error && err.name === 'ContractFunctionExecutionError';
}

/** Detects reads against addresses with no bytecode in local/e2e environments. */
export function isEmptyContractReadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const message = err.message;
  if (
    message.includes('Cannot decode zero data ("0x")') ||
    message.includes('returned no data ("0x")')
  ) {
    return true;
  }

  const walkable = err as Error & { cause?: unknown; walk?: (fn: (e: Error) => boolean) => Error };
  if (typeof walkable.walk === 'function') {
    try {
      const inner = walkable.walk((e: Error) => isEmptyContractReadError(e));
      if (inner) return true;
    } catch {
      /* ignore */
    }
  }

  return isEmptyContractReadError(walkable.cause);
}

const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  InsufficientReceivedBidAmount:
    'The current Gesture Cost is greater than the amount you transferred.',
  UsedRandomWalkNft: 'This RandomWalk NFT has already been used for a gesture.',
  CallerIsNotNftOwner: 'You are not the owner of this NFT.',
  RoundIsInactive: 'The current cycle is not active.',
  TooLongBidMessage: 'Your gesture message is too long.',
  WrongBidType: 'Wrong gesture type selected.',
  FundTransferFailed: 'Fund transfer failed.',
  MainPrizeEarlyClaim: 'Not enough time has elapsed to retrieve the Signature Allocation.',
  MainPrizeClaimDenied:
    'Only the Last Participant is permitted to retrieve the Signature Allocation.',
  NoBidsPlacedInCurrentRound: 'No gestures have been made in the current cycle yet.',
};

type GestureCurrency = 'ETH' | 'CST';

interface ContractErrorOptions {
  gestureCurrency?: GestureCurrency;
  displayedPrice?: number;
  displayedPriceWei?: bigint | null;
}

/**
 * Extracts the custom error name from a viem `ContractFunctionRevertedError`
 * nested inside a `ContractFunctionExecutionError`.
 */
function extractContractErrorName(err: unknown): string | null {
  if (!(err instanceof Error)) return null;

  const walkable = err as Error & { cause?: unknown; walk?: (fn: (e: Error) => boolean) => Error };

  if (typeof walkable.walk === 'function') {
    const inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
    if (inner && 'data' in inner) {
      const data = (inner as Error & { data?: { errorName?: string; args?: unknown[] } }).data;
      if (data?.errorName) return data.errorName;
    }
  }

  if (walkable.cause instanceof Error) {
    return extractContractErrorName(walkable.cause);
  }

  return null;
}

/**
 * Returns a user-friendly error message for contract revert failures.
 * Decodes known contract custom errors and detects gesture-cost-rose scenarios.
 *
 * @param err - The caught error
 * @param displayedEthPrice - The ETH price (in ETH, not wei) shown to the user
 *   before submitting; used to compute the price-rose delta for
 *   `InsufficientReceivedBidAmount`.
 * @returns A friendly message string, or `null` to fall back to generic handling.
 */
export function getContractErrorMessage(
  err: unknown,
  optionsOrDisplayedEthPrice?: number | ContractErrorOptions,
): string | null {
  const errorName = extractContractErrorName(err);
  if (!errorName) return null;
  const options: ContractErrorOptions =
    typeof optionsOrDisplayedEthPrice === 'number'
      ? { gestureCurrency: 'ETH', displayedPrice: optionsOrDisplayedEthPrice }
      : (optionsOrDisplayedEthPrice ?? {});
  const gestureCurrency = options.gestureCurrency ?? 'ETH';

  if (
    errorName === 'InsufficientReceivedBidAmount' &&
    (options.displayedPrice !== undefined || options.displayedPriceWei != null)
  ) {
    const walkable = err as Error & { walk?: (fn: (e: Error) => boolean) => Error };
    if (typeof walkable.walk === 'function') {
      const inner = walkable.walk((e: Error) => e.name === 'ContractFunctionRevertedError');
      if (inner && 'data' in inner) {
        const data = (inner as Error & { data?: { args?: readonly unknown[] } }).data;
        const requiredWei = data?.args?.[1];
        if (typeof requiredWei === 'bigint') {
          const displayedPrice =
            options.displayedPrice ??
            (options.displayedPriceWei != null
              ? parseFloat(formatEther(options.displayedPriceWei))
              : 0);
          const requiredAmount = parseFloat(formatEther(requiredWei));
          const delta = requiredAmount - displayedPrice;
          if (delta > 0) {
            if (gestureCurrency === 'CST') {
              return (
                `CST Gesture Cost changed while your transaction was in transit, likely because another gesture landed first. ` +
                `The contract required ${requiredAmount.toFixed(6)} CST, above your ${displayedPrice.toFixed(6)} CST maximum. Refresh and try again.`
              );
            }
            return `Gesture Cost rose by ${delta.toFixed(6)} ETH while your transaction was in transit. The new required cost is ${requiredAmount.toFixed(6)} ETH. Please try again.`;
          }
        }
      }
    }
  }

  return CUSTOM_ERROR_MESSAGES[errorName] ?? null;
}

/**
 * Custom errors that the V2 bid paths can revert with but that are missing from
 * the generated `cosmicGameAbi` (the ABI has the V2 bid *functions* but not these
 * V2 error definitions). Regenerating the ABI from the V2 contracts would make
 * this list unnecessary — keep it in sync until then.
 */
const SUPPLEMENTAL_ERROR_ABI = [
  {
    type: 'error',
    name: 'BidCstRewardAmountMinLimitNotReached',
    inputs: [
      { name: 'bidCstRewardAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'bidCstRewardAmountMinLimit', type: 'uint256', internalType: 'uint256' },
    ],
  },
] as const;

/** Full ABI used only for decoding revert data (game ABI + supplemental V2 errors). */
const ERROR_DECODE_ABI = [...cosmicGameAbi, ...SUPPLEMENTAL_ERROR_ABI] as Abi;

/** Pulls the raw revert data (`0x<selector><args>`) out of a viem/wagmi error chain. */
function extractRevertData(err: unknown): Hex | undefined {
  const seen = new Set<unknown>();
  let e: unknown = err;
  while (e && typeof e === 'object' && !seen.has(e)) {
    seen.add(e);
    const node = e as { raw?: unknown; data?: unknown; cause?: unknown };
    if (typeof node.raw === 'string' && node.raw.startsWith('0x') && node.raw.length >= 10) {
      return node.raw as Hex;
    }
    if (typeof node.data === 'string' && node.data.startsWith('0x') && node.data.length >= 10) {
      return node.data as Hex;
    }
    e = node.cause;
  }
  const walkable = err as { walk?: (fn: (e: unknown) => boolean) => unknown };
  if (typeof walkable.walk === 'function') {
    const found = walkable.walk((x: unknown) => {
      const n = x as { raw?: unknown; data?: unknown };
      return (
        (typeof n?.raw === 'string' && n.raw.startsWith('0x')) ||
        (typeof n?.data === 'string' && n.data.startsWith('0x'))
      );
    }) as { raw?: unknown; data?: unknown } | null;
    const hex = (found?.raw ?? found?.data) as string | undefined;
    if (typeof hex === 'string' && hex.startsWith('0x') && hex.length >= 10) return hex as Hex;
  }
  return undefined;
}

/** Renders a single decoded argument value as a readable string. */
function formatArgValue(v: unknown): string {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return `[${v.map(formatArgValue).join(', ')}]`;
  if (v && typeof v === 'object') {
    return `{ ${Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${formatArgValue(val)}`)
      .join(', ')} }`;
  }
  return String(v);
}

/**
 * Decodes a contract revert into a human-readable custom error string with named
 * args, e.g. `CosmicSignatureErrors.BidCstRewardAmountMinLimitNotReached(
 * bidCstRewardAmount = 777777, bidCstRewardAmountMinLimit = 666666)`. Decodes
 * against the full game ABI plus supplemental V2 errors (the bid calls use a
 * narrow per-function ABI slice with no error defs). Returns `null` when the
 * error is not a decodable contract revert.
 */
export function formatCustomContractError(err: unknown): string | null {
  const data = extractRevertData(err);
  if (!data || data === '0x') return null;
  try {
    const decoded = decodeErrorResult({ abi: ERROR_DECODE_ABI, data });
    const name = decoded.errorName;
    const args = (decoded.args ?? []) as readonly unknown[];
    const inputs = ((decoded.abiItem as { inputs?: { name?: string }[] } | undefined)?.inputs ??
      []) as {
      name?: string;
    }[];

    // Built-in reverts: present them plainly rather than as a CosmicSignatureErrors.* call.
    if (name === 'Error') return `Revert: "${formatArgValue(args[0])}"`;
    if (name === 'Panic') return `Panic(${formatArgValue(args[0])})`;

    if (args.length === 0) return `CosmicSignatureErrors.${name}()`;
    const lines = args.map((a, i) => `  ${inputs[i]?.name ?? `arg${i}`} = ${formatArgValue(a)}`);
    return `CosmicSignatureErrors.${name}(\n${lines.join(',\n')}\n)`;
  } catch {
    return null;
  }
}
